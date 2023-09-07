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
        <button @click="backDir">
          <ArrowLeftIcon class="w-4" :class="!path ? 'text-gray hover:text-gray cursor-default' : 'hover:text-green'"/>
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
      </div>
    </div>

    <!-- file explorer -->
    <div class="flex flex-1">
      <div class="w-full flex flex-col">
        <!-- back dir (..) -->
        <div v-if="displayPath" class="item-row">
          <ReplyIcon @click="backDir" class="w-4 icon cursor-pointer" />
          <div @click="backDir"><span class="name">..</span></div>
        </div>
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
  ArrowLeftIcon,
  FolderAddIcon,
  ReplyIcon
} from '@heroicons/vue/outline'

export default {
  name: 'FileExplorer',
  components: {
    ArrowLeftIcon,
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
      loading: false,
      path: '',
      selectedFile: null,
      showFileUploadOverlay: false
    }
  },
  computed: {
    ...mapState(['session'])
  },
  methods: {
    async addNewDir(newDirName) {
      if (!newDirName) return
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
    resetDrag() {
      this.dragCounter = 0
    },
    toggleAddNewDir() {
      this.addingNewDir = !this.addingNewDir
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
          this.instance._key,
          this.path
        )
        this.selectedFile = null
        this.loading = false
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
}
</style>
