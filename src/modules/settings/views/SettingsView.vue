<script setup>
import APIKeysPanel from '../components/APIKeysPanel.vue'
import AccountPanel from '../components/AccountPanel.vue'
import CryptoPaymentsPanel from '../components/CryptoPaymentsPanel.vue'
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/vue'

</script>

<template>
  <div class="mainContent__inner space-y-4">
    <h1>Settings</h1>

    <div class="mt-4 space-x-10">
      <TabGroup as="div" class="tabGroup">
        <div class="absolute top-0 right-0 w-10 h-5 bg-gradient-to-l from-gray-200" />

        <TabList class="tabs pr-6">
          <Tab v-slot="{selected}">
            <button :class="{ tab: true, 'tab--selected': selected }">Account</button>
          </Tab>
          <Tab v-slot="{selected}">
            <button :class="{ tab: true, 'tab--selected': selected }">API Keys</button>
          </Tab>
          <Tab v-slot="{selected}">
            <button :class="{ tab: true, 'tab--selected': selected }">Crypto Payments</button>
          </Tab>
        </TabList>

        <TabPanels class="mt-4">
          <!-- Account -->
          <TabPanel>
            <AccountPanel />
          </TabPanel>

          <!-- API Keys -->
          <TabPanel>
            <APIKeysPanel />
          </TabPanel>

          <!-- Crypto Payments -->
          <TabPanel>
            <CryptoPaymentsPanel />
          </TabPanel>
        </TabPanels>
      </TabGroup>
    </div>
  </div>
</template>
