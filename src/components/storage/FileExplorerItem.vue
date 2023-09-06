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
        @keypress.enter="renameItem"
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
    <div><span class="inline-block w-full text-right pr-10">{{ formattedSize }}</span></div>

    <!-- actions -->
    <div v-if="editing" class="flex space-x-2 items-center">
      <button @click="renameItem" class="item-action">
        <LoadingSpinner v-if="renaming" class="w-4" />
        <CheckIcon v-else class="w-4 text-green" />
      </button>
      <button @click="cancelEditing" class="item-action">
        <XIcon class="w-4 text-red" />
      </button>
    </div>
    <div v-else class="flex space-x-2 items-center">
      <button @click="startEditing" class="item-action hover:text-green">
        <PencilIcon class="w-4" />
      </button>
      <button @click="toggleDeleteConfirmationModal" class="item-action hover:text-red">
        <LoadingSpinner v-if="deleting" class="w-4" />
        <TrashIcon v-else class="w-4" />
      </button>
    </div>

    <!-- confirmation modal -->
    <FileExplorerItemDeleteConfirmation
      v-if="showDeleteConfirmationModal"
      :item="item"
      @modal-confirm="deleteItem"
      @modal-close="toggleDeleteConfirmationModal"
    />
  </div>
</template>

<script>
/* global process */

import * as api from '@/account-utils'
import * as format from '@/utils/format'
import FileExplorerItemDeleteConfirmation from '@/components/storage/FileExplorerItemDeleteConfirmation'
import LoadingSpinner from '@/components/icons/LoadingSpinner'
import { mapState } from 'vuex'
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
    FileExplorerItemDeleteConfirmation,
    FolderIcon,
    FolderOpenIcon,
    LoadingSpinner,
    PencilIcon,
    TrashIcon,
    XIcon
  },
  props: ['instance', 'item', 'path'],
  data() {
    return {
      deleting: false,
      editing: false,
      newName: this.item.filename || this.item.directory,
      renaming: false,
      showDeleteConfirmationModal: false
    }
  },
  computed: {
    ...mapState(['session']),
    formattedSize() {
      return this.item.size ? format.bytes(this.item.size) : ''
    }
  },
  methods: {
    cancelEditing() {
      this.editing = false
    },
    async deleteItem() {
      try {
        this.showDeleteConfirmationModal = false
        this.deleting = true
        if (this.item.filename) await api.storage.deleteFile(
          process.env.VUE_APP_ACCOUNT_API_URL,
          this.instance.apiKey,
          this.path,
          this.item.filename
        )
        else await api.storage.deleteDirectory(
          process.env.VUE_APP_ACCOUNT_API_URL,
          this.session._key,
          this.instance._key,
          this.path,
          this.item.directory
        )
        this.deleting = false
        this.$emit('delete')
      }
      catch (error) {
        console.error(error)
        this.deleting = false
      }
    },
    openDirectory(dir) {
      if (!this.path) this.$emit('update-path', (dir))
      else this.$emit('update-path', (this.path + '/' + dir))
    },
    async renameItem() {
      try {
        this.renaming = true
        if (this.item.filename) await api.storage.renameFile(
          process.env.VUE_APP_ACCOUNT_API_URL,
          this.instance.apiKey,
          this.path,
          this.item.filename,
          this.newName
        )
        else await api.storage.renameDirectory(
          process.env.VUE_APP_ACCOUNT_API_URL,
          this.session._key,
          this.instance._key,
          this.path,
          this.item.directory,
          this.newName
        )
        this.renaming = false
        this.cancelEditing()
        this.$emit('rename')
      }
      catch (error) {
        console.error(error)
        this.renaming = false
      }
    },
    async startEditing() {
      this.newName = this.item.filename || this.item.directory
      this.editing = true
      await this.$nextTick()
      this.$refs['new-name-input'].focus()
    },
    toggleDeleteConfirmationModal() {
      this.showDeleteConfirmationModal = !this.showDeleteConfirmationModal
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
  @apply cursor-pointer;
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
