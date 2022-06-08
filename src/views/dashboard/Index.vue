<template>
  <div></div>
</template>

<script>

export default {
  name: 'Index',
  title() {
    return 'Edge Account Portal » Index'
  },
  components: {
  },
  computed: {
  },
  methods: {
  },
  mounted() {
    this.$router.replace({ name: 'Servers' })
  }
}
</script>

<style scoped>
</style>
