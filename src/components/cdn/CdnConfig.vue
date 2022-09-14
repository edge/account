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
        v-if="configMode === 'custom'"
        :config=config
        @add-path=onAddPath
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
      config: {
        origin: 'aneur.in',
        cache: {
          enabled: true,
          ttl: 86400,
          paths: {
            '/demo': {
              ttl: 604800
            }
          }
        }
      },
      configMode: 'default'
    }
  },
  methods: {
    onAddPath(path) {
      this.config = {
        ...this.config,
        cache: {
          ...this.config.cache,
          paths: {
            ...this.config.cache.paths,
            ...path
          }
        }
      }
    },
    onUpdateConfig(config) {
      this.config = { ...this.config, ...config }
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
