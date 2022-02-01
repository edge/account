<template>
  <div class="flex flex-col pb-20 space-y-5">
    <div class="box">
      <h4>Destroy server and backups</h4>
      <p class="mt-3 mb-1 text-gray-500">This is irreversible. All server data and associated backups will be irretrievable.</p>
      <p class="text-gray-500">Upon destruction, you will no longer be billed for this server.</p>
      <button class="mt-5 button button--error">Destroy this server and backups</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Destroy',
  components: {
  },
  // props: ['data'],
  data: function () {
    return {
      isSaving: false,
      feedback: '',
      showFeedback: false
    }
  },
  watch: {
    $route(to, from) {
    }
  },
  methods: {
    async save () {
      this.isSaving = true
      this.showStatus = true
    }
  }
}
</script>
<style scoped>
  .box {
    @apply bg-white rounded-lg w-full p-6;
  }
</style>
