<template>
  <div v-if="announcements.length" class="p-3 md:p-5 lg:p-8 mt-7 flex flex-col space-y-4 z-50">
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
    // for testing only
    // async resetAnnouncements() {
    //   const announcements = await utils.announcements.getAnnouncements(
    //     process.env.VUE_APP_ACCOUNT_API_URL,
    //     this.session._key
    //   )
    //   const ids = announcements.results.map(a => a._key)
    //   await utils.announcements.undismissAnnouncements(
    //     process.env.VUE_APP_ACCOUNT_API_URL,
    //     this.session._key,
    //     ids
    //   )
    // }
  }
  // for testing only
  // mounted() {
  //   this.resetAnnouncements()
  // }
}
</script>

<style scoped>

</style>
