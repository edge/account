<template>
  <!--
    "@click.stop" is used on a number of elements to prevent event bubbling.
    This is so that clicking on a button or input doesn't also select/deselect the item.
  -->
  <div
    @click.exact="$emit('select-item', this.index)"
    @click.ctrl="$emit('select-item-ctrl', this.index)"
    @click.shift="$emit('select-item-shift', this.index)"
    class="item-row" :class="selected && 'selected'"
  >
    <!-- icons -->
    <!-- directory with files -->
    <FolderOpenIcon v-if="item.directory && item.children && item.children.length" class="icon w-4" />
    <!-- empty directory -->
    <FolderIcon v-else-if="item.directory" class="icon w-4" />
    <!-- file -->
    <DocumentTextIcon v-else-if="item.filename" class="icon w-4" />

    <!-- file/directory name -->
    <div class="truncate">
      <!-- edit name -->
      <input
        v-if="editing"
        ref="new-name-input"
        v-model="newName"
        @click.stop=""
        @keypress.enter="renameItem"
        @keyup.esc="cancelEditing"
        type="text"
        placeholder="Enter name"
        class="new-name-input"
      />
      <!-- display name -->
      <div v-else-if="itemName" class="truncate">
        <span class="name truncate select-none" @click.stop="onClickItemName">{{ itemName }}</span>
      </div>
    </div>

    <!-- file size -->
    <div class="hidden sm:block"><span class="inline-block w-full text-right pr-10 select-none">{{ formattedSize }}</span></div>

    <!-- actions -->
    <div v-if="editing" class="flex space-x-2 items-center">
      <button @click.stop="renameItem" :disabled="renaming" class="item-action">
        <LoadingSpinner v-if="renaming" class="w-4" />
        <CheckIcon v-else class="w-4 text-green hover:text-green-300" />
      </button>
      <button @click.stop="cancelEditing" :disabled="renaming" class="item-action">
        <XIcon class="w-4 text-red hover:text-red-700" :class="renaming && 'disabled'" />
      </button>
    </div>
    <div v-else class="flex space-x-2 items-center">
      <button @click.stop="startEditing" :disabled="deleting" class="item-action" >
        <PencilIcon class="w-4 hover:text-green" :class="deleting && 'disabled'" />
      </button>
      <button @click.stop="toggleDeleteConfirmationModal" :disabled="deleting" class="item-action text-red hover:text-red-700">
        <LoadingSpinner v-if="deleting" class="w-4" />
        <TrashIcon v-else class="w-4" />
      </button>
    </div>

    <!-- selected checkbox -->
    <div
      class="checkbox"
      @click.stop.exact="$emit('select-item-ctrl', this.index)"
      @click.stop.ctrl="$emit('select-item-ctrl', this.index)"
      @click.stop.shift="$emit('select-item-shift', this.index)"
      :class="selected && 'selected'"
    >
      <CheckIcon v-if="selected" class="w-4 h-4 text-white"/>
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
  props: ['integration', 'index', 'item', 'path'],
  data() {
    return {
      deleting: false,
      editing: false,
      newName: this.item.filename || this.item.directory,
      renaming: false,
      selected: false,
      showDeleteConfirmationModal: false
    }
  },
  computed: {
    ...mapState(['session']),
    formattedSize() {
      return this.item.size ? format.bytes(this.item.size) : ''
    },
    itemName() {
      return this.item.directory || this.item.filename
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
          this.integration.apiKey,
          this.path,
          this.item.filename
        )
        else await api.storage.deleteDirectory(
          process.env.VUE_APP_ACCOUNT_API_URL,
          this.session._key,
          this.integration._key,
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
    deselect() {
      this.selected = false
    },
    openDirectory() {
      if (!this.path) this.$emit('update-path', (this.item.directory))
      else this.$emit('update-path', (this.path + '/' + this.item.directory))
    },
    onClickItemName() {
      if (this.item.directory) this.openDirectory()
      else this.$emit('view-file', this.item)
    },
    async renameItem() {
      if (!this.newName) return
      try {
        this.renaming = true
        if (this.item.filename) await api.storage.renameFile(
          process.env.VUE_APP_ACCOUNT_API_URL,
          this.integration.apiKey,
          this.path,
          this.item.filename,
          this.newName.trim()
        )
        else await api.storage.renameDirectory(
          process.env.VUE_APP_ACCOUNT_API_URL,
          this.session._key,
          this.integration._key,
          this.path,
          this.item.directory,
          this.newName.trim()
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
      this.newName = this.itemName
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
.checkbox {
  @apply border border-gray-600 rounded-sm w-4 h-4 hover:border-green cursor-pointer flex items-center justify-center;
}
.checkbox.selected {
  @apply border-green bg-green;
}

.item-row .name {
  @apply cursor-pointer hover:text-green hover:underline;
}
.item-action {
  @apply cursor-pointer;
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
