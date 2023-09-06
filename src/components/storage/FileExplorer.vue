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
      <!-- breadcrumbs -->
      <Breadcrumbs @update-path="updatePath" :path="displayPath" />

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
      <div v-if="displayPath" class="item-row">
        <ReplyIcon class="w-4" />
        <div>
          <button @click="backDir" class="dir-nav">..</button>
        </div>
      </div>

      <!-- new directory -->
      <FileExplorerNewDirectory
        v-if="addingNewDir"
        @add-dir="addNewDir"
        @cancel="closeAddNewDir"
      />

      <!-- directories and files -->
      <FileExplorerItem
        v-for="item in files"
        :key="item.directory || item.filename"
        :instance="instance"
        :item="item"
        :path="displayPath"
        @delete="updateFiles"
        @rename="updateFiles"
        @update-path="updatePath"
      />
    </div>
  </div>
</template>

<script>
/* global process */

import * as api from '@/account-utils'
import * as validation from '@/utils/validation'
import Breadcrumbs from '@/components/Breadcrumbs'
import FileExplorerItem from '@/components/storage/FileExplorerItem'
import FileExplorerNewDirectory from '@/components/storage/FileExplorerNewDirectory'
import FileUploadOverlay from '@/components/storage/FileUploadOverlay'
import HttpError from '@/components/HttpError'
import LoadingSpinner from '@/components/icons/LoadingSpinner'
import { mapState } from 'vuex'
import {
  DocumentAddIcon,
  FolderAddIcon,
  ReplyIcon
} from '@heroicons/vue/outline'

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
      displayPath: '',
      files: [],
      dragCounter: 0,
      path: '',
      pathHistory: [],
      showFileUploadOverlay: false,
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
      this.pathHistory = [...this.pathHistory, newPath]
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
    path() {
      this.updateFiles()
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
