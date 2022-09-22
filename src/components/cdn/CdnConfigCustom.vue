<template>
  <div class="wrapper">
    <div class="tabs">
      <button @click="selectTab('simple')"
        class="tab" :class="[isSelected('simple') ? 'tab--selected' : '']"
      >Simple</button>
      <button @click="selectTab('advanced')"
        class="tab" :class="[isSelected('advanced') ? 'tab--selected' : '']"
      >Advanced</button>
    </div>
    <div class="mt-5">
      <CdnConfigCustomSimple v-if="isSelected('simple')"
        :globalConfig=globalConfig
        :paths=paths
        @add-path=onAddPath
        @edit-global-config=onEditGlobalConfig
        @edit-path=onEditPath
        @delete-path=onDeletePath
      />
      <CdnConfigCustomAdvanced v-if="isSelected('advanced')"
        :globalConfig=globalConfig
        :paths=paths
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
  props: ['globalConfig', 'paths'],
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
    selectTab(tab) {
      this.selectedTab = tab
    }
  }
}
</script>

<style scoped>
.wrapper {
  @apply pt-4 pl-7;
}

@media (max-width: 500px) {
  .wrapper {
    @apply pl-0
  }
}
</style>
