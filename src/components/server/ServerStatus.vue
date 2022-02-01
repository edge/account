<template>
  <Switch
    @click="toggleServer"
    :class="enabled ? 'bg-green' : 'bg-gray-300'"
    class="switch"
  >
    <span class="sr-only">Use setting</span>
    <span
      class="label"
      :class="enabled ? 'justify-start text-white pl-4' : 'justify-end text-gray-500 pr-3.5'"
      v-text="enabled ? 'ON' : 'OFF'"
    ></span>
    <span
      aria-hidden="true"
      :class="enabled ? 'translate-x-12' : 'translate-x-0'"
      class="transform ball"
    />
  </Switch>
  <Modal ref="modal" />
</template>

<script>
  import Modal from '@/components/Modal'
  import { ref } from 'vue'
  import { Switch } from '@headlessui/vue'
  export default {
    name: "ServerStatus",
    components: {
      Modal,
      Switch
    },
    methods: {
      toggleServer () {
        if (this.enabled) {
          this.$refs.modal.openModal()
        } else {
          // power back on 
          this.enabled = true
        }
      }
    },
    setup() {
      const enabled = ref(true)
      const showModal = ref(false)
      return { enabled }
    },
  }
</script>
<style scoped>
  .switch {
    @apply relative inline-flex flex-shrink-0 transition-colors duration-200 ease-in-out border-2 border-transparent rounded-full cursor-pointer w-20 h-8 focus:outline-none;
  }
  .ball {
    @apply inline-block w-7 h-7 transition duration-200 ease-in-out bg-white rounded-full shadow-lg pointer-events-none ring-0;
  }
  .label {
    @apply absolute w-full h-full flex items-center text-xs leading-none;
  }
</style>