<template>
  <div class="modal-overlay">
    <div class="panel">
      <div class="header">
        <div class="icon"><slot name="icon" /></div>
        <div class="mt-2 mb-4"><slot name="header" /></div>
      </div>
      <div class="my-8 px-8 text-sm text-gray-500">
        <slot name="body" />
        <div class="w-full my-8 sm:flex sm:space-x-4">
          <slot name="buttons" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>

export default {
  name: 'Modal',
  methods: {
    closeOnEscape(e) {
      if (e.key === 'Escape') {
        this.$emit('modal-close')
      }
    }
  },
  mounted() {
    window.addEventListener('keydown', this.closeOnEscape)
  },
  unmounted() {
    window.removeEventListener('keydown', this.closeOnEscape)
  }
}
</script>

<style scoped>
.modal-overlay {
  /* height and -top-5 position set because of a strange 1.25rem top margin I can't find */
  @apply fixed -top-5 left-0 w-screen bg-gray-800 bg-opacity-75 flex justify-center items-center z-40;
  height: calc(100vh + 1.25rem);
}
.panel {
  @apply inline-block overflow-hidden text-left align-bottom transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:align-middle sm:max-w-lg sm:w-full;
}
.icon {
  @apply flex items-center justify-center flex-shrink-0 mx-auto text-red rounded-full mb-2 mt-4 sm:mb-0 sm:mx-0;
}
.header {
  @apply flex flex-col w-full items-center text-2xl text-red border-b border-gray-300 bg-gray-200;
}
</style>
