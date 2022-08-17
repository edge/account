<template>
  <div id="app" class="app">
    <router-view :key="$route.fullPath" />
  </div>
</template>

<script>
export default {
  title() {
    return 'Edge Account Portal'
  },
  methods: {
    setViewHeight: function() {
      const vh = window.innerHeight * 0.01
      document.documentElement.style.setProperty('--vh', `${vh}px`)
    }
  },
  mounted: function() {
    this.setViewHeight()
    window.addEventListener('resize', () => {
      this.setViewHeight()
    })
  }
}
</script>

<style>
.app {
  @apply bg-gray-200;
  min-height: 100vh;
  min-height: calc(var(--vh, 1vh) * 100);
}
</style>
