<template>
  <div class="item-row">
    <!-- icons -->
    <FolderIcon class="w-5 sm:w-4" />

    <!-- file/directory name -->
    <div>
      <!-- directory -->
      <input
        ref="new-dir-input"
        v-model="dirName"
        @keypress.enter="addDir"
        @keyup.esc="cancel"
        type="text"
        placeholder="Enter name"
        class="new-name-input"
      />
    </div>

    <!-- file size -->
    <div></div>

    <!-- actions -->
    <div class="flex space-x-2 items-center">
      <button @click="addDir" class="item-action">
        <LoadingSpinner v-if="creating" class="w-5 sm:w-4" />
        <CheckIcon v-else class="w-5 sm:w-4 text-green hover:text-green-300" />
      </button>
      <button @click="cancel" :disabled="creating" class="item-action">
        <XIcon class="w-5 sm:w-4 text-red hover:text-red-700" :class="creating && 'disabled'" />
      </button>
    </div>
  </div>
</template>

<script>
/* global process */

import LoadingSpinner from '@/components/icons/LoadingSpinner'
import {
  CheckIcon,
  FolderIcon,
  XIcon
} from '@heroicons/vue/outline'

export default {
  name: 'FileExplorerItem',
  components: {
    CheckIcon,
    FolderIcon,
    LoadingSpinner,
    XIcon
  },
  props: ['creating', 'path'],
  data() {
    return {
      dirName: ''
    }
  },
  methods: {
    addDir() {
      this.$emit('add-dir', this.dirName.trim())
    },
    cancel() {
      this.$emit('cancel')
    }
  },
  mounted() {
    this.$refs['new-dir-input'].focus()
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
