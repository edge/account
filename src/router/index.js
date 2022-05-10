// Copyright (C) 2022 Edge Network Technologies Limited
// Use of this source code is governed by a GNU GPL-style license
// that can be found in the LICENSE.md file. All rights reserved.

import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '@/views/Dashboard'
import Landing from '@/views/Landing'
import NotFound from '@/views/404'
import Vnc from '@/views/Vnc'

import Account from '@/views/dashboard/Account'
import Deploy from '@/views/dashboard/Deploy'
import Index from '@/views/dashboard/Index'
import Server from '@/views/dashboard/Server'
import Servers from '@/views/dashboard/Servers'

import SignIn from '@/views/landing/SignIn'
import CreateAccount from '@/views/landing/CreateAccount'

import * as utils from '../account-utils/index'

import store from '../store'

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
        path: 'account',
        name: 'Account',
        component: Account
      },
      {
        path: 'servers',
        name: 'Servers',
        component: Servers
      },
      {
        path: 'servers/deploy',
        name: 'Deploy',
        component: Deploy
      },
      {
        path: 'server/:id',
        name: 'Server',
        component: Server
      },
      {
        path: 'server/:id/vnc',
        name: 'VNC',
        component: Vnc
      }
    ]
  },
  {
    path: '/signin',
    name: 'Landing',
    component: Landing,
    meta: { guest: true },
    children: [
      {
        path: '',
        name: 'Sign In',
        component: SignIn,
      },
      {
        path: 'create-account',
        name: 'Create Account',
        component: CreateAccount,
      },
    ]
  },
  { path: '/:catchAll(.*)', component: NotFound }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

const ACCOUNT_API_URL = process.env.VUE_APP_ACCOUNT_API_URL
const confirmSessionKey = async () => {
  const sessionKey = localStorage.getItem('session')
  try {
    const session = await utils.sessions.getSession(ACCOUNT_API_URL, sessionKey)
    if (session._key) {
      const account = await utils.accounts.getAccount(ACCOUNT_API_URL, session._key)
      await store.commit('setAccount', account)
      await store.commit('setSession', session)
      await store.commit('setIsAuthed', true)
      return true
    }
  } catch (error) {
    return false
  }
}

router.beforeEach(async (to, from, next) => {
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (store.state.isAuthed || await confirmSessionKey()) {
      next()
      return
    }
    next('/signin')
  }
  else {
    next()
  }
})

router.beforeEach(async (to, from, next) => {
  if (to.matched.some(record => record.meta.guest)) {
    if (store.state.isAuthed || await confirmSessionKey()) {
      next('/')
      return
    }
    next()
  } else {
    next()
  }
})

export default router
