<template>
  <div class="file-explorer box"
    @dragenter.prevent="onFileDragEnter"
    @dragleave.prevent="onFileDragExit"
  >
    <FileUploadOverlay
      v-show="showFileUploadOverlay"
      @drop-file="resetDrag"
      @close="closeFileUploadOverlay"
    />

    <div class="flex justify-between w-full items-center mb-6">
      <!-- breadcrumbs -->
      <Breadcrumbs @update-path="updatePath" :path="path" />

      <!-- upload file/create directory buttons -->
      <div class="flex space-x-2">
        <button @click="openFileUploadOverlay" class="button button--extraSmall button--outline-success">
          <div><DocumentAddIcon class="w-6 h-6" /></div>
        </button>
        <button @click="startAddNewDir" class="button button--extraSmall button--outline-success">
          <div><FolderAddIcon class="w-6 h-6" /></div>
        </button>
      </div>
    </div>

    <!-- file explorer -->
    <div class="flex flex-col space-y-2">
      <!-- back dir (..) -->
      <div v-if="path" class="item-row">
        <ReplyIcon class="w-4" />
        <div>
          <button @click="backDir" class="dir-nav">..</button>
        </div>
      </div>

      <!-- new directory -->
      <FileExplorerNewDirectory
        v-if="addingNewDir"
        @add-dir="addNewDir"
        @cancel="cancelAddNewDir"
      />

      <!-- directories and files -->
      <FileExplorerItem
        v-for="(item, index) in currentDir"
        :key="index"
        :item="item"
        :path="path"
        @update-name="onUpdateName"
        @update-path="updatePath"
      />
    </div>
  </div>
</template>

<script>
/* global process */

// import * as api from '@/account-utils'
// import * as validation from '@/utils/validation'
import Breadcrumbs from '@/components/Breadcrumbs'
import FileExplorerItem from '@/components/storage/FileExplorerItem'
import FileExplorerNewDirectory from '@/components/storage/FileExplorerNewDirectory'
import FileUploadOverlay from '@/components/storage/FileUploadOverlay'
import HttpError from '@/components/HttpError'
import LoadingSpinner from '@/components/icons/LoadingSpinner'
import {
  DocumentAddIcon,
  FolderAddIcon,
  ReplyIcon
} from '@heroicons/vue/outline'


const testFiles = [
  {
    directory: 'assets',
    children: [
      {
        directory: 'img',
        children: [
          { filename: '1.jpg', size: 213490 },
          { filename: '2.jpg', size: 63490 },
          { filename: '3.jpg', size: 253490 }
        ]
      },
      {
        directory: 'js',
        children: [
          { filename: 'index.js', size: 213490 },
          { filename: 'module1.js', size: 63490 },
          { filename: 'module2.js', size: 253490 }
        ]
      },
      {
        directory: 'css'
      },
      { filename: 'config.json', size: 12500 }
    ]
  },
  {
    directory: 'docs',
    children: [
      { filename: 'letter.pdf', size: 13050 }
    ]
  },
  { filename: 'README.md', size: 213490 }
]

export default {
  name: 'FileExplorer',
  components: {
    Breadcrumbs,
    DocumentAddIcon,
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
      files: testFiles,
      dragCounter: 0,
      path: '',
      pathHistory: [],
      showFileUploadOverlay: false,
    }
  },
  computed: {
    // Temporary, until files come from API
    currentDir() {
      if (!this.path) return this.files

      const dirs = this.path.split('/')
      let directory = this.files
      for (let i = 0; i < dirs.length; i++) {
        const dir = directory.find(d => d.directory === dirs[i])
        directory = dir.children || []
      }
      return directory
    }
  },
  methods: {
    /** @todo
     * handle broswer/mouse back and forward buttons for file navigation rather than page navigation
     */

    addNewDir(newDirName) {
      /** @todo add new directory */
      this.cancelAddNewDir()
    },
    backDir() {
      const path = this.path.split('/')
      if (path.length === 1) this.updatePath('')
      else this.updatePath(path.slice(0, path.length - 1).join('/'))
    },
    closeFileUploadOverlay() {
      this.showFileUploadOverlay = false
    },
    getFiles() {
      /** @todo GET files */
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
    onUpdateName() {
      /** @todo PUT file/dir name */
      this.getFiles()
    },
    openFileUploadOverlay() {
      this.showFileUploadOverlay = !this.showFileUploadOverlay
    },
    resetDrag() {
      this.dragCounter = 0
    },
    toggleAddNewDir() {
      this.addingNewDir = !this.addingNewDir
    },
    updatePath(newPath) {
      this.path = newPath
      this.pathHistory = [...this.pathHistory, newPath]
    },
    startAddNewDir() {
      this.addingNewDir = true
    },
    cancelAddNewDir() {
      this.addingNewDir = false
    }
  }
}
</script>

<style scoped>
.file-explorer {
  @apply relative mt-4 mb-8;
  min-height: 600px
}

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
