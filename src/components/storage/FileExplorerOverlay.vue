<template>
  <div class="file-explorer-overlay">
    <div class="panel">
      <div class="header">
        <div class="icon"><slot name="icon" /></div>
        <div class="mt-2 mb-4"><slot name="header" /></div>
      </div>
      <div class="my-4 px-4 text-sm text-gray-500">
        <slot name="body" />
        <div class="w-full my-4 flex flex-col-reverse sm:flex-row sm:space-x-4">
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
.file-explorer-overlay {
  @apply absolute top-0 left-0 w-full h-full bg-gray-800 bg-opacity-75 z-10 rounded-lg flex items-center justify-center;
}
.panel {
  @apply inline-block overflow-hidden text-left align-bottom transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:align-middle sm:max-w-md sm:w-full;
}
.icon {
  @apply flex items-center justify-center flex-shrink-0 mx-auto text-red rounded-full mb-2 mt-4 sm:mb-0 sm:mx-0;
}
.header {
  @apply flex flex-col w-full items-center text-2xl text-red border-b border-gray-300 bg-gray-200;
}
</style>
