<!-- This example requires Tailwind CSS v2.0+ -->
<template>
  <div class="modal-overlay">
    <div class="panel">
      <div class="header">
        <div class="icon"><slot name="icon" /></div>
        <div class="mt-2 mb-4"><slot name="header" /></div>
      </div>
      <div class="my-4 px-8 text-sm text-gray-500">
        <slot name="body" />
        <div class="w-full my-8 sm:flex sm:space-x-4">
          <button
            class="w-full button button--small button--error"
            @click="confirm"
          >
            <slot name="confirmButtonText" />
          </button>
          <button
            class="w-full mt-3 button button--small button--outline sm:mt-0"
            @click="close"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>

export default {
  name: 'ConfirmationModal',
  methods: {
    close() {
      this.$emit('modal-close')
    },
    confirm() {
      this.$emit('modal-confirm')
    }
  }
}
</script>

<style scoped>
.modal-overlay {
  /* -top-5 is set because there is a mt-5 applied somewhere that I can't find */
  @apply fixed -top-5 left-0 h-screen w-screen bg-gray-800 bg-opacity-75 flex justify-center items-center z-40;
}
.panel {
  @apply inline-block overflow-hidden text-left align-bottom transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:align-middle sm:max-w-lg sm:w-full;
}
.icon {
  @apply flex items-center justify-center flex-shrink-0 mx-auto text-red rounded-full mb-2 mt-4 sm:mb-0 sm:mx-0;
}
.header {
  @apply flex flex-col w-full items-center text-2xl text-red border-b border-gray-400;
}
</style>
