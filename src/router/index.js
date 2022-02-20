// Copyright (C) 2021 Edge Network Technologies Limited
// Use of this source code is governed by a GNU GPL-style license
// that can be found in the LICENSE.md file. All rights reserved.

import { createRouter, createWebHistory } from 'vue-router'
import Deploy from '@/views/Deploy'
import Index from '@/views/Index'
import NotFound from '@/views/404'
import Server from '@/views/Server'
import SignIn from '@/views/SignIn'
import store from '../store'

const routes = [
  {
    path: '/',
    name: 'Index',
    component: Index,
    meta: {requiresAuth: true}
  },
  {
    path: '/deploy',
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
    path: '/server/:slug',
    name: 'Server',
    component: Server,
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
