<template>
  <div class="space-y-4">
    <div class="box">
      <h4 class="mb-4">Configure Nameservers</h4>
      <!-- eslint-disable-next-line max-len -->
      <span>In order for Edge DNS to work for this domain, you will need to configure the nameservers with your domain registrar to use the following:</span>
      <ul class="my-4 space-y-2">
        <li v-for="ns in config.dns.nameservers" :key="ns" class="monospace">{{ ns }}</li>
      </ul>
      <!-- eslint-disable-next-line max-len -->
      <!-- <span>Visit the wiki to learn more about <a class="underline hover:text-green cursor-pointer">how nameservers work</a>.</span> -->
    </div>
    <div class="box">
      <h4 class="mb-4">Configure DNS</h4>
      <!-- eslint-disable-next-line max-len -->
      <span>In order for Edge CDN to work for the specified domains, you will need to configure the DNS records appropriately. Please ensure each domain added correctly points to <span class="monospace">gateway.{{ isTestnet ? 'test' : 'edge'}}.network</span>:</span>
      <ul class="my-4 space-y-2 overflow-x-auto">
        <li class="record">
          <span class="domain">Hostname</span>
          <span>Type</span>
          <span>Nameserver</span>
          <span>TTL</span>
        </li>
        <li class="record">
          <span class="domain monospace">cdn.example.com</span>
          <span class="monospace">CNAME</span>
          <span class="monospace">gateway.{{ isTestnet ? 'test' : 'edge'}}.network</span>
          <span class="monospace">3600</span>
        </li>
      </ul>
      <span>If you require any assistance, please contact support@edge.network</span>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'NameserversConfigure',
  computed: {
    ...mapState(['config', 'isTestnet'])
  }
}
</script>

<style scoped>
.record {
  @apply grid gap-x-4;
  grid-template-columns: 180px 50px 180px 50px
}
.record .domain {
  @apply truncate;
}
</style>
