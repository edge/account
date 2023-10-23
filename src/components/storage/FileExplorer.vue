<template>
  <div class="file-explorer box"
    @dragenter.prevent="onFileDragEnter"
    @dragleave.prevent="onFileDragExit"
  >
    <!-- overlays -->
    <FileUploadOverlay
      v-show="showFileUploadOverlay"
      :integration="integration"
      :path="path"
      @drop-file="resetDragCounter"
      @close="closeFileUploadOverlay"
      @upload="updateFiles"
    />

    <!-- delete confirmation modal -->
    <FileExplorerNodeDeleteConfirmation
      v-if="showDeleteConfirmationModal"
      :nodes="selectedNodes"
      @modal-confirm="deleteSelectedNodes"
      @modal-close="toggleDeleteFilesConfirmation"
    />

    <div class="flex flex-col w-full">
      <div class="flex justify-between w-full items-center mb-6">
        <div class="flex space-x-2 items-center">
          <!-- navigation arrows -->
          <button @click="backDir">
            <ArrowLeftIcon class="w-4" :class="!displayPath ? 'text-gray hover:text-gray cursor-default' : 'hover:text-green'"/>
          </button>
          <Breadcrumbs @update-path="updatePath" :path="displayPath" />
          <LoadingSpinner v-if="loading"/>
        </div>
        <!-- upload file/create folder buttons -->
        <div class="flex space-x-2">
          <button @click="openFileUploadOverlay" class="text-green hover:text-green-300">
            <div><CloudUploadIcon class="w-5 h-5" /></div>
          </button>
          <button @click="startCreateFolder" class="text-green hover:text-green-300">
            <div><FolderAddIcon class="w-6 h-6" /></div>
          </button>
          <button @click="toggleDeleteFilesConfirmation" :disabled="!someNodesSelected" class="text-red hover:text-red-700" :class="!someNodesSelected && 'disabled'">
            <div><TrashIcon class="w-5 h-5" /></div>
          </button>
        </div>
      </div>

      <!-- file explorer -->
      <div class="w-full flex flex-col overflow-y-auto">
        <!-- headers -->
        <div class="node-row font-bold border-b border-gray" >
          <div class="w-4"></div>
          <div>Name</div>
          <div class="hidden sm:block">Size</div>
          <div></div>
          <div v-if="loaded" @click="toggleSelectAllFiles" class="checkbox" :class="allNodesSelected && 'selected'">
            <CheckIcon v-if="allNodesSelected" class="w-4 h-4 text-white"/>
            <MinusIcon v-else-if="someNodesSelected" class="w-3 h-3" />
          </div>
        </div>
        <!-- back dir (..) -->
        <div v-if="displayPath" class="node-row">
          <ReplyIcon @click="backDir" class="w-5 sm:w-4 icon cursor-pointer" />
          <div><span @click="backDir" class="name">..</span></div>
        </div>
        <!-- new folder input -->
        <FileExplorerNewFolder v-if="showCreateFolder" :loading="creatingFolder" @submit="createFolder" @cancel="cancelCreateFolder"/>
        <!-- folders and files -->
        <div v-if="loaded && !nodes.length" class="py-2 text-center">
          <span>This folder is empty</span>
        </div>
        <FileExplorerNode
          v-for="(node, index) in nodes"
          :key="node.folder || node.filename"
          :ref="node.folder || node.filename"
          :index="index"
          :integration="integration"
          :node="node"
          :path="displayPath"
          @delete="updateFiles"
          @rename="updateFiles"
          @select-node="onSelectNode"
          @select-node-ctrl="onSelectNodeWithCtrl"
          @select-node-shift="onSelectNodeWithShift"
          @update-path="updatePath"
          @view-file="onViewFile"
        />
      </div>
    </div>

    <FileExplorerFileInfo
      v-if="fileToView"
      :file="fileToView"
      :integration="integration"
      :path="displayPath"
      @close="removeFileToView"
    />
  </div>
</template>

<script>
/* global process */

import * as api from '@/account-utils'
import Breadcrumbs from '@/components/Breadcrumbs'
import CloudUploadIcon from '@/components/icons/CloudUploadIcon'
import FileExplorerFileInfo from '@/components/storage/FileExplorerFileInfo'
import FileExplorerNewFolder from '@/components/storage/FileExplorerNewFolder'
import FileExplorerNode from '@/components/storage/FileExplorerNode'
import FileExplorerNodeDeleteConfirmation from '@/components/storage/FileExplorerNodeDeleteConfirmation'
import FileUploadOverlay from '@/components/storage/FileUploadOverlay'
import LoadingSpinner from '@/components/icons/LoadingSpinner'
import { mapState } from 'vuex'
import {
  ArrowLeftIcon,
  CheckIcon,
  FolderAddIcon,
  MinusIcon,
  ReplyIcon,
  TrashIcon
} from '@heroicons/vue/outline'

