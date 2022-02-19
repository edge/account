// Copyright (C) 2021 Edge Network Technologies Limited
// Use of this source code is governed by a GNU GPL-style license
// that can be found in the LICENSE.md file. All rights reserved.

import App from './App.vue'
import { createApp } from 'vue'
import router from './router'
import store from './store'
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

createApp(App)
  .use(router)
  .use(store)
  .directive('mask', vMaskV3)
  .mixin(titleMixin)
  .mount('#app')
