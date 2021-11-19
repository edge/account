
<template>
  <ul class="main-nav">
    <li
      v-for="(item, index) in mainNav"
      :key="index"
      class="main-nav__item"
      :class="item.disabled ? 'disabled' : ''"
    >
      <router-link
        :to="item.link"
        class="main-nav__link"
        :class="location && (item.text === location) ? 'router-link-active' : ''"
      >
        {{item.text}}
      </router-link>
    </li>
  </ul>
</template>

<script>
export default {
  name: "Menu",
  props: ["mainNav"],
  data: function () {
    return {
      location: null
    }
  },
  mounted() {
    this.location = window.location.pathname
  }
}
</script>

<style scoped>
  .main-nav {
    @apply flex flex-col w-full space-y-1;
  }
  .main-nav__link {
    @apply block rounded-lg p-3;
    @apply hover:bg-gray-100 hover:bg-opacity-50;
  }

  .main-nav__link.router-link-active {
    @apply text-black bg-gray-100;
  }

  .main-nav__item.disabled {
    opacity: 0.3;
    pointer-events: none;
  }
</style>