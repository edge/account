<template>
  <div class="box">
    <h4>Display Name</h4>
    <div class="flex flex-col pb-2 space-y-6">
      <div class="input-group">
        <input
          v-model="v$.displayName.$model"
          class="input input--floating"
          placeholder="Enter a display name"
          type="text"
          :disabled=disableControls
          :class="disableControls ? 'disabled' : ''"
        />
        <ValidationError :errors="v$.displayName.$errors" />
      </div>
    </div>
  </div>
</template>

<script>
import * as validation from '@/utils/validation'
import ValidationError from '@/components/ValidationError.vue'
import useVuelidate from '@vuelidate/core'

export default {
  name: 'CdnDisplayName',
  props: ['disableControls', 'initialDisplayName'],
  components: {
    ValidationError
  },
  data() {
    return {
      displayName: this.initialDisplayName || ''
    }
  },
  validations() {
    return {
      displayName: [
        validation.required
      ]
    }
  },
  methods: {
    resetDetails() {
      this.displayName = this.initialDisplayName || ''
    },
    updateDetails() {
      this.$emit('update-details', this.displayName)
    }
  },
  setup() {
    return {
      v$: useVuelidate()
    }
  },
  watch: {
    displayName() {
      this.updateDetails()
    }
  }
}
</script>

<style scoped>
</style>
