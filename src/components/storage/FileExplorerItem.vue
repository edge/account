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
      <input
        v-if="editing"
        ref="new-name-input"
        v-model="newName"
        @keypress.enter="saveNewName"
        @keyup.esc="cancelEditing"
        type="text"
        placeholder="Enter name"
        class="new-name-input"
      />
      <button
        v-else-if="item.directory"
        @click="openDirectory(item.directory)"
        class="dir-nav"
      >
        <span>{{ item.directory }}</span>
      </button>
      <!-- file -->
      <div v-else>
        <span>{{ item.filename }}</span>
      </div>
    </div>

    <!-- file size -->
    <div><span>{{ formattedSize }}</span></div>

    <!-- actions -->
    <div v-if="editing" class="flex space-x-2 items-center">
      <button @click="saveNewName" class="item-action">
        <CheckIcon class="w-4 text-green" />
      </button>
      <button @click="cancelEditing" class="item-action">
        <XIcon class="w-4 text-red" />
      </button>
    </div>
    <div v-else class="flex space-x-2 items-center">
      <button @click="startEditing" class="item-action">
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
  CheckIcon,
  DocumentTextIcon,
  FolderIcon,
  FolderOpenIcon,
  PencilIcon,
  TrashIcon,
  XIcon
} from '@heroicons/vue/outline'

export default {
  name: 'FileExplorerItem',
  components: {
    CheckIcon,
    DocumentTextIcon,
    FolderIcon,
    FolderOpenIcon,
    PencilIcon,
    TrashIcon,
    XIcon
  },
  props: ['path', 'item'],
  data() {
    return {
      editing: false,
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
    cancelEditing() {
      this.editing = false
    },
    openDirectory(dir) {
      if (!this.path) this.$emit('update-path', (dir))
      else this.$emit('update-path', (this.path + '/' + dir))
    },
    saveNewName() {
      this.$emit('update-name', this.newName)
    },
    startEditing() {
      this.newName = this.item.filename || this.item.directory
      this.editing = true
    },
    toggleDeleteConfirmationModal() {
      this.showDeleteConfirmationModal = !this.showDeleteConfirmationModal
    }
  },
  watch: {
    async editing() {
      if (this.editing) {
        await this.$nextTick()
        this.$refs['new-name-input'].focus()
      }
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

.new-name-input {
  @apply border-b border-gray w-full box-border;
}
.new-name-input:focus {
  outline: none;
}
</style>
