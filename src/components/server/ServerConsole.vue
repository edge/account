<template>
  <div class="flex flex-col pb-20 space-y-4">
    <div class="box" v-if="!launched">
      <h4>Server Console</h4>
      <p class="mt-3 text-gray-500">
        Use the server console for native-like terminal access to your server from your browser.
      </p>
      <button @click="launch" class="h-full lg:mt-0 button button--success button--small">
        <span>Launch Console</span>
        <DuplicateIcon class="w-4 h-4 ml-2" />
      </button>
    </div>
    <div v-else>
      <Vnc :server=server @close-console=close />
    </div>
    <div v-if="consoleError" class="error__message">
      <span class="font-bold">Something went wrong</span>
      <!-- eslint-disable-next-line max-len -->
      <span>There was an issue launching the server console. Please try again, or contact support@edge.network if the issue persists.</span>
    </div>
  </div>
</template>

<script>
import { DuplicateIcon } from '@heroicons/vue/outline'
import Vnc from '@/views/Vnc'

export default {
  name: 'ServerConsole',
  components: {
    DuplicateIcon,
    Vnc
  },
  props: ['server'],
  data() {
    return {
      consoleError: false,
      launched: false
    }
  },
  methods: {
    close(hasError) {
      this.launched = false
      this.consoleError = hasError
    },
    launch() {
      this.launched = true
      this.consoleError = false
    }
  }
}
</script>
<style scoped>
.error__message {
  @apply flex flex-col bg-red text-white px-4 md:px-6 py-2 w-full rounded space-y-1;
}
</style>
