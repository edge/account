<template>
  <div class="file-explorer box"
    @dragenter.prevent="onFileDragEnter"
    @dragleave.prevent="onFileDragExit"
  >
    <FileUploadOverlay
      v-show="showFileUploadOverlay"
      :instance="instance"
      @drop-file="resetDrag"
      @close="closeFileUploadOverlay"
      @upload="updateFiles"
    />

    <div class="flex justify-between w-full items-center mb-6">
      <div class="flex space-x-2 items-center">
        <!-- navigation arrows -->
        <button @click="backDir"><ReplyIcon class="w-4 hover:text-green"/></button>
        <!-- <button @click="pathBack"><ArrowSmLeftIcon class="w-5 text-gray hover:text-green"/></button>
        <button @click="pathForward"><ArrowSmRightIcon class="w-5 text-gray hover:text-green"/></button> -->
        <!-- breadcrumbs -->
        <Breadcrumbs @update-path="updatePath" :path="displayPath" />
      </div>

      <!-- upload file/create directory buttons -->
      <div class="flex space-x-2">
        <button @click="openFileUploadOverlay" class="text-green hover:text-green-300">
          <div><CloudUploadIcon class="w-5 h-5" /></div>
        </button>
        <button @click="startAddNewDir" class="text-green hover:text-green-300">
          <div><FolderAddIcon class="w-6 h-6" /></div>
        </button>
      </div>
    </div>

    <!-- file explorer -->
    <div class="flex flex-1">
      <div class="w-full flex flex-col">
        <!-- back dir (..) -->
        <!-- <div v-if="displayPath" class="item-row">
          <ReplyIcon @click="backDir" class="w-4 icon cursor-pointer" />
          <div @click="backDir"><span class="name">..</span></div>
        </div> -->
        <!-- new directory input -->
        <FileExplorerNewDirectory
          v-if="addingNewDir"
          @add-dir="addNewDir"
          @cancel="closeAddNewDir"
        />
        <!-- directories and files -->
        <div v-if="loaded && !files.length" class="py-1">
          <span>This folder is empty</span>
        </div>
        <FileExplorerItem
          v-for="item in files"
          :key="item.directory || item.filename"
          :ref="item.directory || item.filename"
          :instance="instance"
          :item="item"
          :path="displayPath"
          @delete="updateFiles"
          @rename="updateFiles"
          @select="onSelectFile"
          @update-path="updatePath"
        />
      </div>
      <!-- file info side panel - @todo -->
      <div v-if="selectedFile" class="file-info-pane w-max flex flex-col space-y-2">
        <div>{{ selectedFile.filename }}</div>
        <div>{{ selectedFile.size }}</div>
      </div>
    </div>
  </div>
</template>

<script>
/* global process */

import * as api from '@/account-utils'
import * as validation from '@/utils/validation'
import Breadcrumbs from '@/components/Breadcrumbs'
import CloudUploadIcon from '@/components/icons/CloudUploadIcon'
import FileExplorerItem from '@/components/storage/FileExplorerItem'
import FileExplorerNewDirectory from '@/components/storage/FileExplorerNewDirectory'
import FileUploadOverlay from '@/components/storage/FileUploadOverlay'
import HttpError from '@/components/HttpError'
import LoadingSpinner from '@/components/icons/LoadingSpinner'
import { mapState } from 'vuex'
import {
  ArrowSmLeftIcon,
  ArrowSmRightIcon,
  FolderAddIcon,
  ReplyIcon
} from '@heroicons/vue/outline'

export default {
  name: 'FileExplorer',
  components: {
    ArrowSmLeftIcon,
    ArrowSmRightIcon,
    Breadcrumbs,
    CloudUploadIcon,
    FileExplorerItem,
    FileExplorerNewDirectory,
    FileUploadOverlay,
    FolderAddIcon,
    HttpError,
    LoadingSpinner,
    ReplyIcon
  },
  props: ['instance'],
  data() {
    return {
      addingNewDir: false,
      displayPath: '',
      dragCounter: 0,
      files: [],
      loaded: false,
      path: '',
      pathHistory: [''],
      pathHistoryIndex: 0,
      selectedFile: null,
      showFileUploadOverlay: false
    }
  },
  computed: {
    ...mapState(['session'])
  },
  methods: {
    /** @todo
     * handle broswer/mouse back and forward buttons for file navigation rather than page navigation
     */

    async addNewDir(newDirName) {
      try {
        await api.storage.createDirectory(
          process.env.VUE_APP_ACCOUNT_API_URL,
          this.session._key,
          this.instance._key,
          this.path,
          newDirName
        )
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
    pathBack() {
      if (this.pathHistoryIndex) {
        this.pathHistoryIndex--
        this.selectedFile = null
        this.path = this.pathHistory[this.pathHistoryIndex]
      }
    },
    pathForward() {
      if (this.pathHistoryIndex + 1 < this.pathHistory.length) {
        this.pathHistoryIndex++
        this.selectedFile = null
        this.path = this.pathHistory[this.pathHistoryIndex]
      }
    },
    resetDrag() {
      this.dragCounter = 0
    },
    toggleAddNewDir() {
      this.addingNewDir = !this.addingNewDir
    },
    updatePath(newPath) {
      this.selectedFile = null
      this.path = newPath
      this.pathHistory = [...this.pathHistory.slice(0, this.pathHistoryIndex + 1), newPath]
      this.pathHistoryIndex++
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
        const { files, path } = await api.storage.getFiles(
          process.env.VUE_APP_ACCOUNT_API_URL,
          this.session._key,
          this.instance._key,
          this.path
        )
        this.loaded = true
        this.files = files
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

.item-row {
  @apply grid gap-x-4 items-center py-1;
  grid-template-columns: max-content auto 150px max-content;
}
.item-row .name {
  @apply cursor-pointer hover:text-green hover:underline;
}
.item-row.selected {
  @apply bg-gray-200;
}
.item-action {
  @apply cursor-pointer hover:text-green;
}

.file-info-pane {
  @apply ml-10 px-10 border-l border-gray;
  height: 100%;
}
</style>
