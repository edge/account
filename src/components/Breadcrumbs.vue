<template>
  <div class="flex space-2 text-lg">
    <div v-for="(dir, index) in breadcrumbs" :key="dir">
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
</template>

<script>

export default {
  name: 'Breadcrumbs',
  props: ['path'],
  computed: {
    breadcrumbs() {
      return this.path.split('/')
    }
  },
  methods: {
    updatePath(index) {
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
