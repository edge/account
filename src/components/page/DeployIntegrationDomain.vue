<template>
  <div class="box">
    <h4>Domain</h4>
    <div class="flex flex-col pb-2 space-y-6">
      <div class="input-group">
        <input
          v-model="v$.domain.$model"
          class="input input--floating"
          placeholder="Enter a domain"
          type="text"
          :disabled=disableControls
          :class="disableControls ? 'disabled' : ''"
        />
        <ValidationError :errors="v$.domain.$errors" />
      </div>
    </div>
  </div>
</template>

<script>
import * as validation from '@/utils/validation'
import ValidationError from '@/components/ValidationError.vue'
import useVuelidate from '@vuelidate/core'

export default {
  name: 'DeployIntegrationDomain',
  props: ['disableControls', 'initialDomain'],
  components: {
    ValidationError
  },
  data() {
    return {
      domain: this.initialDomain || ''
    }
  },
  validations() {
    return {
      domain: [
        validation.required,
        validation.domain
      ]
    }
  },
  methods: {
    resetDetails() {
      this.domain = this.initialDomain || ''
    },
    updateDetails() {
      this.$emit('update-details', this.domain)
    }
  },
  setup() {
    return {
      v$: useVuelidate()
    }
  },
  watch: {
    domain() {
      this.updateDetails()
    }
  }
}
</script>
