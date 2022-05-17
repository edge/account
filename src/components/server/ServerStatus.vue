<template>
  <div>
    <Switch
      @click="toggleModal"
      :class="enabled ? 'bg-green' : 'bg-gray-300'"
      class="switch"
      :disabled="toggling"
    >
      <span class="sr-only">Use setting</span>
      <span
        class="label"
        :class="enabled ? 'justify-start text-white pl-3 md:pl-4' : 'justify-end text-gray-500 pr-2.5 md:pr-3.5'"
      >
        {{ toggling ? '' : enabled ? 'ON' : 'OFF' }}
        <LoadingSpinner v-if="toggling" />
      </span>
      <span
        aria-hidden="true"
        :class="enabled ? 'translate-x-9 md:translate-x-12' : 'translate-x-0'"
        class="transform ball"
      />
    </Switch>
    <Modal v-show="enabled" ref="modal" @modal-confirmation="toggleServer" />
  </div>
</template>

<script>
import LoadingSpinner from '@/components/icons/LoadingSpinner'
import Modal from '@/components/Modal'
import { Switch } from '@headlessui/vue'

export default {
  name: 'ServerStatus',
  props: ['server', 'onToggleStatus'],
  components: {
    LoadingSpinner,
    Modal,
    Switch
  },
  data() {
    return {
    }
  },
  computed: {
    enabled() {
      return this.server.status === 'active' || this.server.status === 'stopping'
    },
    toggling() {
      return this.server.status === 'starting' || this.server.status === 'stopping'
    }
  },
  methods: {
    toggleModal () {
      if (this.server.status === 'active') {
        this.$refs.modal.open = true
      }
      else {
        this.toggleServer()
      }
    },
    async toggleServer () {
      await this.onToggleStatus()
      this.$refs.modal.open = false
    }
  },
  mounted() {
  }
}
</script>
<style scoped>
  .switch {
    @apply relative inline-flex flex-shrink-0 transition-colors duration-200 ease-in-out border-2 border-transparent rounded-full cursor-pointer w-16 md:w-20 h-7 md:h-8 focus:outline-none;
  }
  .ball {
    @apply inline-block w-6 h-6 md:w-7 md:h-7 transition duration-200 ease-in-out bg-white rounded-full shadow-lg pointer-events-none ring-0;
  }
  .label {
    @apply absolute w-full h-full flex items-center text-xs leading-none;
  }
</style>
