<template>
  <Config
    ref="instance-config"
    :disableControls="disableControls"
    :initialConfig="liveConfig"
    :initialConfigMode="liveConfigMode"
    @update-config="onUpdateConfig"
  >
    <template v-slot:buttons>
      <div>
        <div class="save__buttons">
          <button
            @click=resetChanges
            :disabled="!hasConfigChanges || isSaving"
            class="button button--outline button--small"
          >
            Cancel
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
  </Config>
</template>

<script>
/* global process */

import * as api from '@/account-utils'
import Config from '@/components/storage/Config'
import HttpError from '@/components/HttpError.vue'
import LoadingSpinner from '@/components/icons/LoadingSpinner'
import _ from 'lodash'
import { mapState } from 'vuex'

export default {
  name: 'InstanceConfig',
  props: ['disableControls', 'instance'],
  components: {
    Config,
    HttpError,
    LoadingSpinner
  },
  data() {
    return {
      configMode: null,
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
      if (this.workingConfig && !_.isEqual(this.liveConfig, this.workingConfig)) return true
      return false
    },
    liveConfig() {
      return this.instance.data.config
    },
    liveConfigMode() {
      return this.instance.configMode
    }
  },
  methods: {
    onUpdateConfig(newConfig, configMode) {
      this.workingConfig = newConfig
      this.configMode = configMode
    },
    resetChanges() {
      this.httpError = null
      this.$refs['instance-config'].resetConfig()
      this.workingConfig = { ...this.instance.data.config }
    },
    async saveChanges() {
      /** @todo save instance updates using api */
      const updatedInstance = { ...this.instance }
      updatedInstance.configMode = this.configMode
      updatedInstance.data.config = {
        ...updatedInstance.data.config,
        ...this.workingConfig
      }
      try {
        this.isSaving = true
        await api.storage.updateInstance(
          process.env.VUE_APP_ACCOUNT_API_URL,
          this.session._key,
          this.instance._key,
          updatedInstance
        )
        this.$emit('refresh-integration')
      }
      catch (error) {
        this.httpError = error
      }
      setTimeout(() => {
        this.isSaving = false
      }, 800)
    }
  },
  mounted() {
    this.workingConfig = { ...this.instance.data.config }
  },
  watch: {
    workingConfig() {
      this.httpError = null
    }
  }
}
</script>

<style scoped>
.save__buttons {
  @apply flex space-x-2 justify-end mt-4;
}

@media (max-width: 550px) {
  .save__buttons {
    @apply w-full;
  }
  .save__buttons .button {
    @apply w-full
  }
}

@media (max-width: 400px) {
  .save__buttons {
    @apply flex-col space-x-0 space-y-2;
  }
}
</style>
