<template>
  <div class="mainContent__inner server">
    <h1>Edge Storage</h1>
    <div class="box">
      <span>Coming soon</span>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'Storage',
  title() {
    return 'Edge Account Portal » Storage'
  },
  computed: {
    ...mapState(['services'])
  },
  mounted() {
    const service = this.services.find(s => s._key === 'storage')
    if (!service || (!service.public && !service.beta)) this.$router.push({ name: 'Not Found' })
  }
}
</script>

<style scoped>
.mainContent__inner.server {
  @apply pt-0 mt-6;
}
</style>
