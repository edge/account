// Copyright (C) 2022 Edge Network Technologies Limited
// Use of this source code is governed by a GNU GPL-style license
// that can be found in the LICENSE.md file. All rights reserved.

/* global process */

import * as libcrisp from './crisp'
import * as utils from '@edge/account-utils'
import { createStore } from 'vuex'

const store = createStore({
  state: {
    account: null,
    announcements: [],
    config: null,
    backupCodes: null,
    balance: null,
    bareMetals: 0,
    isAuthed: false,
    isTestnet: process.env.VUE_APP_ACCOUNT_API_URL.includes('test'),
    progress: {
      all: false,
      payment: false,
      service: false
    },
    services: null,
    session: null,
    subscriptions: [],
    tasks: [],
    unreadNotifications: 0
  },
  mutations: {
    addTask(state, newTask) {
      state.tasks = [...state.tasks, newTask]
    },
    deleteTask(state, taskToDelete) {
      state.tasks = state.tasks.filter(task => task._key !== taskToDelete._key)
    },
    setAccount(state, account) {
      state.account = account
      libcrisp.setAccount(account)
    },
    setProgress(state, progress) {
      state.progress = progress
    },
    setAnnouncements(state, announcements) {
      state.announcements = announcements
    },
    setBackupCodes(state, codes) {
      state.backupCodes = codes
    },
    setBalance(state, balance) {
      state.balance = balance
    },
    setBareMetals(state, bareMetals) {
      state.bareMetals = bareMetals
    },
    setConfig(state, config) {
      state.config = config
    },
    setIsAuthed(state, isAuthed) {
      state.isAuthed = isAuthed
    },
    setUnreadNotifications(state, unread) {
      state.unreadNotifications = unread
    },
    setServices(state, services) {
      state.services = services
    },
    setSession(state, session) {
      state.session = session
    },
    setSubscriptions(state, subscriptions) {
      state.subscriptions = subscriptions
      libcrisp.setSubscriptions(subscriptions)
    },
    setTasks(state, tasks) {
      state.tasks = tasks
    }
  },
  actions: {
    async getActiveTasks({ commit, state }) {
      const { results } = await utils.getTasks(process.env.VUE_APP_ACCOUNT_API_URL, state.session._key, {
        status: ['created', 'running']
      })
      commit('setTasks', results)
    },
    async getAnnouncements({ commit, state }) {
      const { results } = await utils.getAnnouncements(process.env.VUE_APP_ACCOUNT_API_URL, state.session._key, {
        limit: 3,
        unread: true
      })
      commit('setAnnouncements', results)
    },
    removeBackupCodes({ commit }) {
      commit('setBackupCodes', null)
    },
    async sessionHeartbeat({ commit, state }) {
      const { session } = await utils.updateSession(process.env.VUE_APP_ACCOUNT_API_URL, state.session._key)
      commit('setSession', session)
    },
    signIn({ commit }, payload) {
      commit('setAccount', payload.account)
      commit('setSession', payload.session)
      commit('setIsAuthed', true)
      localStorage.setItem('session', payload.session._key)
    },
    signOut({ commit }) {
      libcrisp.endSession()
      commit('setAccount', null)
      commit('setServices', null)
      commit('setSession', null)
      commit('setTasks', [])
      commit('setSubscriptions', [])
      commit('setIsAuthed', false)
      localStorage.removeItem('session')
    },
    async updateAccount({ commit, state }) {
      const res = await utils.getAccount(process.env.VUE_APP_ACCOUNT_API_URL, state.session._key)
      commit('setAccount', res.account)
    },
    async updateProgress({ commit, state }) {
      const progress = await utils.getAccountProgress(process.env.VUE_APP_ACCOUNT_API_URL, state.session._key)
      commit('setProgress', progress)
    },
    async updateBalance({ commit, state }) {
      const balance = await utils.getAccountBalance(process.env.VUE_APP_ACCOUNT_API_URL, state.session._key)
      commit('setBalance', balance)
    },
    async updateBareMetals({ commit, state }) {
      const res = await utils.getBareMetals(process.env.VUE_APP_ACCOUNT_API_URL, state.session._key, { limit: 1 })
      commit('setBareMetals', res.metadata.totalCount)
    },
    async updateConfig({ commit }) {
      const config = await utils.getConfig(process.env.VUE_APP_ACCOUNT_API_URL)
      commit('setConfig', config)
    },
    async updateServices({ commit, state }) {
      const res = await utils.getServices(process.env.VUE_APP_ACCOUNT_API_URL, state.session._key)
      commit('setServices', res.results)
    },
    async updateSubscriptions({ commit, state }) {
      const { results } = await utils.getProductSubscriptions(process.env.VUE_APP_ACCOUNT_API_URL, state.session._key)
      commit('setSubscriptions', results)
    },
    async updateTasks({ commit, state }) {
      // do nothing if there are no pending ('created' || 'running') tasks
      if (!state.tasks.length) return
      if (!state.tasks.some(task => ['created', 'running'].includes(task.status))) return

      const { results } = await utils.getTasks(process.env.VUE_APP_ACCOUNT_API_URL, state.session._key, {
        key: state.tasks.map(task => task._key)
      })
      const tasks = results
      const updatedTasks = state.tasks.map(task => tasks.find(updatedTask => updatedTask._key === task._key))
      commit('setTasks', updatedTasks)
    },
    async updateUnreadNotifications({ commit, state }) {
      const { metadata } = await utils.getNotifications(process.env.VUE_APP_ACCOUNT_API_URL, state.session._key, {
        limit: 1,
        read: false
      })
      commit('setUnreadNotifications', metadata.totalCount)
    }
  },
  getters: {
    balanceSuspend: (state) => !state.account.managed
      && !state.account.topup
      && state.balance
      && state.balance.available.usd <= state.balance.threshold.suspend.usd,
    balanceWarning: (state, getters) => !state.account.managed
      && !state.account.topup
      && state.balance
      && !getters.balanceSuspend
      && state.balance.available.usd < state.balance.threshold.warning.usd,
    nextInvoiceDate: () => {
      const date = new Date()
      date.setUTCHours(0, 0, 0, 0)
      date.setUTCDate(1)
      date.setUTCMonth(date.getUTCMonth() + 1)
      return date
    },
    tasksByServerId: (state) => (serverId) => state.tasks.filter(task => task.entity === `servers/${serverId}`)
  }
})

export default store
