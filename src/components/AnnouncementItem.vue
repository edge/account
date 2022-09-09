<template>
  <div
    v-if="!dismissed"
    class="w-full px-4 md:px-6 py-4 bg-white rounded-lg flex justify-between items-center space-x-2"
  >
    <div class="anc__text" v-html=announcementText></div>
    <button @click=dismissAnnouncement class="text-gray-500 hover:underline hidden sm:block">
      <span>Dismiss</span>
    </button>
    <button @click=dismissAnnouncement class="sm:hidden"><XIcon class="w-4 text-gray-500" /></button>
  </div>
</template>

<script>
/* global process */

import * as utils from '@/account-utils'
import MarkdownIt from 'markdown-it'
import { XIcon } from '@heroicons/vue/outline'
import { mapState } from 'vuex'

const md = new MarkdownIt()

export default {
  name: 'AnnouncementItem',
  props: ['announcement'],
  components: {
    XIcon
  },
  data() {
    return {
      dismissed: false
    }
  },
  computed: {
    ...mapState(['session']),
    announcementText() {
      return md.render(this.announcement.content)
    }
  },
  methods: {
    async dismissAnnouncement() {
      try {
        await utils.announcements.dismissAnnouncements(
          process.env.VUE_APP_ACCOUNT_API_URL,
          this.session._key,
          [this.announcement._key]
        )
        this.dismissed = true
      }
      catch (error) {
        // treat failure as success. On refresh user will have to re-dismiss
        this.dismissed = true
      }
    }
  }
}
</script>

<style>
.anc__text {
  @apply break-words;
}
.anc__text h1, .anc__text h2, .anc__text h3, .anc__text h4, .anc__text h5, .anc__text h6 {
  @apply mb-1;
  font-size: 0.95rem
}
.anc__text p {
  @apply mb-0;
}
.anc__text a {
  @apply mb-0 underline text-green hover:text-green-600 cursor-pointer;
}
</style>
