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
        @click="save"
        :disabled="isSaving || !haveSpecsChanged || activeTask"
        class="h-full button button--success"
      >
        <span v-if="isSaving">Resizing</span>
        <span v-else-if="activeTask">{{activeTask.status}}</span>
        <span v-else>Resize</span>
        <span v-if="isSaving || activeTask">
          <LoadingSpinner />
        </span>
      </button>
    </div>
  </div>
</template>

<script>
/* global process */

import * as utils from '../../account-utils'
import LoadingSpinner from '@/components/icons/LoadingSpinner'
import ServerSpecs from '@/components/deploy/ServerSpecs'
import { mapState } from 'vuex'

export default {
  name: 'ServerResize',
  props: ['activeTask', 'region', 'server'],
  components: {
    LoadingSpinner,
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
      }
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
      return JSON.stringify(this.currentSpec) !== JSON.stringify(this.newSpec)
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
    async save() {
      this.isSaving = true
      await this.resize()

      this.polling = setInterval(() => {
        if (!this.activeTask) {
          this.isSaving = false
        }
      }, 5000)
    },
    async resize () {
      if (!this.haveSpecsChanged) return

      const serverOptions = {
        ...this.server,
        region: this.server.region._key,
        spec: this.newSpec
      }

      try {
        const response = await utils.servers.updateServer(
          process.env.VUE_APP_ACCOUNT_API_URL,
          this.session._key,
          this.server._key,
          serverOptions
        )
        // TODO - handle successful response, waiting on API update
        console.log(response)
      }
      catch (error) {
        // TODO - handle error
        console.error(error)
      }
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
