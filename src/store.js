// Copyright (C) 2022 Edge Network Technologies Limited
// Use of this source code is governed by a GNU GPL-style license
// that can be found in the LICENSE.md file. All rights reserved.

/* global process */
/* global $crisp */

import * as api from './account-utils/index'
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
    tasks: []
  },
  mutations: {
    addTask(state, newTask) {
      state.tasks = [...state.tasks, newTask]
    },
    deleteTask(state, taskToDelete) {
      state.tasks = state.tasks.filter(task => task._key !== taskToDelete._key)
    },
    setAccount(state, account) {
      state.account = account;
      /** @todo fix race conditions; wait for crisp to be ready */
      (async () => {
        if (!$crisp) return
        // https://docs.crisp.chat/guides/chatbox-sdks/web-sdk/dollar-crisp/#change-user-nickname
        const name = $crisp.get('user:nickname')
        if (name.slice(0, 2) !== 'XX') {
          const masked = `XX${account._key.slice(-6)}`
          $crisp.push(['set', 'user:nickname', [masked]])
        }
      })()
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
    setSession(state, session) {
      state.session = session
    },
    setSubscriptions(state, subscriptions) {
      state.subscriptions = subscriptions
      // https://docs.crisp.chat/guides/chatbox-sdks/web-sdk/dollar-crisp/#push-session-segments
      if ($crisp) $crisp.push(['set', 'session:segments', [
        ['customer', ...subscriptions.map(sub => sub.product)]
      ]])
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
      commit('setAccount', null)
      commit('setSession', null)
      commit('setTasks', [])
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
    }
  },
  getters: {
    balanceSuspend: (state) => state.balance && state.balance.available.usd <= state.balance.threshold.suspend.usd,
    // eslint-disable-next-line max-len
    balanceWarning: (state, getters) => state.balance && !getters.balanceSuspend && state.balance.available.usd < state.balance.threshold.warning.usd,
    // eslint-disable-next-line max-len
    tasksByServerId: (state) => (serverId) => state.tasks.filter(task => task.entity === `servers/${serverId}`)
  }
})

export default store
