<template>
  <div class="box">
    <h4>Details</h4>
    <div class="flex flex-col space-y-4">
      <div class="details__item">
        <span class="details__label">Display Name</span>
        <span class="details__info"></span>
      </div>
      <div class="details__item">
        <span class="details__label">Origin URL</span>
        <span class="details__info"></span>
      </div>
      <div class="details__item">
        <span class="details__label">Primary Domain</span>
        <span class="details__info"></span>
      </div>
      <div class="details__item">
        <span class="details__label">Additional Domains</span>
        <span class="details__info"></span>
      </div>
      <div class="details__item">
        <span class="details__label">Status</span>
        <span class="details__info"></span>
      </div>
      <div class="details__item">
        <span class="details__label">Created</span>
        <span class="details__info"></span>
      </div>
    </div>
  </div>
</template>

<script>
import moment from 'moment'

export default {
  name: 'CdnIntegrationOverview',
  props: ['integration'],
  computed: {
    created() {
      return null
    }
  }
}
</script>

<style scoped>
.details__label {
  @apply font-bold block mr-2 flex-shrink-0 w-36;
}
</style>
