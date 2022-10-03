<template>
  <div class="referralCode">
    <h4>Referral Code</h4>
    <!-- eslint-disable-next-line max-len -->
    <p class="text-gray-500">Edge provides a generous referral programme for new business to the network. The referral programme pays 10% of revenue for any business introduced. Full stop. Forever.</p>
    <!-- eslint-disable-next-line max-len -->
    <p class="text-gray-500">Just share the below link with new users and when they sign up your referral rewards will be paid monthly in XE directly to your account.</p>
    <p v-if="referralCount" class="text-gray-500">
      You currently have {{ referralCount }} referral{{referralCount > 1 ? 's' : ''}}.
    </p>
    <div v-if="referralCode" class="code-wrapper relative max-w-full overflow-hidden flex items-center">
      <span class="code">ed.ge/{{ referralCode }}</span>
      <button
        @click.prevent="copyToClipboard"
        class="copy__button"
      >
        <span>Copy</span>
        <DuplicateIcon class="ml-1 w-6 h-6" />
      </button>
      <div class="copied" :class="copied ? 'visible' : ''">Copied!</div>
    </div>
    <span v-else class="text-red">
      It looks like you don't currently have a referral code. Please contact support@edge.network.
    </span>
  </div>
</template>

<script>
/* global process */

import * as api from '@/account-utils/index'
import { DuplicateIcon } from '@heroicons/vue/outline'
import { mapState } from 'vuex'

export default {
  name: 'ReferralCode',
  data() {
    return {
      copied: false,
      iReferralCount: null,
      referralCount: null
    }
  },
  components: {
    DuplicateIcon
  },
  computed: {
    ...mapState(['account', 'session']),
    referralCode() {
      return this.account.referralCode || ''
    }
  },
  methods: {
    async copyToClipboard () {
      await navigator.clipboard.writeText(`https://ed.ge/${ this.referralCode }`)
      this.copied = true

      setTimeout(() => {
        this.copied = false
      }, 1000)
    },
    async updateReferralCount() {
      const { metadata } = await api.accounts.getReferrals(
        process.env.VUE_APP_ACCOUNT_API_URL,
        this.session._key
      )
      this.referralCount = metadata.totalCount
    }
  },
  mounted() {
    this.updateReferralCount()
    this.iReferralCount = setInterval(() => {
      this.updateReferralCount()
    }, 10000)
  },
  unmounted() {
    clearInterval(this.iReferralCount)
  }
}
</script>

<style scoped>
.referralCode h4 {
  @apply w-full mb-4 font-medium;
}

.code {
  @apply truncate text-lg text-green px-14 py-2 rounded-md rounded-r-none border border-gray border-r-0
}

.copy__button {
  @apply button button--success rounded-l-none py-2.5 pl-5 pr-3
}

.copied {
  @apply absolute pointer-events-none opacity-0 top-0 left-0 flex items-center justify-center w-full h-full font-medium bg-white bg-opacity-95 text-green;
  @apply transition-opacity duration-200 ease-in;
}
.copied.visible {
  @apply opacity-100;
}

@media (max-width: 450px) {
  /* split input and button into two rows */
  .code-wrapper {
    @apply flex-col w-full;
  }

  .code-wrapper .code {
    @apply w-full border-r rounded-r-md mb-2 px-2 text-center;
  }

  .code-wrapper .button {
    @apply w-full rounded-l-md px-0;
  }

  .qrcode {
    @apply justify-start items-start;
  }
}
</style>
