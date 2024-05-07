<script setup>
import { computed } from 'vue'

const props = defineProps({
  server: null
})

const enabled = computed(() => props.server.backups !== null)

const hours = (new Array(24)).fill(null).map((n, i) => `${i.toString().padStart('0', 2)}:00`)
const daysInWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
const daysOfMonth = (new Array(31)).fill(null).map((n, i) => (i + 1).toString())
</script>

<template>
  <div class="box">
    <h4>Backup Strategy</h4>

    <label for="period">Period</label>
    <select name="period">
      <option value="week">Week</option>
      <option value="month">Month</option>
    </select>

    <label for="daysInWeek">Days</label>
    <div v-for="(day, i) in daysInWeek" :key="i">
      <input name="daysInWeek" :id="`daysInWeek-${i}`" :value="i" type="radio" />
      <label :for="`daysInWeek-${i}`">{{ day }}</label>
    </div>

    <label for="dom">Day of the month</label>
    <select name="dom">
      <option v-for="(day, i) in daysOfMonth" :key="i" :value="i + 1">{{ day }}</option>
    </select>

    <label for="hour">Time of day</label>
    <select>
      <option v-for="(hour, i) in hours" :key="i" :value="i">{{ hour }}</option>
    </select>

    <div class="buttons" v-if="enabled">
      <button>Update settings</button>
      <button>Disable</button>
    </div>
    <div class="buttons" v-else>
      <button>Enable automatic backups</button>
    </div>
  </div>
</template>
