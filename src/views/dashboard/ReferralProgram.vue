<template>
  <div class="mainContent__inner space-y-4">
    <h1>Referral Program</h1>

    <div class="flex flex-col space-y-4 lg:grid lg:grid-cols-2 lg:gap-x-6 lg:space-y-0">
      <div class="box"><ReferralCode /></div>
      <div class="box opacity-40">
        <h4>Performance</h4>
        <div class="cat">
          Referred Accounts: <span class="monospace">0</span>
        </div>
        <div class="cat">
          Payments: <span class="monospace">0</span>
        </div>
        <div class="cat">
          Balance:
            <span v-if="account.useCryptoView">0.000000 <small>XE</small></span>
            <span>0.00 <small>USD</small></span>
        </div>
      </div>
    </div>

    <div class="box opacity-40">
      <h4>Referral History</h4>

      <div class="mt-4 overflow-hidden lg:border lg:border-gray-300 lg:rounded-lg">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="hidden lg:table-header-group tableHead">
            <tr>
              <TableHeader
                header="Date"
                width="15%"
                class="tableHead__cell"
              />
              <TableHeader
                header="Time"
                width="15%"
                class="tableHead__cell"
              />
              <TableHeader
                header="Account"
                class="tableHead__cell"
              />
              <TableHeader
                header="Referral Percent"
                class="tableHead__cell"
              />
              <TableHeader
                header="Value"
                class="tableHead__cell"
              />
            </tr>
          </thead>
          <tbody class="tableBody">
            <tr>
              <td colspan="5" class="tableBody__cell text-center text-gray-500">No referrals</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="box opacity-40">
      <h4>Payout History</h4>

      <div class="mt-4 overflow-hidden lg:border lg:border-gray-300 lg:rounded-lg">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="hidden lg:table-header-group tableHead">
            <tr>
              <TableHeader
                header="Reference"
                class="tableHead__cell"
              />
              <TableHeader
                header="Date"
                width="15%"
                class="tableHead__cell"
              />
              <TableHeader
                header="Time"
                width="15%"
                class="tableHead__cell"
              />
              <TableHeader
                header="Sent (USD)"
                class="tableHead__cell"
              />
              <TableHeader
                header="Received (XE)"
                class="tableHead__cell"
              />
              <TableHeader
                header="Status"
                class="tableHead__cell"
              />
            </tr>
          </thead>
          <tbody class="tableBody">
            <tr>
              <td colspan="6" class="tableBody__cell text-center text-gray-500">No payouts</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import ReferralCode from '@/components/ReferralCode'
import TableHeader from '@/components/TableHeader'
import { mapState } from 'vuex'

export default {
  name: 'Billing',
  title() {
    return 'Edge Account Portal » Billing'
  },
  components: {
    ReferralCode,
    TableHeader
  },
  computed: {
    ...mapState(['account'])
  }
}
</script>
<style scoped>
.cat {
  @apply mb-2;
}

.cat span {
  @apply text-gray-600;
  display: block;
}

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
