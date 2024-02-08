<template>
  <div></div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'Index',
  title() {
    return 'Edge Account Portal » Index'
  },
  computed: {
    ...mapState(['account', 'progress'])
  },
  mounted() {
    // If user has finished account setup, redirect to cdn, otherwise, to getting started.
    const isSetup = this.account?.isSetup || this.progress?.all
    if (isSetup) this.$router.replace({ name: 'Content Delivery' })
    else this.$router.replace({ name: 'Getting Started' })
  }
}
</script>
