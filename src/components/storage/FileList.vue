<template>
  <div class="file-explorer box">
    <div v-if="showUploadOverlay" class="file-drop-overlay">
      <div class="bg-white p-4 rounded-md">
        <div class="mb-4"><span>Upload your file:</span></div>
        <div class="flex flex-col space-y-4 items-center justify-center py-6 px-10 rounded-md border border-dashed border-gray">
          <span>Drop file here</span>
          <span>or</span>
          <button class="button button--outline-success button-small">Browse Files</button>
        </div>
      </div>
    </div>

    <div class="flex justify-between w-full items-center mb-6">
      <!-- breadcrumbs -->
      <Breadcrumbs @update-path="updatePath" :path="path" />

      <!-- upload file/create directory buttons -->
      <div class="flex space-x-2">
        <button @click="toggleUploadOverlay" class="button button--extraSmall button--outline-success">
          <div><DocumentAddIcon class="w-6 h-6" /></div>
        </button>
        <button class="button button--extraSmall button--outline-success">
          <div><FolderAddIcon class="w-6 h-6" /></div>
        </button>
      </div>
    </div>

    <!-- file explorer -->
    <div class="flex flex-col space-y-2">
      <!-- back dir -->
      <div v-if="path" class="item-row">
        <ReplyIcon class="w-4" />
        <div>
          <button @click="backDir" class="dir-nav">..</button>
        </div>
      </div>

      <!-- directories and files -->
      <FileExplorerItem
        v-for="(item, index) in currentFiles"
        :key="index"
        :item="item"
        :path="path"
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
  name: 'FileList',
  components: {
    Breadcrumbs,
    DocumentAddIcon,
    FileExplorerItem,
    FolderAddIcon,
    HttpError,
    LoadingSpinner,
    ReplyIcon
  },
  props: ['instance'],
  data() {
    return {
      path: 'assets',
      showUploadOverlay: false
      // files: null
    }
  },
  computed: {
    // Temporary, until files come from API
    currentFiles() {
      if (!this.path) return testFiles

      const dirs = this.path.split('/')
      let directory = testFiles
      for (let i = 0; i < dirs.length; i++) {
        const dir = directory.find(d => d.directory === dirs[i])
        directory = dir.children || []
      }
      return directory
    }
  },
  methods: {
    backDir() {
      const path = this.path.split('/')
      if (path.length === 1) this.updatePath('')
      else this.updatePath(path.slice(0, path.length - 1).join('/'))
    },
    toggleUploadOverlay() {
      this.showUploadOverlay = !this.showUploadOverlay
    },
    updatePath(newPath) {
      this.path = newPath
    }
  }
}
</script>

<style scoped>
.file-explorer {
  @apply relative mt-4 mb-8;
  min-height: 400px
}

.file-drop-overlay {
  @apply absolute top-0 left-0 w-full h-full bg-gray-800 bg-opacity-75 z-10 rounded-lg flex items-center justify-center;
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
