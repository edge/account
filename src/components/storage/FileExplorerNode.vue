<template>
  <!--
    "@click.stop" is used on a number of elements to prevent event bubbling.
    This is so that clicking on a button or input doesn't also select/deselect the node.
  -->
  <div
    @click.exact="$emit('select-node', this.index)"
    @click.ctrl="$emit('select-node-ctrl', this.index)"
    @click.shift="$emit('select-node-shift', this.index)"
    class="node-row" :class="selected && 'selected'"
  >
    <!-- icons -->
    <!-- empty folder -->
    <FolderIcon v-if="isFolder" class="icon w-5 sm:w-4" />
    <!-- file -->
    <DocumentTextIcon v-else class="icon w-5 sm:w-4" />

    <!-- file/folder name -->
    <div class="truncate">
      <!-- edit name -->
      <input
        v-if="editing"
        ref="new-name-input"
        v-model="newName"
        @click.stop=""
        @keypress.enter="renameNode"
        @keyup.esc="cancelEditing"
        type="text"
        placeholder="Enter name"
        class="new-name-input"
      />
      <!-- display name -->
      <div v-else-if="nodeName" class="truncate">
        <span class="name truncate select-none" @click.stop="onClickNodeName">{{ nodeName }}</span>
      </div>
    </div>

    <!-- file size -->
    <div class="hidden sm:block"><span class="inline-block w-full text-right pr-10 select-none">{{ formattedSize }}</span></div>

    <!-- actions -->
    <div v-if="editing" class="flex space-x-2 items-center">
      <button @click.stop="renameNode" :disabled="renaming" class="node-action">
        <LoadingSpinner v-if="renaming" class="w-5 sm:w-4" />
        <CheckIcon v-else class="w-5 sm:w-4 text-green hover:text-green-300" />
      </button>
      <button @click.stop="cancelEditing" :disabled="renaming" class="node-action">
        <XIcon class="w-5 sm:w-4 text-red hover:text-red-700" :class="renaming && 'disabled'" />
      </button>
    </div>
    <div v-else class="flex space-x-2 items-center">
      <button @click.stop="startEditing" :disabled="deleting" class="node-action" >
        <PencilIcon class="w-5 sm:w-4 hover:text-green" :class="deleting && 'disabled'" />
      </button>
      <button @click.stop="toggleDeleteConfirmationModal" :disabled="deleting" class="node-action text-red hover:text-red-700">
        <LoadingSpinner v-if="deleting" class="w-5 sm:w-4" />
        <TrashIcon v-else class="w-5 sm:w-4" />
      </button>
    </div>

    <!-- selected checkbox -->
    <div
      class="checkbox"
      @click.stop.exact="$emit('select-node-ctrl', this.index)"
      @click.stop.ctrl="$emit('select-node-ctrl', this.index)"
      @click.stop.shift="$emit('select-node-shift', this.index)"
      :class="selected && 'selected'"
    >
      <CheckIcon v-if="selected" class="w-5 sm:w-4 h-4 text-white"/>
    </div>

    <!-- confirmation modal -->
    <FileExplorerNodeDeleteConfirmation
      v-if="showDeleteConfirmationModal"
      :nodes="[node]"
      @modal-confirm="deleteNode"
      @modal-close="toggleDeleteConfirmationModal"
    />
  </div>
</template>

<script>
/* global process */

import * as api from '@/account-utils'
import * as format from '@/utils/format'
import FileExplorerNodeDeleteConfirmation from '@/components/storage/FileExplorerNodeDeleteConfirmation'
import LoadingSpinner from '@/components/icons/LoadingSpinner'
import { mapState } from 'vuex'
import {
  CheckIcon,
  DocumentTextIcon,
  FolderIcon,
  PencilIcon,
  TrashIcon,
  XIcon
} from '@heroicons/vue/outline'

export default {
  name: 'FileExplorerNode',
  components: {
    CheckIcon,
    DocumentTextIcon,
    FileExplorerNodeDeleteConfirmation,
    FolderIcon,
    LoadingSpinner,
    PencilIcon,
    TrashIcon,
    XIcon
  },
  props: ['integration', 'index', 'node', 'path'],
  data() {
    return {
      deleting: false,
      editing: false,
      newName: this.node.filename || this.node.folder,
      renaming: false,
      selected: false,
      showDeleteConfirmationModal: false
    }
  },
  computed: {
    ...mapState(['session']),
    formattedSize() {
      return this.node.size ? format.bytes(this.node.size) : ''
    },
    isFolder() {
      return !this.node.file
    },
    nodeName() {
      const parts = this.node.fullPath.split('/')
      return parts[parts.length - 1]
    }
  },
  methods: {
    cancelEditing() {
      this.editing = false
    },
    async deleteNode() {
      try {
        this.showDeleteConfirmationModal = false
        this.deleting = true
        await api.files.deleteNode(
          process.env.VUE_APP_ACCOUNT_API_URL,
          this.session._key,
          this.integration._key,
          this.node.fullPath
        )
        this.$emit('delete')
      }
      catch (error) {
        console.error(error)
      }
      finally {
        this.deleting = false
      }
    },
    deselect() {
      this.selected = false
    },
    openDirectory() {
      this.$emit('update-path', (this.node.fullPath))
    },
    onClickNodeName() {
      if (this.isFolder) this.openDirectory()
      else this.$emit('view-file', this.node)
    },
    async renameNode() {
      if (!this.newName) return
      try {
        this.renaming = true
        if (this.node.filename) await api.files.renameFile(
          process.env.VUE_APP_ACCOUNT_API_URL,
          this.integration.data.config.apiKey,
          this.path,
          this.node.filename,
          this.newName.trim()
        )
        else await api.files.renameDirectory(
          process.env.VUE_APP_ACCOUNT_API_URL,
          this.session._key,
          this.integration._key,
          this.path,
          this.node.folder,
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
      this.newName = this.nodeName
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

.node-row .name {
  @apply cursor-pointer hover:text-green hover:underline;
}
.node-action {
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
