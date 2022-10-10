<template>
  <div class="flex justify-end">
    <div class="toggle-wrapper">
      <span class="toggle" @click="updatePeriod('day')" :class="isSelected('day') ? 'selected' : ''">24 hours</span>
      <span
        class="toggle" @click="updatePeriod('week')"
        :class="[
          isSelected('week') ? 'selected' : '',
          isSelected('day') ? 'no-left' : '',
          isSelected('month') ? 'no-right' : ''
        ]"
      >
        7 days
      </span>
      <span class="toggle" @click="updatePeriod('month')" :class="isSelected('month') ? 'selected' : ''">30 days</span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'IntegrationsMetricsRangeToggle',
  props: ['period'],
  methods: {
    isSelected(period) {
      return this.period === period
    },
    updatePeriod(newPeriod) {
      this.$emit('update-period', newPeriod)
    }
  }
}
</script>

<style scoped>
.toggle-wrapper {
  @apply flex items-center my-4 justify-end;
}

.toggle {
  @apply flex items-center justify-center text-gray p-1 rounded-none w-20 text-xs cursor-pointer border border-solid uppercase;
  border-color: #afafaf
}

.toggle:first-child {
  border-top-left-radius: 0.25rem;
  border-bottom-left-radius: 0.25rem;
  border-right: none;
}
.toggle:last-child {
  border-top-right-radius: 0.25rem;
  border-bottom-right-radius: 0.25rem;
  border-left: none;
}
.toggle.no-left {
  border-left: none;
}
.toggle.no-right {
  border-right: none;
}

.toggle.selected {
  @apply text-white border border-solid;
  background-color: rgb(14, 204, 95);
  border-color: rgb(14, 204, 95)
}
</style>
