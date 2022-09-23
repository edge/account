<template>
  <CdnConfig
    ref="cdnConfig"
    :initialConfig=liveConfig
    @update-config=onUpdateConfig
  >
    <template v-slot:buttons>
      <div>
        <div class="flex space-x-2 justify-end mt-4">
          <button
            @click=resetChanges
            :disabled=isSaving
            class="button button--outline button--small"
          >
            Cancel Changes
          </button>
          <button
            @click=saveChanges
            :disabled="!canSaveChanges || isSaving"
            class="button button--success button--small"
          >
            <div v-if="isSaving" class="flex items-center">
              <span>Saving</span>
              <span class="ml-2"><LoadingSpinner /></span>
            </div>
            <span v-else>Save Changes</span>
          </button>
        </div>
        <div class="w-full mt-2 flex justify-end">
          <HttpError :error=httpError />
        </div>
      </div>
    </template>
  </CdnConfig>
</template>

<script>
/* global process */

import * as utils from '@/account-utils'
import CdnConfig from '@/components/cdn/CdnConfig'
import HttpError from '@/components/HttpError.vue'
import LoadingSpinner from '@/components/icons/LoadingSpinner'
import _ from 'lodash'
import { mapState } from 'vuex'

export default {
  name: 'IntegrationConfig',
  props: ['integration'],
  components: {
    CdnConfig,
    HttpError,
    LoadingSpinner
  },
  data() {
    return {
      httpError: null,
      isSaving: false,
      workingConfig: null
    }
  },
  computed: {
    ...mapState(['session']),
    canSaveChanges() {
      return this.hasConfigChanges
    },
    hasConfigChanges() {
      if(this.workingConfig) {
        const working = { ...this.workingConfig, origin: this.integration.data.config.origin }
        if (!_.isEqual(this.liveConfig, working)) return true
      }
      return false
    },
    liveConfig() {
      return { ...this.integration.data.config }
    }
  },
  methods: {
    onUpdateConfig(newConfig) {
      this.workingConfig = newConfig
    },
    resetChanges() {
      this.httpError = null
      this.$refs.cdnConfig.resetConfig()
      this.workingConfig = { ...this.integration.data.config }
    },
    async saveChanges() {
      const updatedIntegration = { ...this.integration }
      updatedIntegration.data.config = { ...updatedIntegration.data.config, ...this.workingConfig }
      try {
        this.isSaving = true
        await utils.cdn.updateIntegration(
          process.env.VUE_APP_ACCOUNT_API_URL,
          this.session._key,
          this.integration._key,
          updatedIntegration
        )
        this.$emit('refresh-integration')
      }
      catch (error) {
        /** @todo handle error */
        this.httpError = error
        console.error(error)
      }
      setTimeout(() => {
        this.isSaving = false
      }, 800)
    }
  },
  mounted() {
    this.workingConfig = { ...this.integration.data.config }
  }
}
</script>

<style scoped>

</style>
