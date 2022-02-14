<template>
  <div class="flex flex-col pb-20 space-y-5">
    <div class="box">
      <h4>Server Console</h4>
      <p class="mt-3 text-gray-500">Use the server console for native-like terminal access to your server from your browser.</p>
      <div class="flex flex-col w-full p-4 mt-5 bg-gray-100 border-gray-300 rounded-lg lg:p-5 lg:space-x-4 lg:items-end lg:flex-row">
        <div class="flex-1 w-full lg:w-auto input-group">
          <label class="label">Login as</label>
          <input type="text" placeholder="root" :value=userName class="bg-transparent input input--floating" />
        </div>
        <div class="relative">
          <button @click="launchConsole(userName)" class="h-full mt-5 lg:mt-0 button button--success">
            <span>Launch console in new window</span>
            <DuplicateIcon class="w-4 h-4 ml-2" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {DuplicateIcon} from "@heroicons/vue/outline";

export default {
  name: 'ServerConsole',
  methods: {
  },
  data: function () {
    return {
      userName: 'root'
    }
  },
  watch: {
    $route(to, from) {
    }
  },
  components: {DuplicateIcon},
    methods: {
    launchConsole(userName) {
      window.open(`https://edge.network/?user=${userName}`, 'Edge Console', 'left=100,top=100,width=600,height=600');
    }
  }
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
