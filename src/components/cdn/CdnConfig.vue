<template>
  <div class="box">
    <h4>Configuration</h4>
    <div>
      <!-- origin -->
      <div class="input-group mb-6">
        <label class="label">Origin URL</label>
        <input
          v-model="v$.originUrl.$model"
          class="input input--floating"
          placeholder="e.g. https://yoursite.com/photos"
          type="text"
          :disabled=disableControls
          :class="disableControls ? 'disabled' : ''"
        />
        <ValidationError :errors="v$.originUrl.$errors" />
      </div>
      <!-- config settings -->
      <RadioGroup v-model="configMode" :disabled=disableControls :class="disableControls ? 'radioGroup disabled' : ''">
        <!-- default config -->
        <RadioGroupOption v-slot="{ checked }" value="default" class="radioGroup__option cursor-pointer">
          <div class="flex items-center space-x-2">
            <div class="checkmark"
              :class="checked ? 'checked' : ''"
            ></div>
            <span class="text-lg">Default settings</span>
          </div>
          <div class="flex flex-col space-y-1 text-gray-500 pl-7">
            <span>Caching enabled for all asset types</span>
            <span>Cache TTL 86400</span>
          </div>
        </RadioGroupOption>
        <!-- custom config -->
        <RadioGroupOption v-slot="{ checked }" value="custom" class="radioGroup__option cursor-pointer mt-2">
          <div class="flex items-center space-x-2">
            <div class="checkmark"
              :class="checked ? 'checked' : ''"
            ></div>
            <span class="text-lg">Custom configuration</span>
          </div>
        </RadioGroupOption>
      </RadioGroup>
      <CdnConfigCustom
        ref="cdnConfigCustom"
        v-show="configMode === 'custom'"
        :disableControls=disableControls
        :globalConfig=globalConfig
        :paths=paths
        :initialConfigMode=initialConfigMode
        :initialGlobalConfig=initialGlobalConfig
        :initialPaths=initialPaths
        @add-path=onAddPath
        @delete-path=onDeletePath
        @edit-global-config=onEditGlobalConfig
        @edit-path=onEditPath
        @update-config=onUpdateConfig
        @update-config-mode=onUpdateConfigMode
      />
    </div>
    <!-- for save/cancel buttons when editing existing integrations -->
    <slot name="buttons" />
  </div>
</template>

<script>
import * as validation from '@/utils/validation'
import CdnConfigCustom from '@/components/cdn/CdnConfigCustom.vue'
import ValidationError from '@/components/ValidationError.vue'
import useVuelidate from '@vuelidate/core'
import {
  RadioGroup,
  RadioGroupOption
} from '@headlessui/vue'

