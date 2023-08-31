<template>
  <div class="item-row">
    <!-- icons -->
    <!-- directory with files -->
    <FolderOpenIcon v-if="item.directory && item.children && item.children.length"  class="w-4" />
    <!-- empty directory -->
    <FolderIcon v-else-if="item.directory" class="w-4" />
    <!-- file -->
    <DocumentTextIcon v-else-if="item.filename" class="w-4" />

    <!-- file/directory name -->
    <div>
      <!-- directory -->
      <button
        v-if="item.directory"
        @click="openDirectory(item.directory)"
        class="dir-nav"
      >
        {{ item.directory }}
      </button>
      <!-- file -->
      <span v-else>{{ item.filename }}</span>
    </div>

    <!-- file size -->
    <div><span>{{ formattedSize }}</span></div>

    <!-- actions -->
    <div class="flex space-x-2 items-center">
      <button @click="toggleEditing" class="item-action">
        <PencilIcon class="w-4" />
      </button>
      <button @click="toggleDeleteConfirmationModal" class="item-action">
        <TrashIcon class="w-4" />
      </button>
    </div>
  </div>
</template>

<script>
/* global process */

import * as api from '@/account-utils'
import LoadingSpinner from '@/components/icons/LoadingSpinner'
import {
  DocumentTextIcon,
  FolderIcon,
  FolderOpenIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/vue/outline'

export default {
  name: 'FileExplorerItem',
  components: {
    DocumentTextIcon,
    FolderIcon,
    FolderOpenIcon,
    PencilIcon,
    TrashIcon
  },
  props: ['path', 'item'],
  data() {
    return {
      editingName: false,
      newName: this.item.filename || this.item.directory,
      showDeleteConfirmationModal: false
    }
  },
  computed: {
    formattedSize() {
      return this.item.size
    }
  },
  methods: {
    openDirectory(dir) {
      if (!this.path) this.$emit('update-path', (dir))
      else this.$emit('update-path', (this.path + '/' + dir))
    },
    toggleDeleteConfirmationModal() {
      this.showDeleteConfirmationModal = !this.showDeleteConfirmationModal
    },
    toggleEditing() {
      this.editingName = !this.editingName
    }
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

.dir-nav {
  @apply hover:text-green;
}
</style>
