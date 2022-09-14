<template>
  <div class="pt-4 pl-7">
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
        :config=config
        @add-path=onAddPath
      />
      <CdnConfigCustomAdvanced v-if="isSelected('advanced')"
        :config=config
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
  props: ['config'],
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
</style>
