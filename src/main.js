// Copyright (C) 2021 Edge Network Technologies Limited
// Use of this source code is governed by a GNU GPL-style license
// that can be found in the LICENSE.md file. All rights reserved.

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import titleMixin from './mixins/titleMixin'
import './index.css'
import './utils'

import { VueMaskDirective } from 'v-mask'

const vMaskV2 = VueMaskDirective
const vMaskV3 = {
    beforeMount: vMaskV2.bind,
    updated: vMaskV2.componentUpdated,
    unmounted: vMaskV2.unbind
}

createApp(App)
  .use(router)
  .directive('mask', vMaskV3)
  .mixin(titleMixin)
  .mount('#app')
