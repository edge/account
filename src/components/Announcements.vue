<template>
  <div v-if="announcements.length" class="px-3 pt-3 md:px-5 md:pt-5 lg:px-8 lg:pt-8 flex flex-col space-y-4">
    <AnnouncementItem
      v-for="announcement in announcements"
      :key="announcement._key"
      :announcement=announcement
    />
  </div>
</template>

<script>
import AnnouncementItem from '@/components/AnnouncementItem.vue'
import { mapState } from 'vuex'

export default {
  name: 'Announcements',
  components: {
    AnnouncementItem
  },
  computed: {
    ...mapState(['announcements'])
  }
}
</script>

<style scoped>

</style>
