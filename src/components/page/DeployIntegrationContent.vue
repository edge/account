<template>
  <div class="box">
    <h4>Content</h4>
    <div class="flex flex-col pb-2 space-y-6">
      <div class="input-group">
        <textarea
          v-model="v$.content.$model"
          class="w-full border border-gray rounded p-4 monospace"
          cols="30" rows="15"
          :disabled=disableControls
          :class="disableControls ? 'disabled' : ''"
        >
        </textarea>
        <ValidationError :errors="v$.content.$errors" />
      </div>
    </div>
  </div>
</template>

<script>
import * as validation from '@/utils/validation'
import ValidationError from '@/components/ValidationError.vue'
import useVuelidate from '@vuelidate/core'

export default {
  name: 'DeployIntegrationContent',
  props: ['disableControls', 'initialContent'],
  components: {
    ValidationError
  },
  data() {
    return {
      content: this.initialContent || ''
    }
  },
  validations() {
    return {
      content: [
        validation.required
        // TODO: length
      ]
    }
  },
  methods: {
    resetDetails() {
      this.content = this.initialContent || ''
    },
    updateDetails() {
      this.$emit('update-details', this.content)
    }
  },
  setup() {
    return {
      v$: useVuelidate()
    }
  },
  watch: {
    content() {
      this.updateDetails()
    }
  }
}
</script>
