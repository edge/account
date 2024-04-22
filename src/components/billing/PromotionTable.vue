<script setup>
/* global process */

import * as api from '@/account-utils'
import LoadingTableDataRow from '@/components/LoadingTableDataRow'
import Pagination from '@/components/Pagination'
import PromotionTableItem from '@/components/billing/PromotionTableItem'
import TableHeader from '@/components/TableHeader'
import { useStore } from 'vuex'
import { defineProps, effect, ref } from 'vue'

const props = defineProps(['status'])
const session = useStore().state.session

const entitlements = ref()
const metadata = ref({ totalCount: 0 })
const loading = ref(false)
const error = ref()

const limit = props.limit || 10
const page = ref(1)
const sort = ref('')

async function reload() {
  const params = {
    limit,
    page: page.value
  }
  if (sort.value) params.sort = [sort.value, '-created']
  if (props.status) params.status = props.status

  loading.value = true
  error.value = undefined
  try {
    const res = await api.promos.getEntitlements(
      process.env.VUE_APP_ACCOUNT_API_URL,
      session._key,
      params
    )
    entitlements.value = res.results
    metadata.value = res.metadata
  }
  catch (err) {
    error.value = err
  }
  finally {
    loading.value = false
  }
}

function setPage(p) {
  page.value = p
  reload()
}

function setSort(s) {
  sort.value = s
  reload()
}

effect(() => {
  reload()
})
</script>

<template>
  <div>
    <div class="mt-4 overflow-hidden lg:border lg:border-gray-300 lg:rounded-lg">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="hidden lg:table-header-group tableHead">
          <tr>
            <TableHeader
              header="Date"
              param="created"
              width="15%"
              class="tableHead__cell"
              :sortQuery="sort"
              @update-sort="setSort"
            />
            <TableHeader
              header="Code"
              class="tableHead__cell"
            />
            <TableHeader
              header="Description"
              class="tableHead__cell"
            />
            <TableHeader
              header="Type"
              class="tableHead__cell"
            />
            <TableHeader
              header="Value"
              class="tableHead__cell"
            />
            <TableHeader
              header="Status"
              param="status"
              class="tableHead__cell"
            />
            <TableHeader
              header="Expires"
              param="expires"
              width="15%"
              class="tableHead__cell"
              :sortQuery="sort"
              @update-sort="setSort"
            />
          </tr>
        </thead>
        <tbody class="tableBody">
          <LoadingTableDataRow v-if="!entitlements" colspan="7" />
          <tr v-else-if="!entitlements.length">
            <td colspan="7" class="tableBody__cell text-center text-gray-500 py-4">No entitlements</td>
          </tr>
          <PromotionTableItem
            v-else
            v-for="entitlement in entitlements"
            :entitlement="entitlement"
            :key="entitlement._key"
          />
        </tbody>
      </table>
    </div>
    <Pagination
      :border="true"
      :currentPage=page
      :limit=limit
      :totalCount="metadata.totalCount"
      @change-page=setPage
    />
  </div>
</template>

<style scoped>
.tableHead {
  @apply border-gray-300 border-b rounded-lg w-full bg-gray-50;
}
.tableHead__cell {
  @apply px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase;
}
.tableBody {
  @apply bg-white divide-y divide-gray-200;
}

table {
  @apply table-fixed w-full;
}
table, tbody {
  @apply block;
}

@screen lg {
  table {
    @apply table;
  }

  tbody {
    @apply table-row-group;
  }

  tr {
    @apply table-row py-0;
  }

  .tableBody__cell {
    @apply text-sm pl-6 py-4 table-cell align-middle w-full overflow-ellipsis overflow-hidden whitespace-nowrap;
  }
}
</style>
