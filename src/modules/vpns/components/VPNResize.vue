<template>
  <div>
    <div class="box">
      <h4>Resize your VPN</h4>
      <!-- TODO -->
    </div>
    <!-- balance warning -->
    <div class="box mt-4 flex space-x-2" v-if="haveSpecsIncreased && (balanceSuspend || balanceWarning)">
        <div><ExclamationIcon class="w-5 text-red" /></div>
        <span class="text-red">You are unable to increase this VPN's specs while your available balance is below ${{ balance.threshold.warning.usd }}. Please add funds or set up Pay by Credit Card to enable this service.</span>
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
      <div v-if=internalServerError class="vpn__error" :class="overCapacityError && 'over-capacity'">
        <span class="font-bold">{{
          overCapacityError
          ? "We're over capacity"
          : "Something went wrong"
        }}</span>
        <span>
          {{
            overCapacityError
            ? "It appears that we are at capacity in this region. We're working hard to increase this. Please check back soon."
            : "There was an issue while deploying this VPN. Please try again, or contact support@edge.network if the issue persists."
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
      :serverName="vpn.name"
    />
  </div>
</template>

<script>
/* global process */

import * as utils from '@edge/account-utils'
import { ExclamationIcon } from '@heroicons/vue/outline'
import HttpError from '@/components/HttpError'
import LoadingSpinner from '@/components/icons/LoadingSpinner'
import ResizeServerConfirmation from '@/components/confirmations/ResizeServerConfirmation'
import { mapGetters, mapState } from 'vuex'

export default {
  name: 'ServerResize',
  props: ['disableActions', 'vpn'],
  components: {
    ExclamationIcon,
    HttpError,
    LoadingSpinner,
    ResizeServerConfirmation
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
    ...mapState(['config', 'session']),
    canSubmitResize() {
      if (this.balanceWarning || this.balanceSuspend) if (this.haveSpecsIncreased) return false
      // if (
      //   this.isLoading
      //   || !this.haveSpecsChanged
      //   || this.diskSizeDecreased
      //   || this.disableActions
      //   || this.balanceSuspend
      //   || !this.areSpecsValid
      // ) return false
      return true
    },
    currentHourlyCost() {
      if (this.vpn.multiuser) {
        const chargeableUsers = Math.max(0, this.vpn.users - this.config.vpn.multiuser.usersIncluded)
        const userCost = this.config.vpn.multiuser.costPerUser * chargeableUsers
        const periodCost = this.config.vpn.multiuser.cost + userCost
        const hourlyCost = periodCost / this.config.vpn.multiuser.costBasis
        return hourlyCost
      }

      return this.config.vpn.singleuser.cost / this.config.vpn.singleuser.costBasis
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
      return 0
    },
    overCapacityError() {
      return this.internalServerError && this.internalServerError.response.body.detail === 'there is no suitable node in cluster'
    }
  },
  methods: {
    async getLastResize() {
      const tasks = await utils.getServerTasks(process.env.VUE_APP_ACCOUNT_API_URL, this.session._key, this.vpn._key, {
        limit: 100
      })
      this.lastResizeTask = tasks.results.filter(task => task.action === 'resizeResource')[0]
    },
    async resizeServer () {
      this.isLoading = true
      try {
        this.toggleConfirmationModal()
        const { tasks } = await utils.resizeServer(process.env.VUE_APP_ACCOUNT_API_URL, this.session._key, this.vpn._key, {
          spec: this.newSpec
        })
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
    newSpec() {
      this.internalServerError = null
    }
  }
}
</script>
<style scoped>
.vpn__error {
  @apply flex flex-col bg-red text-white p-4 w-full rounded space-y-1;
}

.vpn__error.over-capacity {
  @apply bg-blue-100 text-black;
}
</style>
