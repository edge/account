<template>
  <div class="wrapper">
    <div class="tabs" :class="disableControls ? 'disabled' : ''">
      <button @click="selectTab('simple')"
        class="tab disabled"
        :class="[isSelected('simple') ? 'tab--selected' : '']"
        :disabled="true"
      >Simple</button>
      <button @click="selectTab('advanced')"
        class="tab" :class="[isSelected('advanced') ? 'tab--selected' : '']"
      >Advanced</button>
    </div>
    <div class="mt-4">
      <!-- <IntegrationConfigCustomSimple v-if="isSelected('simple')"
        :disableControls="disableControls"
        :integrationConfig="config"
        @edit-config="onEditConfig"
      /> -->
      <ConfigCustomAdvanced v-if="isSelected('advanced')"
        ref="ConfigCustomAdvanced"
        :integrationConfig="config"
        :initialIntegrationConfig="initialConfig"
        @update-config="onUpdateConfig"
      />
    </div>
  </div>
</template>

<script>
import ConfigCustomAdvanced from '@/components/storage/ConfigCustomAdvanced.vue'
// import ConfigCustomSimple from '@/components/storage/ConfigCustomSimple.vue'

export default {
  name: 'StorageConfigCustom',
  components: {
    ConfigCustomAdvanced,
    // ConfigCustomSimple
  },
  props: [
    'config',
    'disableControls',
    'initialConfigMode',
    'initialConfig'
  ],
  data () {
    return {
      selectedTab: 'advanced'
    }
  },
  methods: {
    isSelected(tab) {
      return tab === this.selectedTab
    },
    onDisplayIfUnsaved(display) {
      this.displayUnsavedChangesWarning = display
    },
    onUpdateConfig(config) {
      this.$emit('update-config', config)
    },
    resetConfig() {
      if (this.isSelected('advanced')) this.$refs.ConfigCustomAdvanced.resetConfig()
    },
    selectTab(tab) {
      if (this.disableControls) return
      this.$emit('update-config-mode', tab)
      this.selectedTab = tab
    }
  },
  mounted() {
    setTimeout(() => {
      if (this.initialConfigMode && this.initialConfigMode !== 'default') this.selectTab(this.initialConfigMode)
    }, 0)
  }
}
</script>

<style scoped>
.wrapper {
  @apply pt-4 pl-7;
}
.tabs.disabled, .tabs.disabled .tab {
  @apply cursor-not-allowed opacity-50;
}
.tab.disabled {
  @apply cursor-not-allowed opacity-50 hover:text-gray-500;
}

@media (max-width: 550px) {
  .wrapper {
    @apply pl-0
  }
}
</style>
