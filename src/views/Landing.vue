<template>
  <div class="landingPage">
    <div class="landingPage__left">
      <router-view />
    </div>
    <div class="landingPage__right">
      <!-- eslint-disable-next-line max-len -->
      <img src="https://images.unsplash.com/photo-1614777735430-7b46df56b404?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=664&q=80"
      class="object-cover w-full h-full"/>
    </div>
  </div>
</template>

<script>

export default {
  name: 'LandingPage',
  data() {
    return {
      accountNumber: ''
    }
  }
}
</script>
<style>
  .landingPage {
    @apply flex w-screen h-screen bg-white;
  }
  .landingPage__left {
    @apply flex justify-center items-start w-full h-full px-5 lg:w-1/2;
  }
  .landingPage__right {
    @apply hidden w-1/2 h-full lg:block fixed right-0;
  }
  .landingPage__content {
    @apply flex flex-col w-full my-auto space-y-8 py-10 sm:max-w-md;
  }
  .landingPage__form {
    @apply flex flex-col;
  }
</style>
