<template>
  <div
    class="landingPage"
    style="background-image: url(/assets/edge-bg-map.png);
      background-repeat: no-repeat;
      background-size: cover;"
  >
    <div class="landingPage__left">
      <router-view />
    </div>
  </div>
</template>

<script>

export default {
  name: 'LandingPage',
  computed: {
    filePath() {
      return '/assets/edge-bg-map.png'
    }
  },
  mounted() {
    this.$store.dispatch('updateConfig')
  }
}
</script>
<style>
  .landingPage {
    @apply flex w-screen bg-white;
    height: 100vh;
    height: calc(var(--vh, 1vh) * 100);
  }
  .landingPage__left {
    @apply flex justify-center items-start w-full h-full px-5 lg:w-1/2 z-10;
  }
  .landingPage__right {
    @apply absolute left-0 z-0;
  }
  .landingPage__content {
    @apply flex flex-col w-full my-auto space-y-8 py-10 sm:max-w-md;
  }
  .landingPage__form {
    @apply flex flex-col;
  }
</style>
