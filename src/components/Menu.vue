<template>
  <div>
    <ul class="main-nav">
      <li
        v-for="(item, index) in mainNav"
        :key="index"
        class="main-nav__item"
        :class="item.disabled ? 'disabled' : ''"
        @click="closeNav"
      >
        <router-link
          :to="item.link"
          class="main-nav__link"
          :class="location && isActive(item) ? 'router-link-active' : ''"
        >
          <span>{{item.text}}</span>
          <span v-if="item.beta" class="beta-tag">BETA</span>
        </router-link>
      </li>
    </ul>
    <div class="docs">
      <div class="docs-border"></div>
      <a class="docs-link" href="https://docs.edge.network/" target="_blank">
        <span class="book-icon">📖</span>
        <span class="label">Documentation</span>
        <span class="ext-icon"><ArrowTopRightOnSquareIcon/></span>
      </a>
    </div>
  </div>
</template>

<script>
import ArrowTopRightOnSquareIcon from './icons/ArrowTopRightOnSquareIcon'

export default {
  name: 'Menu',
  components: {
    ArrowTopRightOnSquareIcon
  },
  props: ['mainNav', 'closeNav'],
  data: function () {
    return {
      location: null
    }
  },
  methods: {
    isActive(item) {
      if (item.link === '/servers') return this.location.includes('/server')
      if (item.link === '/domains') return this.location.includes('/domain')
      if (item.link === '/cdn') return this.location.includes('/cdn')
      return item.link === this.location
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
    @apply block rounded-lg p-3 flex items-center;
    @apply hover:bg-gray-100 hover:bg-opacity-50;
  }

  .main-nav__link.router-link-active {
    @apply text-black bg-gray-100;
  }

  .main-nav__item.disabled {
    opacity: 0.3;
    pointer-events: none;
  }

  .docs {
    @apply pb-6;
  }

  .docs-border {
    @apply ml-3 mr-3 mt-4 mb-3 border-t-2;
  }

  .docs a {
    @apply flex flex-row block rounded-lg p-3;
    @apply hover:bg-gray-100 hover:bg-opacity-50;
  }

  .docs a .label {
    flex-grow: 2;
    @apply text-gray-900;
  }

  .docs a .book-icon {
    @apply relative mr-2 md:hidden lg:block;
    font-size: 14.5px;
  }

  .docs a .ext-icon svg {
    margin-top: -3px;
    stroke: #888888;
    width: 18px;
  }

  .beta-tag {
    @apply text-green font-bold border border-green rounded-lg px-1.5 py-0.5 ml-1;
    font-size: 0.5rem;
    line-height: 0.5rem;
  }
</style>
