<template>
  <div class="mainContent__inner" v-if=domain>
    <h1>{{domain._key}}</h1>
    <div class="box mb-4">
      <!-- eslint-disable-next-line max-len -->
      <div class="float-left"><InformationCircleIcon class="w-5 mr-1"/></div>
      <span>You need to update your nameservers with your domain registrar in order for these records to work.
        <a href="" target="#" class="underline hover:text-green">Learn more</a>.
      </span>
    </div>

    <!-- add new dns record -->
    <div class="box">
      <h4 class="mb-2">Add a new record</h4>
      <NewRecordForm @createRecord=onCreateRecord />
    </div>

    <DomainRecordsList :domain=domain ref="recordsList" />
  </div>
</template>

<script>
/* global process */

import * as utils from '@/account-utils'
import DomainRecordsList from '@/components/domain/DomainRecordsList'
import { InformationCircleIcon } from '@heroicons/vue/outline'
import NewRecordForm from '@/components/domain/NewRecordForm'
import { mapState } from 'vuex'

export default {
  name: 'Domain',
  title() {
    return 'Edge Account Portal » Domain'
  },
  components: {
    DomainRecordsList,
    InformationCircleIcon,
    NewRecordForm
  },
  data() {
    return {
      domain: null,
      iDomain: null,
      loading: false
    }
  },
  computed: {
    ...mapState(['config', 'session']),
    domainName() {
      return this.$route.params.key
    }
  },
  methods: {
    onCreateRecord() {
      this.$refs.recordsList.updateRecords()
    },
    async updateDomain() {
      this.domain = await utils.dns.getZone(
        process.env.VUE_APP_ACCOUNT_API_URL,
        this.session._key,
        this.domainName
      )
    }
  },
  mounted() {
    this.loading = true
    this.updateDomain()
    this.iDomain = setInterval(() => {
      this.updateDomain()
    }, 5 * 1000)
    this.loading = false
  },
  unmounted() {
    clearInterval(this.iDomain)
    this.iDomain = null
  }
}
</script>
<style scoped>
.box {
  @apply w-full p-6 bg-white rounded-lg;
}
</style>
