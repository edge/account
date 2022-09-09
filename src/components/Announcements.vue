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
/* global process */

import * as utils from '@/account-utils'
import AnnouncementItem from '@/components/AnnouncementItem.vue'
import { mapState } from 'vuex'

export default {
  name: 'Announcements',
  components: {
    AnnouncementItem
  },
  computed: {
    ...mapState(['announcements', 'session'])
  },
  methods: {
    async dismissAnnouncement(id) {
      try {
        const res = await utils.announcements.dismissAnnouncements(
          process.env.VUE_APP_ACCOUNT_API_URL,
          this.session._key,
          [id]
        )
        if (res.ok) this.animateDismissal()
      }
      catch (error) {
        /** @todo handle error */
        console.error(error)
      }
    }
  }
}
</script>

<style scoped>

</style>
