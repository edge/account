<template>
  <div>
    <div class="box">
      <h4>Resize your server</h4>
      <ServerSpecs
        :current=server
        :currentHourlyCost=currentHourlyCost
        :hourlyCost=newHourlyCost
        :region=region
        @specs-changed="updateNewSpec"
      />
    </div>
    <!-- balance warning -->
    <div class="box mt-4 flex space-x-2" v-if="haveSpecsIncreased && (balanceSuspend || balanceWarning)">
        <div><ExclamationIcon class="w-5 text-red" /></div>
        <span class="text-red">You are unable to increase this server's specs while your available balance is below ${{ balance.threshold.warning.usd }}. Please add funds or set up automatic card payments to enable this service.</span>
    </div>
    <!-- resize button and errors -->
    <div class="flex flex-col relative my-4 space-y-2">
      <button
        @click="toggleConfirmationModal"
        :disabled=!canSubmitResize
        class="button button--success md:self-end w-full md:max-w-xs"
      >
        <span v-if="isLoading">Resizing</span>
        <span v-else>Resize</span>
        <span v-if="isLoading" class="ml-2">
          <LoadingSpinner />
        </span>
      </button>
      <div class="flex md:justify-end mt-2"><HttpError :error=httpError /></div>
      <div v-if=internalServerError class="server__error" :class="overCapacityError && 'over-capacity'">
        <span class="font-bold">{{
          overCapacityError
          ? "We're over capacity"
          : "Something went wrong"
        }}</span>
        <span>
          {{
            overCapacityError
            ? "It appears that we are at capacity in this region. We're working hard to increase this. Please check back soon."
            : "There was an issue while deploying this server. Please try again, or contact support@edge.network if the issue persists."
          }}
        </span>
      </div>
    </div>
    <!-- resize confirmation modal -->
    <ResizeServerConfirmation
      v-if=showConfirmationModal
      @modal-confirm=resizeServer
      @modal-close=toggleConfirmationModal
      :currentCost=currentHourlyCost
      :currentSpec=currentSpec
      :lastResizeTask="lastResizeTask"
      :newCost=newHourlyCost
      :newSpec=newSpec
      :serverName="server.settings.name || server.settings.hostname"
    />
  </div>
</template>

<script>
/* global process */

import * as api from '@/account-utils'
import { ExclamationIcon } from '@heroicons/vue/outline'
import HttpError from '@/components/HttpError'
import LoadingSpinner from '@/components/icons/LoadingSpinner'
import ResizeServerConfirmation from '@/components/confirmations/ResizeServerConfirmation'
import ServerSpecs from '@/components/server/deploy/ServerSpecs'
import { mapGetters, mapState } from 'vuex'

export default {
  name: 'ServerResize',
  props: ['disableActions', 'region', 'server'],
  components: {
    ExclamationIcon,
    HttpError,
    LoadingSpinner,
    ResizeServerConfirmation,
    ServerSpecs
  },
  data: function () {
    return {
      areSpecsValid: true,
      httpError: '',
      internalServerError: null,
      isLoading: false,
      lastResizeTask: null,
      newSpec: {
        bandwidth: null,
        cpus: null,
        disk: null,
        ram: null
      },
      showConfirmationModal: false
    }
  },
  computed: {
    ...mapGetters(['balanceSuspend', 'balanceWarning']),
    ...mapState(['account', 'balance', 'session']),
    canSubmitResize() {
      if (this.balanceWarning || this.balanceSuspend) if (this.haveSpecsIncreased) return false
      if (
        this.isLoading
        || !this.haveSpecsChanged
        || this.diskSizeDecreased
        || this.disableActions
        || this.balanceSuspend
        || !this.areSpecsValid
      ) return false
      return true
    },
    currentHourlyCost() {
      return (
        (this.region.cost.bandwidth * (this.currentSpec.bandwidth)) +
        (this.region.cost.ram * this.currentSpec.ram) +
        (this.region.cost.disk * this.currentSpec.disk) +
        (this.region.cost.cpus * this.currentSpec.cpus)
      )
    },
    currentSpec() {
      return this.server.spec
    },
    diskSizeDecreased() {
      return this.currentSpec.disk > this.newSpec.disk
    },
    haveSpecsChanged() {
      return ['bandwidth', 'ram', 'disk', 'cpus'].some(spec => this.newSpec[spec] !== this.currentSpec[spec])
    },
    haveSpecsIncreased() {
      return ['bandwidth', 'ram', 'disk', 'cpus'].some(spec => this.newSpec[spec] > this.currentSpec[spec])
    },
    newHourlyCost() {
      return (
        (this.region.cost.bandwidth * this.newSpec.bandwidth) +
        (this.region.cost.ram * this.newSpec.ram) +
        (this.region.cost.disk * this.newSpec.disk) +
        (this.region.cost.cpus * this.newSpec.cpus)
      )
    },
    overCapacityError() {
      return this.internalServerError && this.internalServerError.response.body.detail === 'there is no suitable node in cluster'
    }
  },
  methods: {
    async getLastResize() {
      const tasks = await api.servers.getTasks(
        process.env.VUE_APP_ACCOUNT_API_URL,
        this.session._key,
        this.server._key,
        {
          limit: 100
        }
      )
      this.lastResizeTask = tasks.results.filter(task => task.action === 'resizeResource')[0]
    },
    async resizeServer () {
      this.isLoading = true
      try {
        this.toggleConfirmationModal()
        const { tasks } = await api.servers.resizeServer(
          process.env.VUE_APP_ACCOUNT_API_URL,
          this.session._key,
          this.server._key,
          this.newSpec
        )
        tasks.forEach(task => {
          this.$store.commit('addTask', task)
        })
        this.isLoading = false
      }
      catch (error) {
        setTimeout(() => {
          if (error.status === 500) this.internalServerError = error
          else this.httpError = error
          this.isLoading = false
        }, 500)
      }
    },
    toggleConfirmationModal() {
      this.showConfirmationModal = !this.showConfirmationModal
    },
    updateNewSpec(newSpec, isValid) {
      this.newSpec = newSpec
      this.areSpecsValid = isValid
    }
  },
  mounted() {
    this.getLastResize()
  },
  watch: {
    httpError() {
      this.$emit('update-region')
    },
    newSpec() {
      this.internalServerError = null
    },
    internalServerError() {
      this.$emit('update-region')
    }
  }
}
</script>
<style scoped>
.server__error {
  @apply flex flex-col bg-red text-white p-4 w-full rounded space-y-1;
}

.server__error.over-capacity {
  @apply bg-blue-100 text-black;
}
</style>
