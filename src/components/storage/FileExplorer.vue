<template>
  <div class="file-explorer box"
    @dragenter.prevent="onFileDragEnter"
    @dragleave.prevent="onFileDragExit"
  >
    <FileUploadOverlay
      v-show="showFileUploadOverlay"
      :integration="integration"
      @drop-file="resetDrag"
      @close="closeFileUploadOverlay"
      @upload="updateFiles"
    />

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
        <button @click="startAddNewDir" class="text-green hover:text-green-300">
          <div><FolderAddIcon class="w-6 h-6" /></div>
        </button>
        <button @click="toggleDeleteFilesConfirmation" :disabled="!someItemsSelected" class="text-red hover:text-red-700" :class="!someItemsSelected && 'disabled'">
          <div><TrashIcon class="w-5 h-5" /></div>
        </button>
      </div>
    </div>

    <!-- file explorer -->
    <div class="flex flex-1">
      <div class="w-full flex flex-col">
        <!-- headers -->
        <div class="item-row font-bold border-b border-gray" >
          <div class="w-4"></div>
          <div>Name</div>
          <div>Size</div>
          <div></div>
          <div v-if="loaded" @click="toggleSelectAllFiles" class="checkbox" :class="allItemsSelected && 'selected'">
            <CheckIcon v-if="allItemsSelected" class="w-4 h-4 text-white"/>
            <div class="bg-gray-400 w-3 h-3" v-else-if="someItemsSelected"></div>
          </div>
        </div>

        <!-- back dir (..) -->
        <div v-if="displayPath" class="item-row">
          <ReplyIcon @click="backDir" class="w-4 icon cursor-pointer" />
          <div @click="backDir"><span class="name">..</span></div>
        </div>

        <!-- new directory input -->
        <FileExplorerNewDirectory
          v-if="addingNewDir"
          :creating="creatingNewDir"
          @add-dir="addNewDir"
          @cancel="closeAddNewDir"
        />

        <!-- directories and files -->
        <div v-if="loaded && !files.length" class="py-2 text-center">
          <span>This folder is empty</span>
        </div>
        <FileExplorerItem
          v-for="item in files"
          :key="item.directory || item.filename"
          :ref="item.directory || item.filename"
          :integration="integration"
          :item="item"
          :path="displayPath"
          @delete="updateFiles"
          @rename="updateFiles"
          @select-file="onSelectFile"
          @update-path="updatePath"
        />
      </div>
      <!-- file info side panel - @todo -->
      <div v-if="selectedFile" class="file-info-pane w-max flex flex-col space-y-2">
        <div>{{ selectedFile.filename }}</div>
        <div>{{ selectedFile.size }}</div>
      </div>

      <!-- delete confirmation modal -->
      <FileExplorerItemDeleteConfirmation
        v-if="showDeleteConfirmationModal"
        :items="selectedItems"
        @modal-confirm="deleteSelectedItems"
        @modal-close="toggleDeleteFilesConfirmation"
      />
    </div>
  </div>
</template>

<script>
/* global process */

import * as api from '@/account-utils'
import Breadcrumbs from '@/components/Breadcrumbs'
import CloudUploadIcon from '@/components/icons/CloudUploadIcon'
import FileExplorerItem from '@/components/storage/FileExplorerItem'
import FileExplorerItemDeleteConfirmation from '@/components/storage/FileExplorerItemDeleteConfirmation'
import FileExplorerNewDirectory from '@/components/storage/FileExplorerNewDirectory'
import FileUploadOverlay from '@/components/storage/FileUploadOverlay'
import LoadingSpinner from '@/components/icons/LoadingSpinner'
import { mapState } from 'vuex'
import {
  ArrowLeftIcon,
  CheckIcon,
  FolderAddIcon,
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
    FileExplorerItem,
    FileExplorerItemDeleteConfirmation,
    FileExplorerNewDirectory,
    FileUploadOverlay,
    FolderAddIcon,
    LoadingSpinner,
    ReplyIcon,
    TrashIcon
  },
  props: ['integration'],
  data() {
    return {
      addingNewDir: false,
      creatingNewDir: false,
      // displayPath is the loaded directory
      displayPath: '',
      dragCounter: 0,
      files: [],
      loaded: false,
      loading: false,
      // path is the selected directory, regardless of loaded state
      path: '',
      selectedFile: null,
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
    selectedRefs() {
      return this.selectedItems.map(f => this.$refs[f.filename || f.directory][0])
    },
    selectedItems() {
      return this.loaded && !this.loading && this.files.filter(f => this.$refs[f.filename || f.directory][0].selected)
    },
    someItemsSelected() {
      return this.selectedItems.length
    }
  },
  methods: {
    async addNewDir(newDirName) {
      if (!newDirName) return
      try {
        this.creatingNewDir = true
        await api.storage.createDirectory(
          process.env.VUE_APP_ACCOUNT_API_URL,
          this.session._key,
          this.integration._key,
          this.path,
          newDirName
        )
        this.creatingNewDir = false
        this.closeAddNewDir()
        await this.updateFiles()
      }
      catch (error) {
        console.error(error)
      }
    },
    backDir() {
      const path = this.path.split('/')
      if (path.length === 1) this.updatePath('')
      else this.updatePath(path.slice(0, path.length - 1).join('/'))
    },
    closeFileUploadOverlay() {
      this.showFileUploadOverlay = false
    },
    deleteSelectedItems() {
      this.selectedRefs.forEach(ref => ref.deleteItem())
      this.toggleDeleteFilesConfirmation()
    },
    onFileDragEnter() {
      this.dragCounter += 1
      this.openFileUploadOverlay()
    },
    onFileDragExit() {
      this.dragCounter -= 1
      if (this.dragCounter === 0) {
        this.closeFileUploadOverlay()
        this.resetDrag()
      }
    },
    onSelectFile(file) {
      this.selectedFile = file
    },
    openFileUploadOverlay() {
      this.showFileUploadOverlay = true
    },
    resetDrag() {
      this.dragCounter = 0
    },
    toggleAddNewDir() {
      this.addingNewDir = !this.addingNewDir
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
    },
    startAddNewDir() {
      this.addingNewDir = true
    },
    closeAddNewDir() {
      this.addingNewDir = false
    },
    async updateFiles() {
      try {
        this.httpError = null
        this.loading = true
        const { files, path } = await api.storage.getFiles(
          process.env.VUE_APP_ACCOUNT_API_URL,
          this.session._key,
          this.integration._key,
          this.path
        )
        this.files = files
        await this.$nextTick()
        this.selectedFile = null
        this.loading = false
        this.loaded = true
        this.displayPath = path
        /** @todo investigate why it's not always auto-updating */
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
    async path() {
      await this.updateFiles()
    }
  }
}
</script>

<style scoped>
.file-explorer {
  @apply relative flex flex-col mt-4 mb-8;
  min-height: 600px
}

.file-info-pane {
  @apply ml-10 px-10 border-l border-gray;
}

.item-row {
  @apply grid gap-x-4 items-center py-1;
  grid-template-columns: max-content auto 150px max-content max-content;
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