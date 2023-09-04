<template>
  <!-- dragover.prevent and drop.prevent stop the file from opening if dropped outside the dropzone -->
  <div class="file-drop-overlay" @dragover.prevent="" @drop.prevent="">
    <div class="flex flex-col space-y-4 bg-white p-4 rounded-md">
      <!-- title -->
      <div><span>Upload your files:</span></div>

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

        <div v-if="files.length" class="file-list">
          <div class="underline">Files:</div>
          <div v-for="file in files" :key="file.id" class="file">
            <span>{{ file.name }}</span>
            <button @click="removeFile(file.id)"><XIcon class="w-4 text-red" /></button>
          </div>
        </div>
      </div>

      <!-- buttons -->
      <div class="w-full flex space-x-2 justify-between">
        <button
          @click="closeOverlay"
          class="w-full button button--small button--error"
        >
          <span>Cancel</span>
        </button>
        <button
          :disabled="!files.length || uploading"
          class="w-full button button--small button--success"
        >
          <span>Upload</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { CloudUploadIcon, XIcon } from '@heroicons/vue/outline'

export default {
  name: 'FileUploadOverlay',
  components: {
    CloudUploadIcon,
    XIcon
  },
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
    handleDrop() {
      console.log('drop-file')
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
    upload() {
      return
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
  @apply w-full;
}

.file {
  @apply flex w-full justify-between items-center;
}
</style>
