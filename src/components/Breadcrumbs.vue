<template>
  <div class="flex items-center">
    <HomeIcon
      @click="updatePath(-1)"
      class="w-5 mr-2 path"
      :class="!breadcrumbs && 'last'"
    />
    <div v-if="breadcrumbs" class="flex space-2 text-md">
      <div
        v-for="(dir, index) in breadcrumbs"
        :key="dir"
      >
        <span class="mr-2">/</span>
        <span
          @click="updatePath(index)"
          class="path mr-2"
          :class="index === breadcrumbs.length - 1 && 'last'"
        >
          {{ dir }}
        </span>
      </div>
    </div>
  </div>
</template>

<script>
import {
  HomeIcon
} from '@heroicons/vue/outline'

export default {
  name: 'Breadcrumbs',
  components: {
    HomeIcon
  },
  props: ['path'],
  computed: {
    breadcrumbs() {
      if (this.path) return this.path.split('/')
      return null
    }
  },
  methods: {
    updatePath(index) {
      if (index < 0) {
        this.$emit('update-path', '')
        return
      }
      if (index === this.breadcrumbs.length - 1) return
      const newPath = this.breadcrumbs.slice(0, index + 1).join('/')
      this.$emit('update-path', newPath)
    }
  }
}
</script>

<style scoped>
.path {
  @apply cursor-pointer hover:underline;
}
.path.last {
  @apply text-green cursor-default hover:no-underline;
}
</style>
