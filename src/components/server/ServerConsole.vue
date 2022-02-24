<template>
  <div class="flex flex-col pb-20 space-y-5">
    <div class="box">
      <h4>Server Console</h4>
      <p class="mt-3 text-gray-500">Use the server console for native-like terminal access to your server from your browser.</p>
      <a target="_blank" :href="`/server/${server.id}/vnc`" class="h-full mt-5 lg:mt-0 button button--success">
        <span>Launch console in new window</span>
        <DuplicateIcon class="w-4 h-4 ml-2" />
      </a>
    </div>
  </div>
</template>

<script>
import {DuplicateIcon} from "@heroicons/vue/outline";

export default {
  name: 'ServerConsole',
  components: {DuplicateIcon},
  props: ['server']
}
</script>
<style scoped>
  .box {
    @apply bg-white rounded-lg w-full p-4 md:p-6;
  }
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
