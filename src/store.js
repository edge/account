// Copyright (C) 2022 Edge Network Technologies Limited
// Use of this source code is governed by a GNU GPL-style license
// that can be found in the LICENSE.md file. All rights reserved.

/* global process */

import * as api from './account-utils/index'
import * as libcrisp from './crisp'
import { createStore } from 'vuex'

const store = createStore({
  state: {
    account: null,
    announcements: [],
    config: null,
    backupCodes: null,
    balance: null,
    isAuthed: false,
    isTestnet: process.env.VUE_APP_ACCOUNT_API_URL.includes('test'),
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
    setAnnouncements(state, announcements) {
      state.announcements = announcements
    },
    setBackupCodes(state, codes) {
      state.backupCodes = codes
    },
    setBalance(state, balance) {
      state.balance = balance
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
      const statusParams = 'status=created&status=running'
      const { results } = await api.tasks.getTasks(
        process.env.VUE_APP_ACCOUNT_API_URL,
        state.session._key,
        statusParams
      )
      commit('setTasks', results)
    },
    async getAnnouncements({ commit, state }) {
      const { results } = await api.announcements.getAnnouncements(
        process.env.VUE_APP_ACCOUNT_API_URL,
        state.session._key,
        {
          limit: 3,
          unread: true
        }
      )
      commit('setAnnouncements', results)
    },
    removeBackupCodes({ commit }) {
      commit('setBackupCodes', null)
    },
    async sessionHeartbeat({ commit, state }) {
      const { session } = await api.sessions.putSession(
        process.env.VUE_APP_ACCOUNT_API_URL,
        state.session._key
      )
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
      commit('setSession', null)
      commit('setTasks', [])
      commit('setSubscriptions', [])
      commit('setIsAuthed', false)
      localStorage.removeItem('session')
    },
    async updateAccount({ commit, state }) {
      const { account } = await api.accounts.getAccount(
        process.env.VUE_APP_ACCOUNT_API_URL,
        state.session._key
      )
      commit('setAccount', account)
    },
    async updateBalance({ commit, state }) {
      const balance = await api.billing.getBalance(
        process.env.VUE_APP_ACCOUNT_API_URL,
        state.session._key
      )
      commit('setBalance', balance)

    },
    async updateConfig({ commit }) {
      const config = await api.config.getConfig(process.env.VUE_APP_ACCOUNT_API_URL)
      commit('setConfig', config)

    },
    async updateSubscriptions({ commit, state }) {
      const { results } = await api.products.subscriptions(process.env.VUE_APP_ACCOUNT_API_URL, state.session._key)
      commit('setSubscriptions', results)
    },
    async updateTasks({ commit, state }) {
      // do nothing if there are no pending ('created' || 'running') tasks
      if (!state.tasks.length) return
      if (!state.tasks.some(task => ['created', 'running'].includes(task.status))) return

      const keyParams = state.tasks.map(task => `key=${task._key}`).join('&')
      const { results } = await api.tasks.getTasks(
        process.env.VUE_APP_ACCOUNT_API_URL,
        state.session._key,
        keyParams
      )
      const tasks = results
      const updatedTasks = state.tasks.map(task => tasks.find(updatedTask => updatedTask._key === task._key))
      commit('setTasks', updatedTasks)
    },
    async updateUnreadNotifications({ commit, state }) {
      const { metadata } = await api.notifications.getNotifications(
        process.env.VUE_APP_ACCOUNT_API_URL,
        state.session._key,
        { limit: 1, read: false }
      )
      commit('setUnreadNotifications', metadata.totalCount)
    }
  },
  getters: {
    balanceSuspend: (state) => !state.account.managed
      && state.balance
      && state.balance.available.usd <= state.balance.threshold.suspend.usd,
    balanceWarning: (state, getters) => !state.account.managed
      && state.balance
      && !getters.balanceSuspend
      && state.balance.available.usd < state.balance.threshold.warning.usd,
    tasksByServerId: (state) => (serverId) => state.tasks.filter(task => task.entity === `servers/${serverId}`)
  }
})

export default store
