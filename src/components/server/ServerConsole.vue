<template>
  <div class="flex flex-col pb-20 space-y-4">
    <div class="box" v-if="!launched">
      <h4>Server Console</h4>
      <p class="mt-3 text-gray-500">
        Use the server console for native-like terminal access to your server from your browser.
      </p>
      <!-- <a target="_blank" :href="`/server/${server._key}/vnc`" class="h-full mt-4 lg:mt-0 button button--success">
        <span>Launch console in new window</span>
        <DuplicateIcon class="w-4 h-4 ml-2" />
      </a> -->
      <button @click="launch" class="h-full mt-4 lg:mt-0 button button--success button--small">
        <span>Launch Console</span>
        <DuplicateIcon class="w-4 h-4 ml-2" />
      </button>
    </div>
    <div v-else class="flex flex-col items-end">
      <button @click="close" class="h-full my-4 lg:mt-0 button button--error button--small max-w-lg">
        <span>Close Console</span>
        <XIcon class="w-4 h-4 ml-2" />
      </button>
      <Vnc />
    </div>
  </div>
</template>

<script>
import Vnc from '@/views/Vnc'
import { DuplicateIcon, XIcon } from '@heroicons/vue/outline'

export default {
  name: 'ServerConsole',
  components: {
    DuplicateIcon,
    XIcon,
    Vnc
  },
  props: ['server'],
  data() {
    return {
      launched: false
    }
  },
  methods: {
    close() {
      this.launched = false
    },
    launch() {
      this.launched = true
    }
  }
}
</script>
<style scoped>
  .tableHead {
    @apply border-gray-300 bg-gray-50 border-b rounded-lg w-full;
  }
  .tableHead__cell {
    @apply px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase;
  }
  .tableBody {
    @apply bg-white divide-y divide-gray-200;
  }
  .tableBody tr {
    /* @apply hover:bg-gray-50 transition duration-300; */
  }
  .tableBody__cell {
    @apply px-6 py-4 text-gray-500;
  }
</style>
