// Copyright (C) 2021 Edge Network Technologies Limited
// Use of this source code is governed by a GNU GPL-style license
// that can be found in the LICENSE.md file. All rights reserved.

import { createRouter, createWebHistory } from 'vue-router'
import Account from '@/views/Account'
import Deploy from '@/views/Deploy'
import Index from '@/views/Index'
import NotFound from '@/views/404'
import Server from '@/views/Server'
import Servers from '@/views/Servers'
import SignIn from '@/views/SignIn'
import Vnc from '@/views/Vnc'
import store from '../store'

const routes = [
  {
    path: '/account',
    name: 'Account',
    component: Account,
    meta: {requiresAuth: true}
  },
  {
    path: '/',
    name: 'Index',
    component: Index,
    meta: {requiresAuth: true}
  },
  {
    path: '/servers',
    name: 'Servers',
    component: Servers,
    meta: {requiresAuth: true}
  },
  {
    path: '/servers/deploy',
    name: 'Deploy',
    component: Deploy,
    meta: {requiresAuth: true}
  },
  {
    path: '/signIn',
    name: 'Sign In',
    component: SignIn,
    meta: { guest: true }
  },
  {
    path: '/server/:id',
    name: 'Server',
    component: Server,
    meta: {requiresAuth: true}
  },
  {
    path: '/server/:id/vnc',
    name: 'VNC',
    component: Vnc,
    meta: {requiresAuth: true}
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
  if (to.matched.some((record) => record.meta.guest)) {
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
