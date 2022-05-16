<template>
  <div class="box">
    <h4>Resize your server</h4>

    <!-- eslint-disable-next-line max-len -->
    <p class="mt-3 text-gray-500">You are currently on the <b>XX plan</b> for <b>${{ currentCost }} per month</b>. Select an option below to resize your server.</p>

    <ResizeType :resizeTypes="resizeTypes" @resize-type-changed="updateResizeType" />

    <div class="w-full h-px my-10 bg-gray-300" />

    <ServerSpecs
      :currentCost=currentCost
      :calculatedCost=newCost
      :current=server
      :resizeType=selectedResizeType
      :selectedSpecs=selectedResizeSpecs
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
import ResizeType from '@/components/server/ResizeType'
import ServerSpecs from '@/components/deploy/ServerSpecs'
import { mapState } from 'vuex'

export default {
  name: 'ServerResize',
  props: ['activeTask', 'server'],
  components: {
    LoadingSpinner,
    ResizeType,
    ServerSpecs
  },
  data: function () {
    return {
      feedback: '',
      isSaving: false,
      newSpec: {
        cpus: null,
        disk: null,
        ram: null
      },
      polling: null,
      resizeTypes: [
        {
          id: 1,
          title: 'CPU and  RAM only',
          // eslint-disable-next-line max-len
          description: 'This will only increase or decrease the CPU and RAM of your server, not disk size. This can be reversed.',
          enabled: true
        },
        {
          id: 2,
          title: 'Disk, CPU and RAM',
          // eslint-disable-next-line max-len
          description: 'This will increase the disk size, CPU and RAM of your server. This is a permanent change and cannot be reversed.',
          enabled: true
        }
      ],
      selectedResizeType: null,
      selectedResizeSpecs: {},
      showFeedback: false,
      showStatus: false
    }
  },
  computed: {
    ...mapState(['account', 'session']),
    currentCost() {
      const region = this.server.region
      return (region.cost.ram * (this.currentSpec.ram / 1024)) +
        (region.cost.disk * (this.currentSpec.disk / 1024)) +
        (region.cost.cpus * this.currentSpec.cpus)
    },
    currentSpec() {
      return this.server.spec
    },
    haveSpecsChanged() {
      return JSON.stringify(this.currentSpec) !== JSON.stringify(this.newSpec)
    },
    newCost() {
      const region = this.server.region
      return (region.cost.ram * (this.newSpec.ram / 1024)) +
        (region.cost.disk * (this.newSpec.disk / 1024)) +
        (region.cost.cpus * this.newSpec.cpus)
    }
  },
  mounted() {
    this.selectedResizeType = this.resizeTypes[0]
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
    },
    updateResizeType(data) {
      this.selectedResizeType = data
    },
  },
  watch: {
    activeTask(value) {
      if (value === null) {
        clearInterval(this.polling)
        this.polling = null
      }
    }
  }
}
</script>
<style scoped>
  .box {
    @apply p-4 md:p-6 bg-white rounded-lg w-full;
  }
</style>
