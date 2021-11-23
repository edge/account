// Copyright (C) 2021 Edge Network Technologies Limited
// Use of this source code is governed by a GNU GPL-style license
// that can be found in the LICENSE.md file. All rights reserved.

import { createRouter, createWebHistory } from 'vue-router'
// import Blocks from '@/views/Blocks'
import Index from '@/views/Index'
import NotFound from '@/views/404'
import SignIn from '@/views/SignIn'
import Deploy from '@/views/Deploy'
// import Transactions from '@/views/Transactions'
// import Wallet from '@/views/Wallet'

const routes = [
  {
    path: '/',
    name: 'Index',
    component: Index
  },
  {
    path: '/deploy',
    name: 'Deploy',
    component: Deploy
  },
  {
    path: '/signIn',
    name: 'Sign In',
    component: SignIn
  },
  { path: '/:catchAll(.*)', component: NotFound }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
