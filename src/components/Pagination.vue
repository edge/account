<template>
  <nav class="pagination" :class="border ? 'with-border' : ''">
    <ol class="pagination__list">
      <li
        class="pagination__item hide__mobile-small"
        :class="onFirstPage ? 'not-link' : 'link'"
        @click="changePage(1)"
      >
        <span class="hide__mobile">First</span>
        <span class="mobile__only"><ChevronDoubleLeftIcon/></span>
      </li>

      <li
        class="pagination__item"
        :class="onFirstPage ? 'not-link' : 'link'"
        @click="changePage(prevPage)"
      >
        <span><ChevronLeftIcon/></span>
      </li>

      <li class="pagination__item">
        <span class="hide__mobile mr-1">Page</span><span>{{ currentPage }} of {{ lastPage }}</span>

      </li>

      <li
        class="pagination__item"
        :class="onLastPage ? 'not-link' : 'link'"
        @click="changePage(nextPage)"
      >
        <span><ChevronRightIcon/></span>
      </li>

      <li
        class="pagination__item hide__mobile-small"
        :class="onLastPage ? 'not-link' : 'link'"
        @click="changePage(lastPage)"
      >
        <span class="hide__mobile">Last</span>
        <span class="mobile__only"><ChevronDoubleRightIcon/></span>
      </li>
    </ol>
  </nav>
</template>

<script>
import {ChevronDoubleLeftIcon, ChevronDoubleRightIcon, ChevronLeftIcon, ChevronRightIcon} from '@heroicons/vue/solid'

export default {
  name: 'Pagination',
  components: {
    ChevronDoubleLeftIcon,
    ChevronDoubleRightIcon,
    ChevronRightIcon,
    ChevronLeftIcon
  },
  props: [
    'border',
    'currentPage',
    'limit',
    'totalCount'
  ],
  computed: {
    lastPage() {
      return Math.ceil(this.totalCount / this.limit)
    },
    nextPage() {
      return this.currentPage + 1
    },
    onFirstPage() {
      return this.currentPage === 1
    },
    onLastPage() {
      return this.currentPage === this.lastPage
    },
    prevPage() {
      return this.currentPage - 1
    }
  },
  methods: {
    changePage(newPage) {
      if (newPage > this.lastPage || newPage < 1) return
      this.$emit('change-page', newPage)
    }
  }
}
</script>

<style scoped>
.pagination {
  @apply mt-4 w-full flex justify-center md:justify-end;
}

.pagination__list {
  @apply w-max flex items-center flex-wrap text-sm2 space-x-2;
}

.pagination.with-border .pagination__item {
  @apply border border-gray-300 rounded;
}

.pagination__item {
  @apply flex bg-white rounded text-gray-400 h-9 py-2 px-6 ;
}

.pagination__item span {
  @apply block;
}

.pagination__item.link span {
  @apply hover:text-green cursor-pointer;
}

.pagination__item.not-link span {
  @apply text-gray-300;
}

.pagination__item .active {
  @apply text-green;
}

.pagination__item svg {
  @apply w-5;
}

.pagination__item span.mobile__only {
  @apply hidden
}

@media (max-width: 550px) {
  .pagination__list {
    @apply space-x-1
  }

  .pagination__item span.hide__mobile {
    @apply hidden
  }

  .pagination__item span.mobile__only {
    @apply block
  }

  .pagination__item {
    @apply px-3
  }
}

@media (max-width: 350px) {
  .hide__mobile-small {
    @apply hidden
  }
}
</style>
