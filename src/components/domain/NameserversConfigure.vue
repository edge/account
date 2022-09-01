<template>
  <div class="box">
    <h4 class="mb-4">Configure Nameservers</h4>
    <!-- eslint-disable-next-line max-len -->
    <span>In order for Edge DNS to work for this domain, you need to configure the nameservers with your domain registrar to use the following:</span>
    <ul class="my-4 ml-4 space-y-2">
      <li v-for="ns in config.dns.nameservers" :key="ns" class="list-disc">{{ ns }}</li>
    </ul>
    <!-- eslint-disable-next-line max-len -->
    <span>Visit the wiki to learn more about <a class="underline hover:text-green cursor-pointer">how nameservers work</a>.</span>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'NameserversConfigure',
  computed: {
    ...mapState(['config'])
  }
}
</script>

<style scoped>

</style>
