<template>
  <div class="modal-overlay">
    <div class="panel py-10 px-4">
      <div class="w-full flex space-x-2 justify-center">
        <LoadingSpinner />
        <span>Please wait while we verify your payment method</span>
      </div>
      <button
        v-if=showCancel
        @click=cancel
        class="button button--small button--outline w-full mt-4"
      >
        Cancel
      </button>
    </div>
  </div>
</template>

<script>
import LoadingSpinner from '@/components/icons/LoadingSpinner'

export default {
  name: 'StripeLoadingOverlay',
  components: {
    LoadingSpinner
  },
  data() {
    return {
      showCancel: false
    }
  },
  methods: {
    cancel() {
      this.$emit('cancel-stripe')
    }
  },
  mounted() {
    document.documentElement.style.overflow = 'hidden'
    setTimeout(() => {
      this.showCancel = true
    }, 15 * 1000)
  },
  unmounted() {
    document.documentElement.style.overflow = 'auto'
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
  @apply inline-block overflow-hidden text-left align-bottom transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:align-middle sm:max-w-md sm:w-full;
}
</style>
