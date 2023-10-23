<template>
  <FileExplorerOverlay>
    <template v-slot:header>
      <span v-if="isBulk" class="text-red">Delete files/folders</span>
      <span v-else-if="isFolder">Delete folder</span>
      <span v-else>Delete file</span>
    </template>
    <template v-slot:body>
      <div v-if="isBulk" class="flex flex-col space-y-2">
        <li>
          <span v-if="numFiles > 1">{{ numFiles }} files</span>
          <span v-else-if="numFiles == 1">1 file</span>

          <span v-if="numFiles > 0 && numFolders > 0"> and </span>

          <span v-if="numFolders > 1">{{ numFolders }} folders</span>
          <span v-else-if="numFolders == 1">1 folder</span>

          <span> will be permanently deleted.</span>
        </li>
        <li v-if="numFolders > 0">Any files in deleted folders will also be deleted.</li>
      </div>
      <div v-else-if="isFolder" class="flex flex-col space-y-2">
        <li>The folder <span class="node-name">{{ name }}</span> and any files it contains will be permanently deleted.</li>
      </div>
      <div v-else-if="isFile" class="flex flex-col space-y-2">
        <li>The file <span class="node-name">{{ name }}</span> will be permanently deleted.</li>
      </div>
      <div v-else>
        <li></li>
      </div>
    </template>
    <template v-slot:buttons>
      <button
        class="w-full mt-3 button button--small button--outline sm:mt-0"
        @click="close"
      >
        Cancel
      </button>
      <button
        class="w-full button button--small button--error"
        @click="confirm"
      >
        Delete
      </button>
    </template>
  </FileExplorerOverlay>
</template>

<script>
import FileExplorerOverlay from '@/components/storage/FileExplorerOverlay'

export default {
  name: 'FileExplorerNodeDeleteConfirmation',
  components: {
    FileExplorerOverlay
  },
  props: ['nodes'],
  computed: {
    isBulk() {
      return this.num > 1
    },
    isFile() {
      return this.node ? !!this.node.file : false
    },
    isFolder() {
      return this.node ? !this.node.file : false
    },
    name() {
      if (!this.node) return ''
      const path = this.node.fullPath.split('/')
      return path[path.length-1]
    },
    node() {
      return this.nodes.length > 0 ? this.nodes[0] : undefined
    },
    num() {
      return this.nodes.length
    },
    numFiles() {
      return this.nodes.filter(i => i.file).length
    },
    numFolders() {
      return this.nodes.filter(i => !i.file).length
    }
  },
  methods: {
    close() {
      this.$emit('modal-close')
    },
    confirm() {
      this.$emit('modal-confirm')
    }
  }
}
</script>

<style scoped>
.node-name {
  @apply font-bold;
}
</style>
