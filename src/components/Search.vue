<template>
  <div class="search"
    :class="[
      (size === 'large' ? 'search--lge' : ''),
      (size === 'full' ? 'search--full' : ''),
      (border ? 'search--border' : ''),
      (background === 'transparent' ? 'search--transparent' : '')
    ]"
  >
    <input
      @keyup.enter="search"
      class="search__input"
      v-model="searchInput"
      type="text"
      placeholder="Search servers by IP, name, or tag"
    />
    <button
      class="search__submit"
      @click="search"
      :class="isSearching ? 'pointer-events-none' : ''"
    >
      <div class="search__icon" :class="isSearching ? 'animate-spin' : ''">
        <span v-if="isSearching">
          <svg class="w-full" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
            <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
            <line x1="12" y1="6" x2="12" y2="3" />
            <line x1="16.25" y1="7.75" x2="18.4" y2="5.6" />
            <line x1="18" y1="12" x2="21" y2="12" />
            <line x1="16.25" y1="16.25" x2="18.4" y2="18.4" />
            <line x1="12" y1="18" x2="12" y2="21" />
            <line x1="7.75" y1="16.25" x2="5.6" y2="18.4" />
            <line x1="6" y1="12" x2="3" y2="12" />
            <line x1="7.75" y1="7.75" x2="5.6" y2="5.6" />
          </svg>
        </span>
        <span v-else>
          <SearchIcon />
        </span>
      </div>
    </button>
  </div>
</template>

<script>
import { ArrowRightIcon, SearchIcon } from '@heroicons/vue/solid'

export default {
  name: 'Search',
  components: {
    ArrowRightIcon,
    SearchIcon
  },
  props: {
    size: {
      type: String
    },
    border: {
      type: Boolean
    },
    background: {
      type: String
    }
  },
  data() {
    return {
      isSearching: false,
      searchInput: ''
    }
  },
  methods: {
    async search() {
      this.isSearching = true
      // Emit the search input value to parent component
      this.$emit('search', this.searchInput)

      // Simulate an API search or processing delay
      setTimeout(() => {
        this.isSearching = false
      }, 1000)
    }
  }
}
</script>

<style scoped>
  .search {
    @apply relative bg-white rounded flex items-center h-11 py-2 pl-4 w-80 lg:w-96 md:mt-0;
  }
  .search--lge {
    @apply md:h-11 w-80 xl:w-96;
  }
  .search--full {
    @apply md:h-11 w-full lg:w-full;
  }
  .search--border {
    @apply border border-gray-300;
  }
  .search--transparent {
    @apply bg-transparent;
  }
  .search__input {
    @apply bg-transparent text-black rounded-r-none border-none h-full flex items-center w-full focus:outline-none !important;
  }
  .search__submit {
    @apply border-l border-gray-200 px-2 h-full text-green;
    @apply hover:text-green-100
  }
  .search--lge .search__submit {
    @apply md:px-5;
  }
  .search__icon {
    @apply w-5;
  }
  .search--lge .search__icon {
    @apply md:w-6;
  }
</style>
