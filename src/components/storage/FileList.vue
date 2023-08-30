<template>
  <div class="box mt-4 mb-8">
    <div class="flex justify-between w-full items-center">
      <Breadcrumbs @update-path="onUpdatePath" :path="path" />
      <div class="flex space-x-2">
        <button class="button button--extraSmall button--outline-success">
          <div><DocumentAddIcon class="w-6 h-6" /></div>
        </button>
        <button class="button button--extraSmall button--outline-success">
          <div><FolderAddIcon class="w-6 h-6" /></div>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
/* global process */

import * as api from '@/account-utils'
import * as validation from '@/utils/validation'
import Breadcrumbs from '@/components/Breadcrumbs'
import HttpError from '@/components/HttpError'
import LoadingSpinner from '@/components/icons/LoadingSpinner'
import LoadingTableDataRow from '@/components/LoadingTableDataRow'
import TableHeader from '@/components/TableHeader'
import {
  DocumentAddIcon,
  DocumentTextIcon,
  FolderAddIcon,
  FolderIcon,
  FolderOpenIcon
} from '@heroicons/vue/outline'

export default {
  name: 'FileList',
  components: {
    Breadcrumbs,
    DocumentAddIcon,
    DocumentTextIcon,
    FolderAddIcon,
    FolderIcon,
    FolderOpenIcon,
    HttpError,
    LoadingSpinner,
    LoadingTableDataRow,
    TableHeader
  },
  props: ['instance'],
  data() {
    return {
      // @TODO test path/files
      path: 'my-test-storage/lib/assets',
      files: [
        { filename: 'photos/1.jpg', size: 213490 },
        { filename: 'photos/2.jpg', size: 213490 },
        { filename: 'photos/3.jpg', size: 213490 },
        { filename: 'something.doc', size: 213490 },
        { filename: 'docs/letter.pdf', size: 213490 }
      ]
    }
  },
  computed: {
  },
  methods: {
    onUpdatePath(newPath) {
      this.path = newPath
    }
  }
}
</script>

<style scoped>

</style>
