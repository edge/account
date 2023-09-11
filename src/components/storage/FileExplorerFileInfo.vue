<template>
  <div class="file-info-pane">
    <div class="header grid gap-x-2">
      <div class="row-span-2 w-max"><DocumentTextIcon class="h-10"/></div>
      <div class="col-start-2 text-lg text-black">{{ file.filename }}</div>
      <div class="col-start-2 text-xs">{{ formattedSize }}</div>
    </div>
    <div class="pt-4">
      <h4>Information</h4>
      <div class="flex flex-col space-y-2">
        <div class="info size">
          <span class="label">Size:</span>
          <span>{{ formattedSize }}</span>
        </div>
        <div class="info uploaded">
          <span class="label">Uploaded:</span>
          <span>{{ formattedCreated }}</span>
        </div>
        <div class="info modified">
          <span class="label">Last Modified:</span>
          <span>{{ formattedUpdated }}</span>
        </div>
      </div>
    </div>

    <!-- close (chevron) icon -->
    <button @click="close" class="close-icon">
      <ChevronRightIcon class="w-6" />
    </button>
  </div>
</template>

<script>
import * as format from '@/utils/format'
import { mapState } from 'vuex'
import {
  ChevronRightIcon,
  DocumentTextIcon
} from '@heroicons/vue/outline'

export default {
  name: 'FileExplorerFileInfo',
  components: {
    ChevronRightIcon,
    DocumentTextIcon
  },
  props: ['integration', 'file', 'path'],
  data() {
    return {
    }
  },
  computed: {
    ...mapState(['session']),
    formattedCreated() {
      return `${format.date(this.file.created)}, ${format.time(this.file.created)}`
    },
    formattedSize() {
      return format.bytes(this.file.size)
    },
    formattedUpdated() {
      return `${format.date(this.file.updated)}, ${format.time(this.file.updated)}`
    }
  },
  methods: {
    close() {
      this.$emit('close')
    }
  }
}
</script>

<style scoped>
.file-info-pane {
  @apply relative hidden md:flex flex-col flex-shrink-0 space-y-2 ml-4 px-4 border-l border-gray;
  width: 40%;
  max-width: 550px;
}
.header {
  grid-template-columns: max-content auto;
}

.info {
  @apply w-full flex justify-between;
}

.close-icon {
  @apply absolute border border-gray rounded-md bg-white text-gray hover:text-green hover:border-green;
  top: calc(50% - 12px);
  left: -12px;
}
</style>
