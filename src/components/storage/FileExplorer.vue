<template>
  <div class="file-explorer box"
    @dragenter.prevent="onFileDragEnter"
    @dragleave.prevent="onFileDragExit"
  >
    <!-- overlays -->
    <FileUploadOverlay
      v-show="showFileUploadOverlay"
      :integration="integration"
      :path="path"
      @drop-file="resetDragCounter"
      @close="closeFileUploadOverlay"
      @upload="updateFiles"
    />

    <!-- delete confirmation modal -->
    <FileExplorerItemDeleteConfirmation
      v-if="showDeleteConfirmationModal"
      :items="selectedItems"
      @modal-confirm="deleteSelectedItems"
      @modal-close="toggleDeleteFilesConfirmation"
    />

    <div class="flex flex-col w-full">
      <div class="flex justify-between w-full items-center mb-6">
        <div class="flex space-x-2 items-center">
          <!-- navigation arrows -->
          <button @click="backDir">
            <ArrowLeftIcon class="w-4" :class="!displayPath ? 'text-gray hover:text-gray cursor-default' : 'hover:text-green'"/>
          </button>
          <Breadcrumbs @update-path="updatePath" :path="displayPath" />
          <LoadingSpinner v-if="loading"/>
        </div>
        <!-- upload file/create directory buttons -->
        <div class="flex space-x-2">
          <button @click="openFileUploadOverlay" class="text-green hover:text-green-300">
            <div><CloudUploadIcon class="w-5 h-5" /></div>
          </button>
          <button @click="startCreateFolder" class="text-green hover:text-green-300">
            <div><FolderAddIcon class="w-6 h-6" /></div>
          </button>
          <button @click="toggleDeleteFilesConfirmation" :disabled="!someItemsSelected" class="text-red hover:text-red-700" :class="!someItemsSelected && 'disabled'">
            <div><TrashIcon class="w-5 h-5" /></div>
          </button>
        </div>
      </div>

      <!-- file explorer -->
      <div class="w-full flex flex-col overflow-y-auto">
        <!-- headers -->
        <div class="item-row font-bold border-b border-gray" >
          <div class="w-4"></div>
          <div>Name</div>
          <div class="hidden sm:block">Size</div>
          <div></div>
          <div v-if="loaded" @click="toggleSelectAllFiles" class="checkbox" :class="allItemsSelected && 'selected'">
            <CheckIcon v-if="allItemsSelected" class="w-4 h-4 text-white"/>
            <MinusIcon v-else-if="someItemsSelected" class="w-3 h-3" />
          </div>
        </div>
        <!-- back dir (..) -->
        <div v-if="displayPath" class="item-row">
          <ReplyIcon @click="backDir" class="w-5 sm:w-4 icon cursor-pointer" />
          <div><span @click="backDir" class="name">..</span></div>
        </div>
        <!-- new directory input -->
        <FileExplorerNewFolder v-if="showCreateFolder" :loading="creatingFolder" @submit="createFolder" @cancel="cancelCreateFolder"/>
        <!-- directories and files -->
        <div v-if="loaded && !files.length" class="py-2 text-center">
          <span>This folder is empty</span>
        </div>
        <FileExplorerItem
          v-for="(item, index) in files"
          :key="item.directory || item.filename"
          :ref="item.directory || item.filename"
          :index="index"
          :integration="integration"
          :item="item"
          :path="displayPath"
          @delete="updateFiles"
          @rename="updateFiles"
          @select-item="onSelectItem"
          @select-item-ctrl="onSelectItemWithCtrl"
          @select-item-shift="onSelectItemWithShift"
          @update-path="updatePath"
          @view-file="onViewFile"
        />
      </div>
    </div>

    <FileExplorerFileInfo
      v-if="fileToView"
      :file="fileToView"
      :integration="integration"
      :path="displayPath"
      @close="removeFileToView"
    />
  </div>
</template>

<script>
/* global process */

import * as api from '@/account-utils'
import Breadcrumbs from '@/components/Breadcrumbs'
import CloudUploadIcon from '@/components/icons/CloudUploadIcon'
import FileExplorerFileInfo from '@/components/storage/FileExplorerFileInfo'
import FileExplorerItem from '@/components/storage/FileExplorerItem'
import FileExplorerItemDeleteConfirmation from '@/components/storage/FileExplorerItemDeleteConfirmation'
import FileExplorerNewFolder from '@/components/storage/FileExplorerNewFolder'
import FileUploadOverlay from '@/components/storage/FileUploadOverlay'
import LoadingSpinner from '@/components/icons/LoadingSpinner'
import { mapState } from 'vuex'
import {
  ArrowLeftIcon,
  CheckIcon,
  FolderAddIcon,
  MinusIcon,
  ReplyIcon,
  TrashIcon
} from '@heroicons/vue/outline'

