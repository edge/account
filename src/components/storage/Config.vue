<template>
  <div class="box">
    <h4>Configuration</h4>
    <div>
      <!-- config settings -->
      <RadioGroup v-model="configMode" :disabled="disableControls" :class="disableControls ? 'radioGroup disabled' : ''">
        <!-- default config -->
        <RadioGroupOption v-slot="{ checked }"
          value="default"
          class="radioGroup__option cursor-pointer disabled"
          :disabled="true"
        >
          <div class="flex items-center space-x-2">
            <div class="checkmark"
              :class="checked ? 'checked' : ''"
            ></div>
            <span class="text-lg">Default settings</span>
          </div>
          <div class="flex flex-col space-y-1 text-gray-500 pl-7">
            <span>Not available in Beta</span>
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
      <ConfigCustom
        ref="integration-config-custom"
        v-show="configMode === 'custom'"
        :config="config"
        :disableControls="disableControls"
        :initialConfigMode="initialConfigMode"
        :initialConfig="initialConfig"
        @update-config="onUpdateConfig"
        @update-config-mode="onUpdateConfigMode"
      />
    </div>
    <!-- for save/cancel buttons when editing existing deployments -->
    <slot name="buttons" />
  </div>
</template>

<script>
import ConfigCustom from '@/components/storage/ConfigCustom.vue'
import {
  RadioGroup,
  RadioGroupOption
} from '@headlessui/vue'

export default {
  name: 'StorageConfig',
  props: ['disableControls', 'initialConfig', 'initialConfigMode'],
  components: {
    ConfigCustom,
    RadioGroup,
    RadioGroupOption
  },
  data() {
    return {
      configMode: 'custom',
      customConfigMode: 'advanced',
      config: {
        one: 'test one',
        // two: undefined,
        three: {
          nestedOne: true,
          nestedTwo: 'test nested two'
        }
      }
    }
  },
  methods: {
    onUpdateConfig(config) {
      this.config = { ...config }
    },
    onUpdateConfigMode(configMode) {
      this.customConfigMode = configMode
    },
    resetConfig() {
      if (this.initialConfig) this.config = { ...this.initialConfig }
      else this.config = {
        one: 'test one',
        // two: undefined,
        three: {
          nestedOne: true,
          nestedTwo: 'test nested two'
        }
      }
      this.$refs['integration-config-custom'].resetConfig()
    },
    updateConfig() {
      let config = {}
      if (this.configMode === 'default') {
        // No default config in beta
      }
      else config = { ...this.config }
      const configMode = this.configMode === 'custom' ? this.customConfigMode : 'default'
      this.$emit('update-config', config, configMode)
    }
  },
  mounted() {
    this.resetConfig()
  },
  watch: {
    config() {
      this.updateConfig()
    },
    configMode() {
      this.updateConfig()
    },
    customConfigMode() {
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

.radioGroup__option.disabled {
  @apply cursor-not-allowed opacity-50;
}
</style>
