<template>
  <div class="wrapper">
    <div class="tabs" :class="disableControls ? 'disabled' : ''">
      <button @click="selectTab('simple')"
        class="tab" :class="[isSelected('simple') ? 'tab--selected' : '']"
      >Simple</button>
      <button @click="selectTab('advanced')"
        class="tab" :class="[isSelected('advanced') ? 'tab--selected' : '']"
      >Advanced</button>
    </div>
    <div class="mt-5">
      <CdnConfigCustomSimple v-if="isSelected('simple')"
        :disableControls=disableControls
        :globalConfig=globalConfig
        :paths=paths
        @add-path=onAddPath
        @edit-global-config=onEditGlobalConfig
        @edit-path=onEditPath
        @delete-path=onDeletePath
      />
      <CdnConfigCustomAdvanced v-if="isSelected('advanced')"
        ref="cdnConfigCustomAdvanced"
        :globalConfig=globalConfig
        :paths=paths
        :initialGlobalConfig=initialGlobalConfig
        :initialPaths=initialPaths
        @update-config=onUpdateConfig
      />
    </div>
  </div>
</template>

<script>
import CdnConfigCustomAdvanced from '@/components/cdn/CdnConfigCustomAdvanced.vue'
import CdnConfigCustomSimple from '@/components/cdn/CdnConfigCustomSimple.vue'

export default {
  name: 'CdnConfigCustom',
  components: {
    CdnConfigCustomAdvanced,
    CdnConfigCustomSimple
  },
  props: [
    'disableControls',
    'globalConfig',
    'initialGlobalConfig',
    'initialPaths',
    'paths'
  ],
  data () {
    return {
      selectedTab: 'simple'
    }
  },
  methods: {
    isSelected(tab) {
      return tab === this.selectedTab
    },
    onAddPath(path) {
      this.$emit('add-path', path)
    },
    onDeletePath(path) {
      this.$emit('delete-path', path)
    },
    onDisplayIfUnsaved(display) {
      this.displayUnsavedChangesWarning = display
    },
    onEditGlobalConfig(enabled, ttl) {
      this.$emit('edit-global-config', enabled, ttl)
    },
    onEditPath(oldPathName, newPath) {
      this.$emit('edit-path', oldPathName, newPath)
    },
    onUpdateConfig(config) {
      this.$emit('update-config', config)
    },
    resetConfig() {
      if (this.isSelected('advanced')) this.$refs.cdnConfigCustomAdvanced.resetConfig()
    },
    selectTab(tab) {
      if (this.disableControls) return
      this.selectedTab = tab
    }
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

@media (max-width: 550px) {
  .wrapper {
    @apply pl-0
  }
}
</style>
