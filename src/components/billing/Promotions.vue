<script setup>
/* global process */

import * as api from '@/account-utils'
import * as format from '@/utils/format'
import LoadingSpinner from '@/components/icons/LoadingSpinner.vue'
import PromotionTable from './PromotionTable.vue'
import { useStore } from 'vuex'
import { useVuelidate } from '@vuelidate/core'
import { computed, reactive, ref } from 'vue'
import { helpers, required } from '@vuelidate/validators'

const store = useStore()
const balance = store.state.balance
const session = store.state.session

const formState = reactive({
  code: ''
})

const v$ = useVuelidate({
  code: [required, helpers.withMessage('Invalid format', value => /^[A-Za-z0-9-]+$/.test(value))]
}, formState)

const canSubmit = computed(() => v$.value.$anyDirty && !v$.value.$invalid)

const loading = ref(false)
const error = ref()

function formatUSD(usd) {
  return `$${format.usd(usd, 2)}`
}

async function submit() {
  loading.value = true
  error.value = undefined
  try {
    await api.promos.redeem(
      process.env.VUE_APP_ACCOUNT_API_URL,
      session._key,
      session.account,
      formState.code
    )
    v$.value.code.$model = ''
    v$.value.$reset()
  }
  catch (err) {
    error.value = err
  }
  finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="flex flex-col space-y-4">
    <div class="box">
      <h4>Active Promotional Codes</h4>
      <p v-if="balance && balance.credit.usd">You have {{ formatUSD(balance.credit.usd) }} credit available.</p>
      <p v-else>You do not have any credit at the moment.</p>

      <PromotionTable limit="4" :status="['active', 'partConsumed']" />
    </div>

    <div class="box">
      <h4>Redeem a Promotional Code</h4>

      <p>Redeem a code to claim credit or a discount:</p>

      <div class="input-field flex items-center w-full">
        <input
          v-model="v$.code.$model"
          label="Promotional code"
          autocomplete="off"
          class="text-center overflow-hidden flex-1 px-3 py-2 text-lg rounded-md rounded-r-none focus:outline-none border border-gray border-r-0"
          placeholder="YOURCODEHERE"
          @keypress.enter=submit
        />
        <button
          class="rounded-l-none text-sm py-3 button button--success w-32"
          @click="submit"
          :disabled="!canSubmit"
        >
          <div v-if="loading" class="flex flex-row items-center">
            <span>Redeeming...</span>
            <span class="ml-2"><LoadingSpinner /></span>
          </div>
          <span v-else>Redeem</span>
        </button>
        <div v-if="error">{{ error.message }}</div>
        <div v-for="err in v$.code.$errors" :key="err.$uid">{{ err.$message }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
</style>
