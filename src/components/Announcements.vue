<template>
  <div class="w-11/12 flex flex-col space-y-4 z-50 mx-auto mt-8">
    <div
      v-for="announcement in announcements"
      :key="announcement._key"
      class="border border-gray bg-white rounded-md p-4 flex justify-between items-center"
    >
      <span class="text-lg"> {{ announcement.content }} </span>
      <button class="button button--success button--small">
        <span>Dismiss</span>
      </button>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'Announcements',
  computed: {
    ...mapState(['announcements'])
  }
}
</script>

<style scoped>

</style>
