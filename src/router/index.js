// Copyright (C) 2021 Edge Network Technologies Limited
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

router.beforeEach((to, from, next) => {
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (store.getters['auth/isAuthenticated']) {
      next()
      return
    }
    next('/signin')
  } else {
    next()
  }
})

router.beforeEach((to, from, next) => {
  if (to.matched.some(record => record.meta.guest)) {
    if (store.getters['auth/isAuthenticated']) {
      next('/')
      return
    }
    next()
  } else {
    next()
  }
})

export default router
