<script setup>
/* global process */
import * as api from '@/account-utils'
import HttpError from '../HttpError.vue'
import cron from 'cron-validate'
import { required } from '@vuelidate/validators'
import { useStore } from 'vuex'
import useVuelidate from '@vuelidate/core'
import { computed, reactive, ref } from 'vue'

const props = defineProps({
  server: null
})

const store = useStore()

// Form/conversion constants
const hours = (new Array(24)).fill(null).map((n, i) => `${i.toString().padStart(2, '0')}:00`)
const daysOfWeek = ['S', 'M', 'T', 'W', 'Th', 'F', 'Sa']
const daysOfMonth = (new Array(31)).fill(null).map((n, i) => (i + 1).toString())
const retentionWeeks = (new Array(8)).fill(null).map((n, i) => (i + 1).toString())
const week = 1000 * 60 * 60 * 24 * 7

// Form state
const loading = ref(false)
const error = ref()

// Parse current backup strategy, if server has one
const currentConfig = computed(() => {
  const c = {
    enabled: props.server.backups !== null,
    hours: null,
    daysOfWeek: null,
    daysOfMonth: null,
    retention: null
  }

  if (!c.enabled) return c

  const strategy = props.server.backups.strategy
  const cronResult = cron(strategy.schedule)
  if (!cronResult.isValid()) {
    c.enabled = false
    return c
  }

  const value = cronResult.getValue()

  c.hours = `${value.hours.padStart(2, '0')}:00`

  if (value.daysOfMonth !== '*') {
    // Monthly
    c.daysOfMonth = parseInt(value.daysOfMonth).toString()
  }
  else if (value.daysOfWeek !== '*') {
    // Weekly
    c.daysOfWeek = value.daysOfWeek.split(',').map(i => daysOfWeek[i])
  }
  else {
    // Daily (select all days)
    c.daysOfWeek = [...daysOfWeek]
  }

  c.retention = (strategy.retention / week).toString()

  return c
})

const period = ref(currentConfig.value.daysOfWeek !== null ? 'week' : 'month')

const formState = reactive({
  hours: currentConfig.value.hours || '00:00',
  daysOfWeek: currentConfig.value.daysOfWeek || [...daysOfWeek],
  daysOfMonth: currentConfig.value.daysOfMonth || '1',
  retention: currentConfig.value.retention || '1'
})

const v$ = useVuelidate({
  hours: [required],
  daysOfWeek: [],
  daysOfMonth: [],
  retention: [required]
}, formState)

async function disable() {
  try {
    loading.value = true
    error.value = undefined
    await api.servers.disableBackupStrategy(
      process.env.VUE_APP_ACCOUNT_API_URL,
      store.state.session._key,
      props.server._key
    )
  }
  catch (err) {
    error.value = err
  }
  finally {
    loading.value = false
  }
}

function setPeriod(e) {
  period.value = e.target.value
}

async function submit() {
  if (!await v$.value.$validate()) return

  // Generate cron schedule based on form data
  let schedule = ''
  const hours = parseInt(formState.hours.match(/^[0-9]{2}/))
  if (period.value === 'week') {
    let days = '*'
    if (formState.daysOfWeek.length < daysOfWeek.length) {
      days = formState.daysOfWeek.map(d => daysOfWeek.indexOf(d).toString()).sort().join(',')
    }
    schedule = `0 ${hours} * * ${days}`
  }
  else if (period.value === 'month') {
    schedule = `0 ${hours} ${formState.daysOfMonth.toString()} * *`
  }

  const strategy = {
    schedule,
    retention: parseInt(formState.retention * week)
  }

  try {
    loading.value = true
    error.value = undefined
    await api.servers.configureBackupStrategy(
      process.env.VUE_APP_ACCOUNT_API_URL,
      store.state.session._key,
      props.server._key,
      strategy
    )
  }
  catch (err) {
    error.value = err
  }
  finally {
    loading.value = false
  }
}

function toggleDayOfWeek(e) {
  const i = daysOfWeek.indexOf(e.target.value)
  if (i < 0 || i > daysOfWeek.length - 1) return
  if (formState.daysOfWeek.includes(e.target.value)) {
    v$.value.daysOfWeek.$model = formState.daysOfWeek.filter(d => d !== e.target.value)
  }
  else {
    v$.value.daysOfWeek.$model = [...formState.daysOfWeek, e.target.value]
  }
}
</script>

<template>
  <div class="box">
    <h4>Backup Strategy</h4>

    <form @submit.prevent="submit">
      <label for="period">Period</label>
      <select name="period" @change="setPeriod">
        <option value="week" :selected="period === 'week'">Week</option>
        <option value="month" :selected="period === 'month'">Month</option>
      </select>

      <div v-if="period === 'week'">
        <label for="daysOfWeek">Days</label>
        <div v-for="day in daysOfWeek" :key="day">
          <input
            name="daysOfWeek"
            :id="`daysOfWeek-${day}`"
            :checked="formState.daysOfWeek.includes(day)"
            :value="day" type="checkbox"
            @change="toggleDayOfWeek"
          />
          <label :for="`daysOfWeek-${day}`">{{ day }}</label>
        </div>
      </div>

      <div v-else-if="period === 'month'">
        <label for="daysOfMonth">Day of the month</label>
        <select name="daysOfMonth" v-model="v$.daysOfMonth.$model">
          <option v-for="day in daysOfMonth" :key="day" :value="day">{{ day }}</option>
        </select>
      </div>

      <label for="hours">Time of day</label>
      <select name="hours" v-model="v$.hours.$model">
        <option v-for="hour in hours" :key="hour" :value="hour">{{ hour }}</option>
      </select>

      <label for="retention">Backup retention (weeks)</label>
      <select name="retention" v-model="v$.retention.$model">
        <option v-for="weeks in retentionWeeks" :key="weeks" :value="weeks">{{ weeks }}</option>
      </select>

      <div class="buttons" v-if="currentConfig.enabled">
        <button
          type="submit"
          class="mt-4 sm:mt-0 button button--success button--small sm:max-w-xs"
          :disabled="loading"
        >Update settings</button>
        <button
          class="mt-4 sm:mt-0 button button--error button--small sm:max-w-xs"
          @click="disable"
          :disabled="loading"
        >Disable</button>
      </div>
      <div class="buttons" v-else>
        <button
          type="submit"
          class="mt-4 sm:mt-0 button button--success button--small sm:max-w-xs"
          :disabled="loading"
        >Enable automatic backups</button>
      </div>

      <HttpError v-if="error" :error="error" />
    </form>
  </div>
</template>
