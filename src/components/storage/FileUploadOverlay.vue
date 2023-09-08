<template>
  <!-- dragover.prevent and drop.prevent stop the file from opening if dropped outside the dropzone -->
  <FileExplorerOverlay @dragover.prevent="" @drop.prevent="">
    <template v-slot:header>
      <span class="">Upload Files</span>
    </template>
    <template v-slot:body>
      <!-- drop zone -->
      <div
        @drop.prevent="onDrop"
        @dragenter.prevent="setDropZoneActive"
        @dragover.prevent="setDropZoneActive"
        @dragleave.prevent="setDropZoneInactive"
        class="drop-zone"
        :class="dropZoneActive && 'active'"
      >
        <div>
          <CloudUploadIcon class="w-8" />
        </div>
        <div class="text-lg">
          <span>Drop files here or</span>
          <button @click="openFileExplorer" class="underline text-green ml-1">browse files</button>
          <input ref="file-input" type="file" multiple class="hidden" @change.prevent="onChange" />
        </div>
      </div>
      <div v-if="files.length" class="file-list">
        <div v-for="file in files" :key="file.id" class="file">
          <span>{{ file.name }}</span>
          <div v-if="file.status === 'uploading'"><LoadingSpinner class="w-4" /></div>
          <div v-else-if="file.status === 'uploaded'"><CheckIcon class="w-4 text-green" /></div>
          <button v-else @click="removeFile(file.id)"><XIcon class="w-4 text-red" /></button>
        </div>
      </div>
    </template>
    <template v-slot:buttons>
      <div class="w-full flex space-x-2 justify-between">
        <button
          @click="closeOverlay"
          class="w-full button button--small button--error"
        >
          <span>Cancel</span>
        </button>
        <button
          @click="upload"
          :disabled="!files.length || uploading"
          class="w-full button button--small button--success"
        >
          <span>Upload</span>
        </button>
      </div>
    </template>
  </FileExplorerOverlay>
</template>

<script>
/* global process */

import * as api from '@/account-utils'
import FileExplorerOverlay from '@/components/storage/FileExplorerOverlay'
import LoadingSpinner from '@/components/icons/LoadingSpinner'
import { CheckIcon, CloudUploadIcon, XIcon } from '@heroicons/vue/outline'

export default {
  name: 'FileUploadOverlay',
  components: {
    CheckIcon,
    CloudUploadIcon,
    FileExplorerOverlay,
    LoadingSpinner,
    XIcon
  },
  props: ['integration'],
  data() {
    return {
      dropZoneActive: false,
      files: [],
      uploading: false
    }
  },
  methods: {
    closeOverlay() {
      this.files = []
      this.$emit('close')
    },
    closeOverlayOnEscape(e) {
      if (e.keyCode == 27) this.closeOverlay()
    },
    loadFiles(filesToLoad) {
      const newFiles = [...filesToLoad]
        .map(file => ({
          file: file,
          name: file.name,
          id: `${file.name}-${file.size}-${file.lastModified}-${file.type}`,
          url: URL.createObjectURL(file),
          status: null
        }))
        // filter out repeated files
        .filter(file => !this.files.some(({ id }) => file.id === id))

      this.files = [...this.files, ...newFiles]
    },
    onChange(e) {
      this.loadFiles(e.target.files)
    },
    onDrop(e) {
      this.loadFiles(e.dataTransfer.files)
      this.$emit('handle-drop')
      this.setDropZoneInactive()
    },
    openFileExplorer() {
      this.$refs['file-input'].click()
    },
    removeFile(id) {
      this.files = this.files.filter(file => file.id !== id)
    },
    setDropZoneActive() {
      this.dropZoneActive = true
    },
    setDropZoneInactive() {
      this.dropZoneActive = false
    },
    async upload() {
      try {
        this.uploading = true
        await Promise.all(this.files.map(async (file, index) => {
          if (['uploaded', 'uploading'].includes(file.status)) return
          this.files[index].status = 'uploading'
          await api.storage.uploadFile(
            process.env.VUE_APP_ACCOUNT_API_URL,
            this.integration.apiKey,
            this.path,
            file.file
          )
          this.files[index].status = 'uploaded'
        }))
        this.uploading = false
        this.$emit('upload')
      }
      catch (error) {
        console.error(error)
        this.uploading = false
      }
    }
  },
  mounted() {
    window.addEventListener('keyup', this.closeOverlayOnEscape)
  },
  unmounted() {
    window.removeEventListener('keyup', this.closeOverlayOnEscape)
  }
}
</script>

<style scoped>
.file-drop-overlay {
  @apply absolute top-0 left-0 w-full h-full bg-gray-800 bg-opacity-75 z-10 rounded-lg flex items-center justify-center;
}

.drop-zone {
  @apply flex flex-col space-y-2 items-center justify-center py-6 px-10 rounded-md border border-dashed border-gray;
}
.drop-zone.active {
  @apply border-green;
}

.file-list {
  @apply w-full mt-2;
}

.file {
  @apply flex w-full justify-between items-center;
}
</style>
