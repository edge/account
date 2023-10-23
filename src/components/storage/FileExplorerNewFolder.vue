<template>
  <div class="item-row">
    <!-- icons -->
    <FolderIcon class="w-5 sm:w-4" />

    <!-- folder name -->
    <div>
      <!-- folder -->
      <input
        ref="name-input"
        v-model="name"
        @keypress.enter="submit"
        @keyup.esc="cancel"
        type="text"
        placeholder="Enter name"
        class="new-name-input"
      />
    </div>

    <!-- blank div for file size column -->
    <div></div>

    <!-- actions -->
    <div class="flex space-x-2 items-center">
      <button @click="submit" class="item-action">
        <LoadingSpinner v-if="loading" class="w-5 sm:w-4" />
        <CheckIcon v-else class="w-5 sm:w-4 text-green hover:text-green-300" />
      </button>
      <button @click="cancel" :disabled="loading" class="item-action">
        <XIcon class="w-5 sm:w-4 text-red hover:text-red-700" :class="loading && 'disabled'" />
      </button>
    </div>
  </div>
</template>

<script>
import LoadingSpinner from '@/components/icons/LoadingSpinner'
import {
  CheckIcon,
  FolderIcon,
  XIcon
} from '@heroicons/vue/outline'

export default {
  name: 'FileExplorerNewFolder',
  components: {
    CheckIcon,
    FolderIcon,
    LoadingSpinner,
    XIcon
  },
  props: ['loading'],
  data() {
    return {
      name: ''
    }
  },
  methods: {
    cancel() {
      this.$emit('cancel')
    },
    submit() {
      this.$emit('submit', this.name.trim())
    }
  },
  mounted() {
    this.$refs['name-input'].focus()
  }
}
</script>

<style scoped>
.item-row {
  @apply grid gap-x-4 items-center;
  grid-template-columns: max-content auto 150px max-content;
}
.item-action {
  @apply cursor-pointer hover:text-green;
}

.disabled {
  @apply cursor-default text-gray hover:text-gray;
}

.new-name-input {
  @apply border-b border-gray w-full box-border;
}
.new-name-input:focus {
  outline: none;
}
</style>
