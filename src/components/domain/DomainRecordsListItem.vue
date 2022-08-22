<template>
  <li class="recordList__item">
    <div class="recordList__field type">
      <span class="recordList__header">Type</span>
      <!-- server name -->
      <span class="recordList__value">{{ record.type }}</span>
    </div>
    <!-- server details -->
    <div class="recordList__field name overflow-hidden">
      <span class="recordList__header">Hostname</span>
      <span class="recordList__value">{{ record.name }}</span>
    </div>
    <!-- domain records -->
    <div class="recordList__field value">
      <!-- records -->
      <span class="recordList__header">Value</span>
      <span class="recordList__value">{{ record.value }}</span>
    </div>
    <!-- created -->
    <div class="recordList__field ttl">
      <span class="recordList__header">TTL</span>
      <span class="recordList__value">{{ record.ttl }}</span>
    </div>
    <!-- options -->
    <div class="recordList__field options justify-center">
      <Popover as='div' class="relative w-full">
        <PopoverButton class="flex items-center hidden sm:block">
          <CogIcon class="w-6" />
        </PopoverButton>
        <PopoverPanel :static="!sm" class="options__dropdown">
          <button class="tableButton edit w-max sm:hover:underline">
            <div>
              <PencilIcon class="tableButton__icon" />
            </div>
            Edit
          </button>
          <button
            @click=toggleDeleteConfirmationModal
            class="tableButton delete w-max text-red sm:hover:underline"
          >
            <div>
              <LoadingSpinner v-if=isDeleting class="tableButton__icon" />
              <TrashIcon v-else class="tableButton__icon" />
            </div>
            Delete
          </button>
        </PopoverPanel>
      </Popover>
    </div>
  </li>
  <!-- eslint-disable-next-line vue/no-multiple-template-root-->
  <DeleteRecordConfirmation
    v-if=showDeleteConfirmationModal
    :record=record
    @modal-confirm=deleteRecord
    @modal-close=toggleDeleteConfirmationModal
  />
</template>

<script>
/* global process */

import * as utils from '@/account-utils'
import DeleteRecordConfirmation from '@/components/confirmations/DeleteRecordConfirmation'
import LoadingSpinner from '@/components/icons/LoadingSpinner'
import { mapState } from 'vuex'
import moment from 'moment'
import {
  CogIcon,
  ExclamationIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/vue/outline'
import { Popover, PopoverButton, PopoverPanel } from '@headlessui/vue'

export default {
  name: 'DomainRecordsListItem',
  components: {
    CogIcon,
    DeleteRecordConfirmation,
    ExclamationIcon,
    LoadingSpinner,
    PencilIcon,
    Popover,
    PopoverButton,
    PopoverPanel,
    TrashIcon
  },
  data() {
    return {
      isDeleting: false,
      showDeleteConfirmationModal: false,
      showOptions: false,
      windowWidth: window.innerWidth
    }
  },
  props: ['record'],
  computed: {
    ...mapState(['session']),
    created() {
      const created = moment(this.record.created).fromNow()
      return created === 'a few seconds ago' ? 'Just now' : created
    },
    sm() {
      return this.windowWidth >= 640
    }
  },
  methods: {
    toggleShowOptions() {
      this.showOptions = !this.showOptions
    },
    async deleteRecord() {
      this.isDeleting = true
      this.toggleDeleteConfirmationModal()
      try {
        await utils.dns.deleteRecord(
          process.env.VUE_APP_ACCOUNT_API_URL,
          this.session._key,
          this.record.zone,
          this.record._key
        )
      }
      catch (error) {
        /** @todo handle error */
        console.error(error)
      }
      setTimeout(() => {
        this.isDeleting = false
      }, 800)
    },
    onWindowResize() {
      this.windowWidth = window.innerWidth
    },
    toggleDeleteConfirmationModal() {
      this.showDeleteConfirmationModal = !this.showDeleteConfirmationModal
    }
  },
  mounted() {
    window.addEventListener('resize', this.onWindowResize)
  },
  unmounted() {
    window.removeEventListener('resize', this.onWindowResize)
  }
}
</script>
<style scoped>
/* list item */
.recordList__item {
  @apply grid grid-cols-2 gap-2 bg-white text-gray-500 rounded-md w-full p-5 pr-8;
}

/* list item content */
.recordList__field {
  @apply flex flex-col;
}
.recordList__header {
  @apply text-sm mr-2;
}
.recordList__value {
  @apply text-sm text-black truncate;
}
.type {
  @apply row-start-2;
}
.ttl {
  @apply col-start-2;
}
.options {
  @apply col-span-2;
}
.options__dropdown {
  @apply flex w-full space-x-2 justify-between
}

@screen sm {
  .recordList__item {
    @apply flex flex-row space-y-0 justify-between gap-x-4;
  }

  .type {
    @apply flex-shrink-0;
    flex-basis: 60px;
  }
  .name {
    @apply col-span-1 row-span-2 justify-center;
    flex-basis: 320px;
  }
  .value {
    flex-basis: 320px;
  }
  .ttl {
    @apply col-start-4 row-start-1 flex-shrink-0;
    flex-basis: 60px;
  }

  .options__dropdown {
    @apply flex flex-col space-x-0 space-y-2 pl-2 pr-4 py-2;
    @apply absolute right-0 top-8 z-10 w-max overflow-auto text-base bg-white rounded-md shadow-lg ring-1 ring-green ring-opacity-5 focus:outline-none sm:text-sm;
  }
  .tableButton {
    @apply flex items-center;
  }
  .tableButton__icon {
    @apply w-4 mr-1;
  }
}

@media (max-width: 640px) {
  .tableButton {
    @apply button button--extraSmall w-1/2 leading-none;
  }
  .tableButton.edit {
    @apply button--success;
  }
  .tableButton.delete {
    @apply button--error;
  }
  .tableButton__icon {
    @apply w-3.5 mr-1;
  }
}

@media (max-width: 400px) {
  .recordList__item {
    @apply flex flex-col
  }
  .options {
    @apply col-span-1;
  }
  .options__dropdown {
    @apply flex-col space-x-0 space-y-2;
  }
  .tableButton {
    @apply w-full;
  }
}
</style>
