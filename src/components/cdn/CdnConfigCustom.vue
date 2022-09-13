<template>
  <div class="pt-4 pl-7">
    <TabGroup>
      <TabList class="tabs">
        <Tab v-slot="{selected}">
          <button class="tab" :class="[selected ? 'tab--selected' : '']">Simple</button>
        </Tab>
        <Tab v-slot="{selected}">
          <button class="tab" :class="[selected ? 'tab--selected' : '']">Advanced</button>
        </Tab>
      </TabList>
      <TabPanels class="mt-5">
        <!-- simple -->
        <TabPanel>
          <CdnConfigCustomSimple />
        </TabPanel>
        <TabPanel>
          <textarea class="border border-gray-400 rounded w-full"/>
        </TabPanel>
      </TabPanels>
    </TabGroup>
  </div>
</template>

<script>
import CdnConfigCustomSimple from '@/components/cdn/CdnConfigCustomSimple.vue'

import {
  Tab,
  TabGroup,
  TabList,
  TabPanel,
  TabPanels
} from '@headlessui/vue'

export default {
  name: 'CdnConfigCustom',
  components: {
    CdnConfigCustomSimple,
    Tab,
    TabGroup,
    TabList,
    TabPanel,
    TabPanels
  },
  data() {
    return {

    }
  }
}
</script>

<style scoped>
</style>
