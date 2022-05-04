<template>
  <div class="landingPage">
    <div class="landingPage__left">
      <router-view />
    </div>
    <div class="landingPage__right">
      <img class="object-cover w-full h-full" src="https://images.unsplash.com/photo-1614777735430-7b46df56b404?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=664&q=80" />
    </div>
  </div>
</template>

<script>

export default {
  name: 'LandingPage',
  data() {
    return {
      accountNumber: '',
    }
  }
}
</script>
<style>
  .landingPage {
    @apply flex w-screen h-screen bg-white;
  }
  .landingPage__left {
    @apply flex justify-center w-full h-full px-5 lg:w-1/2;
  }
  .landingPage__right {
    @apply hidden w-1/2 h-full lg:block;
  }
  .landingPage__content {
    @apply flex flex-col w-full my-auto space-y-8 py-10 sm:max-w-md;
  }
  .landingPage__form {
    @apply flex flex-col space-y-6;
  }
</style>
