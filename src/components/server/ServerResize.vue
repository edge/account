<template>
  <div>
    <div class="box">
      <h4>Resize your server</h4>
      <ServerSpecs
        :currentHourlyCost=currentHourlyCost
        :hourlyCost=newHourlyCost
        :current=server
        @specs-changed="updateNewSpec"
      />
    </div>
    <div class="flex flex-col relative my-5 space-y-2">
      <button
        @click="toggleConfirmationModal"
        :disabled=!canSubmitResize
        class="button button--success w-full md:max-w-xs"
      >
        <span v-if="isLoading">Resizing</span>
        <span v-else>Resize</span>
        <span v-if="isLoading" class="ml-2">
          <LoadingSpinner />
        </span>
      </button>
      <HttpError :error=httpError />
    </div>
    <!-- resize confirmation modal -->
    <ResizeConfirmation
      v-show=showConfirmationModal
      ref="destroyConfirmation"
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

import * as utils from '../../account-utils'
import HttpError from '@/components/HttpError'
import LoadingSpinner from '@/components/icons/LoadingSpinner'
import ResizeConfirmation from '@/components/confirmations/ResizeConfirmation'
import ServerSpecs from '@/components/deploy/ServerSpecs'
import { mapGetters, mapState } from 'vuex'

export default {
  name: 'ServerResize',
  props: ['disableActions', 'region', 'server'],
  components: {
    HttpError,
    LoadingSpinner,
    ResizeConfirmation,
    ServerSpecs
  },
  data: function () {
    return {
      httpError: '',
      isLoading: false,
      lastResizeTask: null,
      newSpec: {
        bandwidth: 10,
        cpus: null,
        disk: null,
        ram: null
      },
      showConfirmationModal: false
    }
  },
  computed: {
    ...mapGetters(['balanceSuspend', 'balanceWarning']),
    ...mapState(['account', 'session']),
    canSubmitResize() {
      if (this.balanceWarning || this.balanceSuspend) if (this.haveSpecsIncreased) return false
      // eslint-disable-next-line max-len
      if (this.isLoading || !this.haveSpecsChanged || this.diskSizeDecreased || this.disableActions || this.balanceSuspend) return false
      return true
    },
    currentHourlyCost() {
      return (
        (this.region.cost.bandwidth * (this.currentSpec.bandwidth || 10)) +
        (this.region.cost.ram * (this.currentSpec.ram)) +
        (this.region.cost.disk * (this.currentSpec.disk)) +
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
      const cpusChanged = this.currentSpec.cpus !== this.newSpec.cpus
      const diskChanged = this.currentSpec.disk !== this.newSpec.disk
      const ramChanged = this.currentSpec.ram !== this.newSpec.ram
      return cpusChanged || diskChanged || ramChanged
    },
    haveSpecsIncreased() {
      return ['ram', 'disk', 'cpus'].some(spec => {
        console.log(`${spec}: ${this.newSpec[spec] > this.currentSpec[spec]}`)
        return this.newSpec[spec] > this.currentSpec[spec]
      })
    },
    newHourlyCost() {
      return (
        (this.region.cost.bandwidth * this.newSpec.bandwidth) +
        (this.region.cost.ram * (this.newSpec.ram)) +
        (this.region.cost.disk * (this.newSpec.disk)) +
        (this.region.cost.cpus * this.newSpec.cpus)
      )
    }
  },
  methods: {
    async getLastResize() {
      const tasks = await utils.servers.getTasks(
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
        const response = await utils.servers.resizeServer(
          process.env.VUE_APP_ACCOUNT_API_URL,
          this.session._key,
          this.server._key,
          this.newSpec
        )
        response.tasks.forEach(task => {
          this.$store.commit('addTask', task)
        })
        this.isLoading = false
      }
      catch (error) {
        setTimeout(() => {
          this.httpError = error
          this.isLoading = false
        }, 500)
      }
    },
    toggleConfirmationModal() {
      this.showConfirmationModal = !this.showConfirmationModal
    },
    updateNewSpec(newSpec) {
      this.newSpec = newSpec
    }
  },
  mounted() {
    this.getLastResize()
  }
}
</script>
<style scoped>
  .box {
    @apply p-4 md:p-6 bg-white rounded-lg w-full;
  }
</style>
