<template>
  <div class="box">
    <h4>Resize your server</h4>

    <!-- eslint-disable-next-line max-len -->
    <p class="mt-3 text-gray-500">You are currently on the <b>XX plan</b> for <b>${{ currentHourlyCost }} per month</b>. Select an option below to resize your server.</p>

    <div class="w-full h-px my-10 bg-gray-300" />

    <ServerSpecs
      :currentHourlyCost=currentHourlyCost
      :hourlyCost=newHourlyCost
      :current=server
      @specs-changed="updateNewSpec"
    />

    <div class="relative mt-8">
      <button
        @click="toggleConfirmationModal"
        :disabled="isSaving || !haveSpecsChanged"
        class="h-full button button--success"
      >
        <span v-if="isSaving">Resizing</span>
        <span v-else>Resize</span>
        <span v-if="isSaving">
          <LoadingSpinner />
        </span>
      </button>
    </div>
    <!-- resize confirmation modal -->
    <ResizeConfirmation
      v-show=showConfirmationModal
      ref="destroyConfirmation"
      @modal-confirm=resizeServer
      @modal-close=toggleConfirmationModal
      :currentCost=currentHourlyCost
      :currentSpec=currentSpec
      :newCost=newHourlyCost
      :newSpec=newSpec
      :serverName="server.settings.hostname"
    />
  </div>
</template>

<script>
/* global process */

import * as utils from '../../account-utils'
import LoadingSpinner from '@/components/icons/LoadingSpinner'
import ResizeConfirmation from '@/components/confirmations/ResizeConfirmation'
import ServerSpecs from '@/components/deploy/ServerSpecs'
import { mapState } from 'vuex'

export default {
  name: 'ServerResize',
  props: ['region', 'server'],
  components: {
    LoadingSpinner,
    ResizeConfirmation,
    ServerSpecs
  },
  data: function () {
    return {
      isSaving: false,
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
    ...mapState(['account', 'session']),
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
    haveSpecsChanged() {
      const cpusChanged = this.currentSpec.cpus !== this.newSpec.cpus
      const diskChanged = this.currentSpec.disk !== this.newSpec.disk
      const ramChanged = this.currentSpec.ram !== this.newSpec.ram
      return cpusChanged || diskChanged || ramChanged
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
    async resizeServer () {
      try {
        const response = await utils.servers.resizeServer(
          process.env.VUE_APP_ACCOUNT_API_URL,
          this.session._key,
          this.server._key,
          this.newSpec
        )
        response.tasks.forEach(task => {
          this.$store.commit('addTask', task)
        })
        this.toggleConfirmationModal()
      }
      catch (error) {
        // TODO - handle error
        console.error(error)
      }
    },
    toggleConfirmationModal() {
      this.showConfirmationModal = !this.showConfirmationModal
    },
    updateNewSpec(newSpec) {
      this.newSpec = newSpec
    }
  }
}
</script>
<style scoped>
  .box {
    @apply p-4 md:p-6 bg-white rounded-lg w-full;
  }
</style>
