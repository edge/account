<template>
  <button class="absolute flex items-center p-3 space-x-4 bg-white border border-gray-300 rounded-md top-8 right-8 focus:outline-none focus:ring-1 focus:ring-green-200 focus:ring-opacity-25">
    <span>3333 3810 7877 31616</span>
    <ChevronDownIcon class="w-5 h-5" />
  </button>
</template>

<script>
  import {ChevronDownIcon} from "@heroicons/vue/solid";
  export default {
    name: "UserNav",
    components: {ChevronDownIcon}
  }
</script>
<style scoped>
  
</style>