export default {
  name: 'FileExplorer',
  components: {
    ArrowLeftIcon,
    Breadcrumbs,
    CheckIcon,
    CloudUploadIcon,
    FileExplorerFileInfo,
    FileExplorerItem,
    FileExplorerItemDeleteConfirmation,
    FileExplorerNewFolder,
    FileUploadOverlay,
    FolderAddIcon,
    LoadingSpinner,
    MinusIcon,
    ReplyIcon,
    TrashIcon
  },
  props: ['integration'],
  data() {
    return {
      showCreateFolder: false,
      creatingFolder: false,
      // currently loaded (displayed) directory
      displayPath: '',
      // number of dragEnter minus number of dragExit
      dragCounter: 0,
      files: [],
      fileToView: null,
      lastSelectedIndex: 0,
      loaded: false,
      loading: false,
      // selected directory, regardless of loaded state
      path: '',
      showDeleteConfirmationModal: false,
      showFileUploadOverlay: false
    }
  },
  computed: {
    ...mapState(['session']),
    allItemsSelected() {
      return this.selectedItems.length && this.selectedItems.length === this.files.length
    },
    itemRefs() {
      return this.loaded && !this.loading && this.files.map(f => this.$refs[f.filename || f.directory][0])
    },
    selectedItems() {
      return this.loaded && !this.loading && this.files.filter(f => this.$refs[f.filename || f.directory][0].selected)
    },
    selectedRefs() {
      return this.selectedItems.map(f => this.$refs[f.filename || f.directory][0])
    },
    someItemsSelected() {
      return this.selectedItems.length
    }
  },
  methods: {
    async createFolder(name) {
      if (!name) return
      try {
        this.creatingFolder = true
        await api.files.createFolder(
          process.env.VUE_APP_ACCOUNT_API_URL,
          this.session._key,
          this.integration._key,
          this.path,
          name
        )
        this.creatingFolder = false
        await this.updateFiles()
      }
      catch (error) {
        console.error(error)
      }
      finally {
        this.cancelCreateFolder()
      }
    },
    backDir() {
      const path = this.path.split('/')
      if (path.length === 1) this.updatePath('')
      else this.updatePath(path.slice(0, path.length - 1).join('/'))
    },
    cancelCreateFolder() {
      this.showCreateFolder = false
    },
    closeFileUploadOverlay() {
      this.showFileUploadOverlay = false
    },
    deleteSelectedItems() {
      this.selectedRefs.forEach(ref => ref.deleteItem())
      this.toggleDeleteFilesConfirmation()
    },
    // onFileDragEnter and onFileDragExit prevent the file upload overlay from flickering open/closed as a file is dragged
    onFileDragEnter() {
      this.dragCounter += 1
      this.openFileUploadOverlay()
    },
    onFileDragExit() {
      this.dragCounter -= 1
      if (this.dragCounter === 0) {
        this.closeFileUploadOverlay()
        this.resetDragCounter()
      }
    },
    onSelectItem(index) {
      this.itemRefs.forEach((ref, i) => {
        if (index === i) ref.selected = true
        else ref.selected = false
      })
      this.lastSelectedIndex = index
    },
    onSelectItemWithCtrl(index) {
      this.itemRefs[index].selected = !this.itemRefs[index].selected
      this.lastSelectedIndex = index
    },
    onSelectItemWithShift(index) {
      const startIndex = Math.min(index, this.lastSelectedIndex)
      const endIndex = Math.max(index, this.lastSelectedIndex) + 1

      let selected = true
      if (this.itemRefs[index].selected) selected = false

      this.itemRefs
        .slice(startIndex, endIndex)
        .forEach((ref) => ref.selected = selected)
      this.lastSelectedIndex = index
    },
    onViewFile(file) {
      this.fileToView = file
    },
    openFileUploadOverlay() {
      this.showFileUploadOverlay = true
    },
    removeFileToView() {
      this.fileToView = null
    },
    resetDragCounter() {
      this.dragCounter = 0
    },
    startCreateFolder() {
      this.showCreateFolder = true
    },
    toggleCreateFolder() {
      this.showCreateFolder = !this.showCreateFolder
    },
    toggleSelectAllFiles() {
      if (this.allItemsSelected) this.itemRefs.forEach(ref => ref.selected = false)
      else this.itemRefs.forEach(ref => ref.selected = true)
    },
    toggleDeleteFilesConfirmation() {
      this.showDeleteConfirmationModal = !this.showDeleteConfirmationModal
    },
    updatePath(newPath) {
      this.path = newPath
      this.displayPath = newPath
    },
    async updateFiles() {
      try {
        this.httpError = null
        this.loading = true
        const { children } = await api.files.getNode(
          process.env.VUE_APP_ACCOUNT_API_URL,
          this.session._key,
          this.integration._key,
          this.path
        )
        this.files = children
        await this.$nextTick()
        this.fileToView = null
        this.loading = false
        this.loaded = true
        this.$forceUpdate()
      }
      catch (error) {
        console.error(error)
        this.httpError = error
      }
    }
  },
  mounted() {
    this.updateFiles()
  },
  watch: {
    allItemsSelected() {
      if (this.allItemsSelected) this.lastSelectedIndex = this.itemRefs.length - 1
    },
    path() {
      this.updateFiles()
    },
    someItemsSelected() {
      if (!this.someItemsSelected) this.lastSelectedIndex = 0
    }
  }
}
</script>

<style scoped>
.file-explorer {
  @apply relative flex mt-4 mb-8;
  height: 700px;
}

.item-row {
  @apply w-full grid gap-x-4 items-center py-1 pl-2 pr-1;
  grid-template-columns: max-content auto max-content max-content;
}
@screen sm {
  .item-row {
    grid-template-columns: max-content auto 150px max-content max-content;
  }
}
.item-row.selected {
  @apply bg-gray-300 rounded-md;
}

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
</style>
