<template>
  <div class="item-row">
    <!-- icons -->
    <FolderIcon class="w-4" />

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
        <CheckIcon class="w-4 text-green" />
      </button>
      <button @click="cancel" class="item-action">
        <XIcon class="w-4 text-red" />
      </button>
    </div>
  </div>
</template>

<script>
/* global process */

import * as api from '@/account-utils'
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
    XIcon
  },
  props: ['path'],
  data() {
    return {
      dirName: ''
    }
  },
  methods: {
    addDir() {
      this.$emit('add-dir', this.dirName)
    },
    cancel() {
      this.$emit('cancel')
    },
    test() {
      console.log('test')
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

.new-name-input {
  @apply border-b border-gray w-full box-border;
}
.new-name-input:focus {
  outline: none;
}
</style>
