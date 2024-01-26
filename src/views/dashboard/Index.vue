<template>
  <div></div>
</template>

<script>
import { mapState } from 'vuex'

const awaitRedirectTimeout = 5000

export default {
  name: 'Index',
  title() {
    return 'Edge Account Portal » Index'
  },
  data() {
    return {
      t: null
    }
  },
  computed: {
    ...mapState(['account', 'progress'])
  },
  methods: {
    gotoDefault() {
      clearTimeout(this.t)
      this.$router.replace({ name: 'CdnIntegrations' })
    },
    gotoGettingStarted() {
      clearTimeout(this.t)
      this.$router.replace({ name: 'Getting Started' })
    }
  },
  watch: {
    account(a) {
      if (a && a.isSetup) this.gotoDefault()
    },
    progress(p) {
      if (!p) return
      if (p.all) this.gotoDefault()
      else this.gotoGettingStarted()
    }
  },
  mounted() {
    this.t = setTimeout(() => {
      this.gotoDefault()
    }, awaitRedirectTimeout)
  }
}
</script>