export default {
  name: 'CdnConfig',
  props: ['disableControls', 'initialConfig', 'initialConfigMode'],
  components: {
    CdnConfigCustom,
    RadioGroup,
    RadioGroupOption,
    ValidationError
  },
  data() {
    return {
      configMode: 'default',
      customConfigMode: 'simple',
      globalConfig: {
        maxAssetSize: undefined,
        requestTimeout: undefined,
        retryTimeout: undefined,
        cache: {
          enabled: true,
          ttl: 86400
        }
      },
      initialGlobalConfig: null,
      initialOriginUrl: null,
      initialPaths: null,
      originUrl: '',
      paths: []
    }
  },
  validations() {
    return {
      originUrl: [
        validation.origin
      ]
    }
  },
  methods: {
    formatGlobalConfig(config) {
      const globalConfig = {
        maxAssetSize: config.maxAssetSize,
        requestTimeout: config.requestTimeout,
        retryTimeout: config.retryTimeout,
        cache: {
          enabled: config.cache.enabled,
          ttl: config.cache.ttl
        }
      }
      return globalConfig
    },
    formatPaths(config) {
      if (config.cache.paths === undefined) return undefined
      const paths = []
      if (config.cache.paths) {
        for (const path in config.cache.paths) {
          paths.push({
            path,
            ...config.cache.paths[path]
          })
        }
      }
      return paths
    },
    onAddPath(path) {
      if (!this.paths) this.paths = [path]
      else this.paths = [ ...this.paths, path]
    },
    onDeletePath(pathName) {
      this.paths = this.paths.filter(path => path.path !== pathName)
    },
    onEditGlobalConfig(enabled, ttl) {
      this.globalConfig = {
        ...this.globalConfig,
        cache: {
          enabled,
          ttl
        }
      }
    },
    onEditPath(oldPathName, newPath) {
      const index = this.paths.findIndex(path => path.path === oldPathName)
      const newPaths = [ ...this.paths ]
      newPaths[index] = newPath
      this.paths = newPaths
    },
    onUpdateConfig(config) {
      this.globalConfig = {
        maxAssetSize: config.maxAssetSize,
        requestTimeout: config.requestTimeout,
        retryTimeout: config.retryTimeout,
        cache: {
          ttl: config.cache.ttl,
          enabled: config.cache.enabled
        }
      }

      if (config.cache.paths) {
        const paths = []
        for (const path in config.cache.paths) {
          const pathObject = { path }
          if (config.cache.paths[path].enabled !== undefined) pathObject.enabled = config.cache.paths[path].enabled
          if (config.cache.paths[path].ttl) pathObject.ttl = config.cache.paths[path].ttl
          paths.push(pathObject)
        }
        this.paths = paths
      }
      else {
        this.paths = undefined
      }
    },
    onUpdateConfigMode(configMode) {
      this.customConfigMode = configMode
    },
    resetConfig() {
      if (this.initialConfig) {
        this.originUrl = this.initialConfig.origin
        this.globalConfig = this.formatGlobalConfig(this.initialConfig)
        this.paths = this.formatPaths(this.initialConfig)
        const cache = this.initialConfig.cache

        if (this.initialConfigMode) {
          if (this.initialConfigMode === 'default') this.configMode = 'default'
          else {
            this.configMode = 'custom'
            this.customConfigMode = this.initialConfigMode
          }
        }
        // eslint-disable-next-line max-len
        else if (!cache.enabled || cache.ttl !== 86400 || !cache.paths || Object.keys(cache.paths).length) this.configMode = 'custom'

        this.initialGlobalConfig = this.globalConfig
        this.initialPaths = this.paths
      }
      else {
        this.globalConfig = {
          maxAssetSize: undefined,
          requestTimeout: undefined,
          retryTimeout: undefined,
          cache: {
            enabled: true,
            ttl: 86400
          }
        }
        this.paths = []
      }
      this.$refs.cdnConfigCustom.resetConfig()
    },
    updateConfig() {
      // convert origin url to lower case (before the path)
      // e.g. HTTPS://testTEST.com/PATHpath -> https://testtest.com/PATHpath
      const regex = /^https?:\/\/((?=[a-z0-9-]{1,63}\.)(xn--)?[a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,63}/i
      const match = this.originUrl.match(regex)
      const lowerCaseOrigin = match ? this.originUrl.replace(regex, match[0].toLowerCase()) : undefined
      const config = {
        origin: lowerCaseOrigin,
        cache: {}
      }
      if (this.configMode === 'default') {
        config.cache.enabled = true
        config.cache.ttl = 86400
        config.cache.paths = {}
      }
      else {
        config.cache = { ttl: this.globalConfig.cache.ttl }
        if(this.globalConfig.cache.enabled !== undefined) config.cache.enabled = this.globalConfig.cache.enabled
        if(this.globalConfig.maxAssetSize !== undefined) config.maxAssetSize = this.globalConfig.maxAssetSize
        if(this.globalConfig.requestTimeout !== undefined) config.requestTimeout = this.globalConfig.requestTimeout
        if(this.globalConfig.retryTimeout !== undefined) config.retryTimeout = this.globalConfig.retryTimeout
        if (this.paths) {
          const paths = {}
          this.paths.forEach(path => {
            paths[path.path] = {}
            if (path.enabled !== undefined) paths[path.path].enabled = path.enabled
            if (path.ttl) paths[path.path].ttl = path.ttl
          })
          config.cache.paths = paths
        }
      }
      const configMode = this.configMode === 'custom' ? this.customConfigMode : 'default'
      this.$emit('update-config', config, configMode)
    }
  },
  setup() {
    return {
      v$: useVuelidate()
    }
  },
  mounted() {
    this.resetConfig()
  },
  watch: {
    configMode() {
      this.updateConfig()
    },
    customConfigMode() {
      this.updateConfig()
    },
    globalConfig() {
      this.updateConfig()
    },
    initialConfig() {
      this.initialGlobalConfig = this.formatGlobalConfig(this.initialConfig)
      this.initialPaths = this.formatPaths(this.initialConfig)
    },
    originUrl() {
      this.updateConfig()
    },
    paths() {
      this.updateConfig()
    }
  }
}
</script>

<style scoped>
/* checkmark */
.checkmark {
  @apply flex items-center justify-center text-white flex-shrink-0 rounded-full w-4 h-4 bg-gray-100 border border-gray-300;
}
.checkmark.active {
  @apply border-green border-opacity-40 bg-opacity-20;
}
.checkmark.checked {
  @apply border-green bg-green;
}
.checkmark.active .checkmark__icon {
  @apply opacity-40;
}
.checkmark.checked .checkmark__icon {
  @apply opacity-100;
}

.radioGroup.disabled, .radioGroup.disabled .radioGroup__option {
  @apply cursor-not-allowed opacity-50;
}
</style>
