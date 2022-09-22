<template>
  <div class="box">
    <h4>Configuration</h4>
    <div>
      <RadioGroup v-model="configMode">
        <!-- default config -->
        <RadioGroupOption v-slot="{ checked }" value="default" class="cursor-pointer">
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
        <RadioGroupOption v-slot="{ checked }" value="custom" class="cursor-pointer mt-2">
          <div class="flex items-center space-x-2">
            <div class="checkmark"
              :class="checked ? 'checked' : ''"
            ></div>
            <span class="text-lg">Custom configuration</span>
          </div>
        </RadioGroupOption>
      </RadioGroup>
      <CdnConfigCustom
        v-show="configMode === 'custom'"
        :globalConfig=globalConfig
        :paths=paths
        @add-path=onAddPath
        @delete-path=onDeletePath
        @edit-global-config=onEditGlobalConfig
        @edit-path=onEditPath
        @update-config=onUpdateConfig
      />
    </div>
  </div>
</template>

<script>
import CdnConfigCustom from '@/components/cdn/CdnConfigCustom.vue'
import {
  RadioGroup,
  RadioGroupOption
} from '@headlessui/vue'

export default {
  name: 'CdnConfig',
  props: ['initialConfig'],
  components: {
    CdnConfigCustom,
    RadioGroup,
    RadioGroupOption
  },
  data() {
    return {
      configMode: 'default',
      globalConfig: {
        maxAssetSize: undefined,
        requestTimeout: undefined,
        retryTimeout: undefined,
        cache: {
          enabled: true,
          ttl: 86400
        }
      },
      paths: []
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
      const paths = []
      for (const path in config.cache.paths) {
        paths.push({
          path,
          ...config.cache.paths[path]
        })
      }
      return paths
    },
    onAddPath(path) {
      this.paths = [ ...this.paths, path]
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
          enabled: config.cache.enabled,
          ttl: config.cache.ttl
        }
      }

      const paths = []
      for (const path in config.cache.paths) {
        const pathObject = { path }
        if (config.cache.paths[path].enabled !== undefined) pathObject.enabled = config.cache.paths[path].enabled
        if (config.cache.paths[path].ttl) pathObject.ttl = config.cache.paths[path].ttl
        paths.push(pathObject)
      }
      this.paths = paths
    },
    updateConfig() {
      let config = {
        cache: {}
      }
      if (this.configMode === 'default') {
        config.enabled = true
        config.ttl = 86400
        config.paths = {}
      }
      else {
        config = { ...this.globalConfig }
        const paths = {}
        this.paths.forEach(path => {
          paths[path.path] = {}
          if (path.enabled !== undefined) paths[path.path].enabled = path.enabled
          if (path.ttl) paths[path.path].ttl = path.ttl
        })
        config.cache.paths = paths
      }
      this.$emit('update-config', config)
    }
  },
  mounted() {
    if (this.initialConfig) {
      this.globalConfig = this.formatGlobalConfig(this.initialConfig)
      this.paths = this.formatPaths(this.initialConfig)
      this.configMode = 'custom'
    }
  },
  watch: {
    configMode() {
      this.updateConfig()
    },
    globalConfig() {
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
</style>
