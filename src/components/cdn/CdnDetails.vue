<template>
  <div class="box">
    <h4>Details</h4>
    <div class="flex flex-col pb-2 space-y-6">
      <div class="input-group">
        <label class="label">Name</label>
        <input
          v-model="v$.displayName.$model"
          class="input input--floating"
          placeholder="Enter a display name"
          type="text"
        />
        <ValidationError :errors="v$.displayName.$errors" />
      </div>
      <div class="input-group">
        <label class="label">Origin URL</label>
        <input
          v-model="v$.originUrl.$model"
          class="input input--floating"
          placeholder="e.g. https://yoursite.com/photos"
          type="text"
        />
        <ValidationError :errors="v$.originUrl.$errors" />
      </div>
    </div>
    <!-- for save/cancel buttons when editing existing integrations -->
    <slot name="buttons" />
  </div>
</template>

<script>
import * as validation from '../../utils/validation'
import ValidationError from '@/components/ValidationError.vue'
import useVuelidate from '@vuelidate/core'

export default {
  name: 'CdnDetails',
  props: ['initialDisplayName', 'initialOriginUrl'],
  components: {
    ValidationError
  },
  data() {
    return {
      displayName: this.initialDisplayName || '',
      originUrl: this.initialOriginUrl || ''
    }
  },
  validations() {
    return {
      displayName: [
        validation.required
      ],
      originUrl : [
        validation.origin
      ]
    }
  },
  methods: {
    updateDetails() {
      this.$emit('update-details', this.displayName, this.originUrl)
    }
  },
  setup() {
    return {
      v$: useVuelidate()
    }
  },
  watch: {
    displayName() {
      if (this.v$.displayName.$invalid) return
      this.updateDetails()
    },
    originUrl() {
      if (this.v$.originUrl.$invalid) return
      this.updateDetails()
    }
  }
}
</script>

<style scoped>

</style>
