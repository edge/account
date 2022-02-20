<template>
  <div v-if="task" class="mt-2 statusPanel animate-pulse sm:mt-0">
    <RefreshIcon class="w-4 h-4 opacity-50 animate-spin" />
    <span>{{task.status}}</span>
  </div>
</template>

<script>
  import {RefreshIcon} from "@heroicons/vue/solid"

  export default {
    name: "ActiveTask",
    components: {RefreshIcon},
    props: {
      task: Object
    },
  }
</script>

<style scoped>
  .statusPanel {
    @apply px-2 py-1.5 h-full bg-white bg-opacity-75 border border-green-50 text-gray-600 rounded-lg text-sm flex items-center space-x-1;
  }
</style>