<template>
  <div class="flex mb-4">
    <div v-if=isEditing>
      <input
        v-model="v$.newDisplayName.$model"
        @keypress.enter="confirmEdit"
        ref="integration-name-input"
        class="displayName__input"
        placeholder="Enter a display name"
        type="text"
      />
      <ValidationError :errors="v$.newDisplayName.$errors" />
    </div>
    <h1 v-else class="w-max mb-0">{{ integration.name }}</h1>

    <div v-if=isEditing class="mt-3">
      <button @click=confirmEdit :disabled="!canConfirmEdit" class="ml-2">
        <LoadingSpinner v-if=isSaving />
        <CheckIcon v-else class="button__icon text-green hover:text-green-600" />
      </button>
      <button v-if="!isSaving" @click=cancelEditing class="ml-2">
        <XIcon class="button__icon text-red hover:text-red-600" />
      </button>
    </div>
    <div v-else class="mt-3">
      <button v-if="!disableControls" @click=startEditing class="ml-2">
        <PencilIcon class="button__icon text-gray-400 hover:text-green" />
      </button>
    </div>
  </div>
</template>

<script>
/* global process */

import * as api from '@/account-utils'
import * as validation from '@/utils/validation'
import LoadingSpinner from '@/components/icons/LoadingSpinner.vue'
import ValidationError from '@/components/ValidationError.vue'
import { mapState } from 'vuex'
import useVuelidate from '@vuelidate/core'
import { CheckIcon, PencilIcon, XIcon } from '@heroicons/vue/outline'

export default {
  name: 'IntegrationDisplayName',
  props: ['disableControls', 'integration'],
  components: {
    CheckIcon,
    LoadingSpinner,
    PencilIcon,
    ValidationError,
    XIcon
  },
  data() {
    return {
      isEditing: false,
      isSaving: false,
      newDisplayName: ''
    }
  },
  validations() {
    return {
      newDisplayName: [
        validation.required
      ]
    }
  },
  computed: {
    ...mapState(['session']),
    canConfirmEdit() {
      return !this.v$.$invalid
    }
  },
  methods: {
    cancelEditing() {
      this.isEditing = false
    },
    async confirmEdit() {
      if (!this.canConfirmEdit) return
      try {
        this.isSaving = true
        await api.integration.updateIntegration(
          process.env.VUE_APP_ACCOUNT_API_URL,
          this.session._key,
          this.integration._key,
          {
            ...this.integration,
            name: this.newDisplayName
          }
        )
        this.$emit('update-integration')
        setTimeout(() => {
          this.isSaving = false
          this.isEditing = false
        }, 800)
      }
      catch (error) {
        setTimeout(() => {
          console.error(error)
        }, 800)
      }
    },
    async startEditing() {
      this.isEditing = true
      this.newDisplayName = this.integration.name
      await (this.$nextTick())
      this.$refs['integration-name-input'].focus()
    }
  },
  setup() {
    return {
      v$: useVuelidate()
    }
  }
}
</script>

<style scoped>
.displayName__input {
  @apply bg-transparent text-3xl text-gray-600 border-b border-gray-400 w-full;
  @apply focus:outline-none focus:border-green focus:text-green;
}

.button__icon {
  @apply w-5 ml-1;
}
button:disabled, button:disabled .button__icon {
  @apply text-gray-400 hover:no-underline;
}
</style>
