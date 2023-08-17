<template>
  <th scope="col" :width="width" :class="param && 'cursor-pointer hover:underline'" @click="updateSort">
    <div class="flex space-2">
      <span>{{ header }}</span>
      <ArrowNarrowDownIcon v-if="isDesc" class="w-3 h-3" />
      <ArrowNarrowUpIcon v-if="isAsc" class="w-3 h-3" />
    </div>
  </th>
</template>

<script>
import { ArrowNarrowDownIcon, ArrowNarrowUpIcon } from '@heroicons/vue/solid'

export default {
  name: 'TableHeader',
  components: {
    ArrowNarrowDownIcon,
    ArrowNarrowUpIcon
  },
  props: [
    'header',
    'param',
    'sortQuery',
    'width'
  ],
  computed: {
    isAsc() {
      return this.param && this.param === this.sortQuery
    },
    isDesc() {
      return this.param && `-${this.param}` === this.sortQuery
    }
  },
  methods: {
    updateSort() {
      if (!this.param) return
      let newQuery = ''
      if (this.isAsc) newQuery = undefined
      else if (this.isDesc) newQuery = this.param
      else newQuery = `-${this.param}`
      this.$emit('update-sort', newQuery)
    }
  }
}
</script>

<style scoped>
</style>
