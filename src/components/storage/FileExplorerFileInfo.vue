<template>
  <div class="file-info-pane">
    <div class="header grid gap-x-2">
      <div class="row-span-2 w-max"><DocumentTextIcon class="h-10"/></div>
      <div class="col-start-2 text-lg text-black">{{ file.filename }}</div>
      <div class="col-start-2 text-xs">{{ formattedSize }}</div>

      <!-- close (chevron) icon -->
      <button @click="close" class="row-start-1 col-start-3 row-span-2 close-icon">
        <ChevronRightIcon class="hidden md:block w-6" />
        <XIcon class="w-6 md:hidden" />
      </button>
    </div>
    <div class="pt-4">
      <h4>Information</h4>
      <div class="flex flex-col space-y-2">
        <div class="info size">
          <span class="label">Size:</span>
          <span class="value">{{ formattedSize }}</span>
        </div>
        <div class="info uploaded">
          <span class="label">Uploaded:</span>
          <span class="value">{{ formattedCreated }}</span>
        </div>
        <div class="info modified">
          <span class="label">Last Modified:</span>
          <span class="value">{{ formattedUpdated }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import * as format from '@/utils/format'
import { mapState } from 'vuex'
import {
  ChevronRightIcon,
  DocumentTextIcon,
  XIcon
} from '@heroicons/vue/outline'

export default {
  name: 'FileExplorerFileInfo',
  components: {
    ChevronRightIcon,
    DocumentTextIcon,
    XIcon
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
  @apply w-full bg-white rounded-md absolute top-0 left-0 md:relative flex flex-col flex-shrink-0 space-y-2 px-4 border-gray;
}
.header {
  @apply mt-4;
  grid-template-columns: max-content auto max-content;
}

.info {
  @apply w-full flex flex-col;
}
.info .label {
  @apply text-black;
}
.info .value {
  @apply text-gray-500;
}

@screen md {
  .file-info-pane {
    @apply relative ml-4 border-l;
    width: 40%;
    max-width: 550px;
  }
  .header {
    @apply mt-0;
    grid-template-columns: max-content auto max-content;
  }
  .close-icon {
    @apply absolute border border-gray rounded-md bg-white text-gray hover:text-green hover:border-green;
    top: calc(50% - 12px);
    left: -12px;
  }
}
</style>
