<script setup>
import * as format from '@/utils/format'
import AddAccountEmail from '../../../components/account/AddAccountEmail.vue'
import Disable2FA from '../../../components/account/Disable2FA.vue'
import Enable2FA from '../../../components/account/Enable2FA.vue'
import ManageAccountEmail from '../../../components/account/ManageAccountEmail.vue'
import { useStore } from 'vuex'
import { EyeIcon, EyeOffIcon } from '@heroicons/vue/solid'
import { computed, ref } from 'vue'

const store = useStore()

const showAccountNumber = ref(false)
const showAddTwoFactor = ref(false)

const accountNumber = computed(() => {
  if (showAccountNumber.value) return format.accountNumber(store.state.account._key)
  return format.accountNumberMasked(store.state.account._key)
})

const hasEmail = computed(() => Boolean(store.state.account && store.state.account.email && store.state.account.email.address))
const hasTwoFactor = computed(() => Boolean(store.state.account && store.state.account.totps))

function toggleShowAccountNumber() {
  showAccountNumber.value = !showAccountNumber.value
}

function toggleShowAddTwoFactor() {
  showAddTwoFactor.value = !showAddTwoFactor.value
}
</script>

<template>
  <div class="space-y-4">
    <div class="box">
      <div>
        <h4>Account Number</h4>
        <p class="text-gray-500">Write down your account number and keep it secret. You can use your account number to sign into the account.</p>
      </div>
      <!-- account number display -->
      <div class="flex items-center justify-between relative w-max max-w-full">
        <span class="text-3xl pr-4 monospace" :class="{ 'text-gray': !showAccountNumber, 'text-green': showAccountNumber }">{{ accountNumber }}</span>
        <!-- hide/show account number button button -->
        <button
          @click.prevent="toggleShowAccountNumber"
          class="ml-2 text-gray-400 hover:text-green"
        >
          <EyeIcon v-if="showAccountNumber" class="ml-2 w-5 h-5" />
          <EyeOffIcon v-else class="ml-2 w-5 h-5" />
        </button>
      </div>
    </div>

    <div class="box">
      <h4>Account Email</h4>
      <div>
        <ManageAccountEmail v-if="hasEmail" />
        <AddAccountEmail v-else />
      </div>
    </div>

    <div class="box">
      <h4>Two-factor Authentication (2FA)</h4>
      <div>
        <Disable2FA v-if="hasTwoFactor && !showAddTwoFactor && !backupCodes" />
        <Enable2FA v-else @enable2FA="toggleShowAddTwoFactor" />
        <button
          v-if="hasTwoFactor && !backupCodes"
          @click="toggleShowAddTwoFactor"
          class="mt-2 underline text-gray-500 hover:text-green"
        >
          {{ showAddTwoFactor ? 'Return to remove existing 2FA code' : 'Add extra 2FA code' }}
        </button>
      </div>
    </div>
  </div>
</template>
