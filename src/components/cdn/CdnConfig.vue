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
            <span>Cache TTL 3600</span>
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
  components: {
    CdnConfigCustom,
    RadioGroup,
    RadioGroupOption
  },
  data() {
    return {
      configMode: 'default',
      globalConfig: {
        enabled: true,
        ttl: 86400
      },
      paths: [
        {
          path: '/demo',
          ttl: 604800
        }
      ]
    }
  },
  methods: {
    onAddPath(path) {
      this.paths = [ ...this.paths, path]
    },
    onDeletePath(pathName) {
      this.paths = this.paths.filter(path => path.path !== pathName)
    },
    onEditGlobalConfig(enabled, ttl) {
      this.globalConfig = {
        enabled: enabled,
        ttl: ttl
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
        enabled: config.cache.enabled,
        ttl: config.cache.ttl
      }

      const paths = []
      for (const path in config.cache.paths) {
        const pathObject = { path }
        if (config.cache.paths[path].enabled !== undefined) pathObject.enabled = config.cache.paths[path].enabled
        if (config.cache.paths[path].ttl) pathObject.ttl = config.cache.paths[path].ttl
        paths.push(pathObject)
      }
      this.paths = paths
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
