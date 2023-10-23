<template>
  <FileExplorerOverlay>
    <template v-slot:header>
      <span class="text-red">Delete {{ nodeType }}</span>
    </template>
    <template v-slot:body>
      <div v-if="nodes && nodes.length > 1" class="flex flex-col space-y-2">
        <li>{{ filesCount ? `${filesCount} file${filesCount > 1 ? 's' : ''}` : '' }}{{ filesCount && foldersCount ? ' and ' : '' }}{{ foldersCount && `${foldersCount} folder${foldersCount > 1 ? 's' : ''}` }} will be permanently deleted</li>
        <li v-if="foldersContainChildren">All files in the folder{{ foldersCount > 1 ? 's' : ''}} will also be deleted</li>
      </div>
      <div v-else class="flex flex-col space-y-2">
        <li>This {{ nodeType.toLowerCase() }} will be permanently deleted</li>
        <li v-if="nodeToDelete.folder && nodeToDelete.folder.length">All files in this folder will also be deleted</li>
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
  props: ['node', 'nodes'],
  computed: {
    foldersCount() {
      return this.nodes.filter(i => i.folder).length
    },
    foldersContainChildren() {
      return this.nodes.some(i => i.folder && i.children && i.children.length)
    },
    filesCount() {
      return this.nodes.filter(i => i.filename).length
    },
    nodeToDelete() {
      return this.node || this.nodes[0]
    },
    nodeType() {
      if (this.nodes && this.nodes.length > 1) return 'Files'
      else return this.nodeToDelete.folder ? 'Directory' : 'File'
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

</style>
