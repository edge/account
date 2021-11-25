<template>
  <div class="topNavigation">

    <!-- logo - hidden on larger screens -->
    <div class="md:hidden"><Logo size="small" /></div>

    <!-- burger - hidden on larger screens -->
    <div class="md:hidden"><BurgerButton /></div>
    <!-- search - hidden on small screens -->
    <div class="topNavigation__left"><Search size="large"/></div>

    <!-- user nav and deploy button - hidden on small screens -->
    <div class="topNavigation__right">
      <button class="h-full button button--success">Deploy Server</button>
      <UserMenu />
    </div>
  </div>
</template>

<script>
  import Logo from "@/components/Logo";
  import BurgerButton from "@/components/BurgerButton";
  import Search from "@/components/Search";
  import UserMenu from "@/components/UserMenu"

  export default {
    name: "TopNavigation",
    components: {
      Logo,
      BurgerButton,
      Search,
      UserMenu
    }
  }
</script>
<style scoped>
  .topNavigation {
    @apply sticky top-0 z-10 flex items-center justify-between w-full px-3 py-3 bg-white border-b border-gray-300;
    @apply md:px-5 lg:px-8 md:py-5 md:bg-gray-200 md:justify-end lg:justify-between;
  }
  .topNavigation__left {
    @apply hidden lg:block;
  }
  .topNavigation__right {
    @apply items-center hidden space-x-2 md:flex;
  }
</style>