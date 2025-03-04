// Copyright (C) 2022 Edge Network Technologies Limited
// Use of this source code is governed by a GNU GPL-style license
// that can be found in the LICENSE.md file. All rights reserved.

/* global process */

import * as utils from '@edge/account-utils'
import BareMetal from '../modules/bareMetals/views/BareMetal.vue'
import BareMetals from '../modules/bareMetals/views/BareMetals.vue'
import Billing from '@/views/dashboard/Billing'
import CdnDeploy  from '@/views/dashboard/CdnDeploy'
import CdnIntegration  from '@/views/dashboard/CdnIntegration'
import CdnIntegrations from '@/views/dashboard/CdnIntegrations'
import CreateAccount from '@/views/landing/CreateAccount'
import Dashboard from '@/views/Dashboard'
import Domain from '@/views/dashboard/Domain'
import Domains from '@/views/dashboard/Domains'
import GettingStarted from '@/views/dashboard/GettingStarted'
import Index from '@/views/dashboard/Index'
import Invoices from '@/components/billing/Invoices'
import Landing from '@/views/Landing'
import NotFound from '@/views/404'
import Notifications from '@/views/dashboard/Notifications'
import PageDeploy from '@/views/dashboard/PageDeploy'
import PageIntegration from '@/views/dashboard/PageIntegration'
import Pages from '@/views/dashboard/Pages'
import PaymentCards from '../components/billing/PaymentCards.vue'
import Payments from '@/components/billing/Payments'
import Promo from '../views/landing/Promo.vue'
import Promotions from '@/components/billing/Promotions'
import Purchase from '@/components/billing/Purchase'
import ReferralProgram from '@/views/dashboard/ReferralProgram'
import Server from '@/views/dashboard/Server'
import ServerDeploy from '@/views/dashboard/ServerDeploy'
import Servers from '@/views/dashboard/Servers'
import Shield from '@/views/dashboard/Shield'
import SignIn from '@/views/landing/SignIn'
import Storage from '@/views/dashboard/Storage'
import StorageDeploy from '@/views/dashboard/StorageDeploy'
import StorageIntegration from '@/views/dashboard/StorageIntegration'
import Support from '@/views/dashboard/Support'
import VPNs from '../modules/vpns/views/VPNs.vue'
import Wallet from '@/components/billing/Wallet'
import store from '@/store'
import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Dashboard',
    component: Dashboard,
    meta: {requiresAuth: true},
    children: [
      {
        path: '',
        name: 'Index',
        component: Index
      },
      {
        path: 'bare-metals',
        name: 'Bare Metals',
        component: BareMetals
      },
      {
        path: 'bare-metal/:key',
        name: 'Bare Metal',
        component: BareMetal
      },
      {
        path: 'billing',
        name: 'Billing',
        component: Billing,
        children: [
          {
            path: 'invoices',
            name: 'Invoices',
            component: Invoices
          },
          {
            path: 'payments',
            name: 'Payments',
            component: Payments
          },
          {
            path: 'payment-cards',
            name: 'Payment Cards',
            component: PaymentCards
          },
          {
            path: 'payments/purchase/:id',
            name: 'Purchase',
            component: Purchase
          },
          {
            path: 'promotions',
            name: 'Promotions',
            component: Promotions
          },
          {
            path: 'wallet',
            name: 'Wallet',
            component: Wallet
          }
        ]
      },
      {
        path: 'cdn',
        name: 'CdnIntegrations',
        component: CdnIntegrations
      },
      {
        path: 'cdn/:key',
        name: 'CdnIntegration',
        component: CdnIntegration
      },
      {
        path: 'cdn/deploy',
        name: 'CdnDeploy',
        component: CdnDeploy
      },
      {
        path: 'domain/:key',
        name: 'Domain',
        component: Domain
      },
      {
        path: 'domains',
        name: 'Domains',
        component: Domains
      },
      {
        path: 'getting-started',
        name: 'Getting Started',
        component: GettingStarted
      },
      {
        path: 'gpus',
        name: 'GPUs',
        component: () => import('../modules/gpu/views/GPUList.vue')
      },
      {
        path: 'gpus/deploy',
        name: 'Deploy GPU',
        component: () => import('../modules/gpu/views/GPUDeploy.vue')
      },
      {
        path: 'gpu/:id',
        name: 'GPU',
        component: () => import('../modules/gpu/views/GPUDetail.vue')
      },
      {
        path: 'notifications',
        name: 'Notifications',
        component: Notifications
      },
      {
        path: 'pages',
        name: 'Pages',
        component: Pages
      },
      {
        path: 'pages/deploy',
        name: 'Pages Deploy',
        component: PageDeploy
      },
      {
        path: 'page/:key',
        name: 'Pages Integration',
        component: PageIntegration
      },
      {
        path: 'referral-program',
        name: 'Referral Program',
        component: ReferralProgram
      },
      {
        path: 'servers',
        name: 'Servers',
        component: Servers
      },
      {
        path: 'servers/deploy',
        name: 'ServerDeploy',
        component: ServerDeploy
      },
      {
        path: 'server/:id',
        name: 'Server',
        component: Server
      },
      {
        path: 'settings',
        name: 'Settings',
        component: () => import('../modules/settings/views/SettingsView.vue')
      },
      {
        path: 'shield',
        name: 'Shield',
        component: Shield
      },
      {
        path: 'storage',
        name: 'Storage',
        component: Storage
      },
      {
        path: 'storage/deploy',
        name: 'Storage Deploy',
        component: StorageDeploy
      },
      {
        path: 'storage/:key',
        name: 'Storage Integration',
        component: StorageIntegration
      },
      {
        path: '/support',
        name: 'Support',
        component: Support
      },
      {
        path: '/vpns',
        name: 'VPN',
        component: VPNs
      }
    ]
  },
  {
    path: '/sign-in',
    name: 'Landing',
    component: Landing,
    meta: { guest: true },
    children: [
      {
        path: '',
        name: 'Sign In',
        component: SignIn
      },
      {
        path: 'create-account',
        name: 'Create Account',
        component: CreateAccount
      }
    ]
  },
  {
    path: '/promo/:code',
    name: 'Promo',
    component: Promo
  },
  {
    path: '/404',
    name: 'Not Found',
    component: NotFound
  },
  {
    path: '/:catchAll(.*)',
    component: NotFound
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

const confirmSessionKey = async () => {
  const sessionKey = localStorage.getItem('session')
  try {
    const { session } = await utils.getSession(process.env.VUE_APP_ACCOUNT_API_URL, sessionKey)
    if (session._key) {
      const { account } = await utils.getAccount(process.env.VUE_APP_ACCOUNT_API_URL, session._key)
      await store.commit('setAccount', account)
      await store.commit('setSession', session)
      await store.commit('setIsAuthed', true)
      return true
    }
  }
  catch (error) {
    return false
  }
}

router.beforeEach(async (to, from, next) => {
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (store.state.isAuthed || await confirmSessionKey()) {
      next()
      return
    }
    next('/sign-in')
  }
  else {
    next()
  }
})

router.beforeEach(async (to, from, next) => {
  // for magic links, sign out of current session
  if (to.name === 'Sign In' && to.query.t) store.dispatch('signOut')

  if (to.matched.some(record => record.meta.guest)) {
    if (store.state.isAuthed || await confirmSessionKey()) {
      next('/')
      return
    }
    next()
  }
  else {
    next()
  }
})

export default router