export default {
  name: 'FileExplorer',
  components: {
    ArrowLeftIcon,
    Breadcrumbs,
    CheckIcon,
    CloudUploadIcon,
    FileExplorerFileInfo,
    FileExplorerNode,
    FileExplorerNodeDeleteConfirmation,
    FileExplorerNewFolder,
    FileUploadOverlay,
    FolderAddIcon,
    LoadingSpinner,
    MinusIcon,
    ReplyIcon,
    TrashIcon
  },
  props: ['integration'],
  data() {
    return {
      showCreateFolder: false,
      creatingFolder: false,
      // currently loaded (displayed) folder
      displayPath: '',
      // number of dragEnter minus number of dragExit
      dragCounter: 0,
      nodes: [],
      fileToView: null,
      lastSelectedIndex: 0,
      loaded: false,
      loading: false,
      // selected folder, regardless of loaded state
      path: '',
      showDeleteConfirmationModal: false,
      showFileUploadOverlay: false
    }
  },
  computed: {
    ...mapState(['session']),
    allNodesSelected() {
      return this.selectedNodes.length && this.selectedNodes.length === this.nodes.length
    },
    nodeRefs() {
      return this.loaded && !this.loading && this.nodes.map(f => this.$refs[f.filename || f.folder][0])
    },
    selectedNodes() {
      return this.loaded && !this.loading && this.nodes.filter(f => this.$refs[f.filename || f.folder][0].selected)
    },
    selectedRefs() {
      return this.selectedNodes.map(f => this.$refs[f.filename || f.folder][0])
    },
    someNodesSelected() {
      return this.selectedNodes.length
    }
  },
  methods: {
    async createFolder(name) {
      if (!name) return
      try {
        this.creatingFolder = true
        const fullPath = this.path.length > 0 ? `${this.path}/${name}` : name
        await api.files.createFolder(
          process.env.VUE_APP_ACCOUNT_API_URL,
          this.session._key,
          this.integration._key,
          fullPath
        )
        await this.updateFiles()
      }
      catch (error) {
        console.error(error)
      }
      finally {
        this.creatingFolder = false
        this.cancelCreateFolder()
      }
    },
    backDir() {
      const path = this.path.split('/')
      if (path.length === 1) this.updatePath('')
      else this.updatePath(path.slice(0, path.length - 1).join('/'))
    },
    cancelCreateFolder() {
      this.showCreateFolder = false
    },
    closeFileUploadOverlay() {
      this.showFileUploadOverlay = false
    },
    deleteSelectedNodes() {
      this.selectedRefs.forEach(ref => ref.deleteNode())
      this.toggleDeleteFilesConfirmation()
    },
    // onFileDragEnter and onFileDragExit prevent the file upload overlay from flickering open/closed as a file is dragged
    onFileDragEnter() {
      this.dragCounter += 1
      this.openFileUploadOverlay()
    },
    onFileDragExit() {
      this.dragCounter -= 1
      if (this.dragCounter === 0) {
        this.closeFileUploadOverlay()
        this.resetDragCounter()
      }
    },
    onSelectNode(index) {
      this.nodeRefs.forEach((ref, i) => {
        if (index === i) ref.selected = true
        else ref.selected = false
      })
      this.lastSelectedIndex = index
    },
    onSelectNodeWithCtrl(index) {
      this.nodeRefs[index].selected = !this.nodeRefs[index].selected
      this.lastSelectedIndex = index
    },
    onSelectNodeWithShift(index) {
      const startIndex = Math.min(index, this.lastSelectedIndex)
      const endIndex = Math.max(index, this.lastSelectedIndex) + 1

      let selected = true
      if (this.nodeRefs[index].selected) selected = false

      this.nodeRefs
        .slice(startIndex, endIndex)
        .forEach((ref) => ref.selected = selected)
      this.lastSelectedIndex = index
    },
    onViewFile(file) {
      this.fileToView = file
    },
    openFileUploadOverlay() {
      this.showFileUploadOverlay = true
    },
    removeFileToView() {
      this.fileToView = null
    },
    resetDragCounter() {
      this.dragCounter = 0
    },
    startCreateFolder() {
      this.showCreateFolder = true
    },
    toggleCreateFolder() {
      this.showCreateFolder = !this.showCreateFolder
    },
    toggleSelectAllFiles() {
      if (this.allNodesSelected) this.nodeRefs.forEach(ref => ref.selected = false)
      else this.nodeRefs.forEach(ref => ref.selected = true)
    },
    toggleDeleteFilesConfirmation() {
      this.showDeleteConfirmationModal = !this.showDeleteConfirmationModal
    },
    updatePath(newPath) {
      this.path = newPath
      this.displayPath = newPath
    },
    async updateFiles() {
      try {
        this.httpError = null
        this.loading = true
        const { children } = await api.files.getNode(
          process.env.VUE_APP_ACCOUNT_API_URL,
          this.session._key,
          this.integration._key,
          this.path
        )
        this.nodes = children
        await this.$nextTick()
        this.fileToView = null
        this.loading = false
        this.loaded = true
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
    allNodesSelected() {
      if (this.allNodesSelected) this.lastSelectedIndex = this.nodeRefs.length - 1
    },
    path() {
      this.updateFiles()
    },
    someNodesSelected() {
      if (!this.someNodesSelected) this.lastSelectedIndex = 0
    }
  }
}
</script>

<style scoped>
.file-explorer {
  @apply relative flex mt-4 mb-8;
  height: 700px;
}

.node-row {
  @apply w-full grid gap-x-4 items-center py-1 pl-2 pr-1;
  grid-template-columns: max-content auto max-content max-content;
}
@screen sm {
  .node-row {
    grid-template-columns: max-content auto 150px max-content max-content;
  }
}
.node-row.selected {
  @apply bg-gray-300 rounded-md;
}

.checkbox {
  @apply border border-gray-600 rounded-sm w-4 h-4 hover:border-green cursor-pointer flex items-center justify-center;
}
.checkbox.selected {
  @apply border-green bg-green;
}
.node-row .name {
  @apply cursor-pointer hover:text-green hover:underline;
}
.node-action {
  @apply cursor-pointer;
}
.disabled {
  @apply cursor-default text-gray hover:text-gray;
}
</style>
