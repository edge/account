<template>
  <FileExplorerOverlay>
    <template v-slot:header>
      <span class="text-red">Delete {{ itemType }}</span>
    </template>
    <template v-slot:body>
      <div v-if="items && items.length > 1" class="flex flex-col space-y-2">
        <li>{{ filesCount ? `${filesCount} file${filesCount > 1 ? 's' : ''}` : '' }}{{ filesCount && dirsCount ? ' and ' : '' }}{{ dirsCount && `${dirsCount} director${dirsCount > 1 ? 'ies' : 'y'}` }} will be permanently deleted</li>
        <li v-if="dirsContainChildren">All files in the director{{ dirsCount > 1 ? 'ies' : 'y'}} will also be deleted</li>
      </div>
      <div v-else class="flex flex-col space-y-2">
        <li>This {{ itemType.toLowerCase() }} will be permanently deleted</li>
        <li v-if="itemToDelete.directory && itemToDelete.directory.length">All files in this directory will also be deleted</li>
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
  name: 'FileExplorerItemDeleteConfirmation',
  components: {
    FileExplorerOverlay
  },
  props: ['item', 'items'],
  computed: {
    dirsCount() {
      return this.items.filter(i => i.directory).length
    },
    dirsContainChildren() {
      return this.items.some(i => i.directory && i.children && i.children.length)
    },
    filesCount() {
      return this.items.filter(i => i.filename).length
    },
    itemToDelete() {
      return this.item || this.items[0]
    },
    itemType() {
      if (this.items && this.items.length > 1) return 'Files'
      else return this.itemToDelete.directory ? 'Directory' : 'File'
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
