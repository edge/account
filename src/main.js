// Copyright (C) 2021 Edge Network Technologies Limited
// Use of this source code is governed by a GNU GPL-style license
// that can be found in the LICENSE.md file. All rights reserved.

import { createApp } from 'vue'
import { createStore } from 'vuex'
import App from './App.vue'
import router from './router'
import titleMixin from './mixins/titleMixin'
import './index.css'
import './utils'

/* Set up input masking for the account number */
import { VueMaskDirective } from 'v-mask'

const vMaskV2 = VueMaskDirective
const vMaskV3 = {
  beforeMount: vMaskV2.bind,
  updated: vMaskV2.componentUpdated,
  unmounted: vMaskV2.unbind
}

// Create a new vuex store.
const store = createStore({
  state () {
    return {
      count: 0,
      enableBackups: false,
      os: '',
      osVersion: '',
      serverRegion: '',
      serverHostname: '',
      storage: ''
    }
  },
  mutations: {
    increment (state, payload) {
      state.count += payload.amount
    },
    selectServerProperty (state, payload) {
      console.log('state, payload', state, payload)
      state[payload.property] = payload.value
    }
  }
})

createApp(App)
  .use(router)
  .use(store)
  .directive('mask', vMaskV3)
  .mixin(titleMixin)
  .mount('#app')
