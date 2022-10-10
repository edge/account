<template>
  <div class="space-y-4">
    <div class="box">
      <h4>Flush Cache</h4>
      <div class="cache__form">
        <div class="input-group flex-1 path">
          <label class="label">Asset path</label>
          <input
            v-model="v$.path.$model"
            class="input input--floating"
            placeholder="e.g. /photos/*.jpg"
            type="text"
            @keypress.enter=flushCache
            :disabled=disableControls
            :class="disableControls ? 'disabled' : ''"
          />
          <ValidationError :errors="v$.path.$errors" />
        </div>
        <!-- add button -->
        <button
          @click=flushCache
          :disabled="!canFlushCache"
          class="button button--success button--small"
        >
          <div v-if="isFlushingCache" class="flex items-center">
            <span>Flushing Cache</span>
            <div><LoadingSpinner class="ml-1 w-4" /></div>
          </div>
          <span v-else>Flush Cache</span>
        </button>
      </div>
      <div class="mt-1"><HttpError :error=httpError /></div>
    </div>
  </div>
</template>

<script>
/* global process */

import * as api from '@/account-utils'
import * as validation from '@/utils/validation'
import HttpError from '@/components/HttpError'
import LoadingSpinner from '@/components/icons/LoadingSpinner'
import ValidationError from '@/components/ValidationError.vue'
import { mapState } from 'vuex'
import useVuelidate from '@vuelidate/core'

export default {
  name: 'IntegrationCache',
  props: ['disableControls', 'integration'],
  components: {
    HttpError,
    LoadingSpinner,
    ValidationError
  },
  data() {
    return {
      httpError: null,
      isFlushingCache: false,
      path: ''
    }
  },
  validations() {
    return {
      path: [
        validation.integrationPath
      ]
    }
  },
  computed: {
    ...mapState(['balance', 'session']),
    canFlushCache() {
      return !this.v$.path.$invalid
    }
  },
  methods: {
    async flushCache() {
      if (!this.canFlushCache) return
      this.isFlushingCache = true
      try {
        // this.toggleConfirmationModal()
        await api.integration.flushCache(
          process.env.VUE_APP_ACCOUNT_API_URL,
          this.session._key,
          this.integration._key,
          this.path
        )
        setTimeout(async () => {
          this.path = ''
          await this.v$.$reset()
          this.isFlushingCache = false
        }, 800)
      }
      catch (error) {
        setTimeout(() => {
          this.httpError = error
          this.isFlushingCache = false
        }, 800)
      }
    }
  },
  setup() {
    return {
      v$: useVuelidate()
    }
  },
  watch: {
    path() {
      this.httpError = null
    }
  }
}
</script>

<style scoped>
.cache__form {
  @apply flex flex-col space-y-2;
}

@media (min-width: 450px) {
  .cache__form {
    @apply flex flex-row pb-0 border-b-0 space-x-4 space-y-0;
  }
  .cache__form .button {
    @apply w-max h-full flex-shrink-0;
    margin-top: 1rem !important;
  }
}
</style>
