<template>
  <FileExplorerOverlay>
    <template v-slot:header>
      <span class="text-red">Delete {{ itemType }}</span>
    </template>
    <template v-slot:body>
      <div class="flex flex-col space-y-2">
        <li>This {{ itemType.toLowerCase() }} will be permanently deleted</li>
        <li v-if="item.directory && item.directory.length">All files in this folder will also be deleted</li>
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
  props: ['item'],
  computed: {
    itemType() {
      return this.item.directory ? 'Folder' : 'File'
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
