// Copyright (C) 2022 Edge Network Technologies Limited
// Use of this source code is governed by a GNU GPL-style license
// that can be found in the LICENSE.md file. All rights reserved.

/* global process */

import * as utils from './account-utils/index'
import { createStore } from 'vuex'

const store = createStore({
  state: {
    account: null,
    announcements: [],
    config: null,
    backupCodes: null,
    balance: null,
    isAuthed: false,
    session: null,
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
      state.account = account
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
    setTasks(state, tasks) {
      state.tasks = tasks
    }
  },
  actions: {
    async getActiveTasks({ commit, state }) {
      const statusParams = 'status=created&status=running'
      const response = await utils.tasks.getTasks(
        process.env.VUE_APP_ACCOUNT_API_URL,
        state.session._key,
        statusParams
      )
      commit('setTasks', response.results)
    },
    async getAnnouncements({ commit, state }) {
      const response = await utils.announcements.getAnnouncements(
        process.env.VUE_APP_ACCOUNT_API_URL,
        state.session._key,
        {
          limit: 3,
          unread: true
        }
      )
      commit('setAnnouncements', response.results)
    },
    removeBackupCodes({ commit }) {
      commit('setBackupCodes', null)
    },
    async sessionHeartbeat({ commit, state }) {
      const session = await utils.sessions.putSession(
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
      const account = await utils.accounts.getAccount(
        process.env.VUE_APP_ACCOUNT_API_URL,
        state.session._key
      )
      commit('setAccount', account)
    },
    async updateBalance({ commit, state }) {
      const response = await utils.billing.getBalance(
        process.env.VUE_APP_ACCOUNT_API_URL,
        state.session._key
      )
      commit('setBalance', response)

    },
    async updateConfig({ commit }) {
      const response = await utils.config.getConfig(process.env.VUE_APP_ACCOUNT_API_URL)
      commit('setConfig', response)

    },
    async updateTasks({ commit, state }) {
      // do nothing if there are no pending ('created' || 'running') tasks
      if (!state.tasks.length) return
      if (!state.tasks.some(task => ['created', 'running'].includes(task.status))) return

      const keyParams = state.tasks.map(task => `key=${task._key}`).join('&')
      const response = await utils.tasks.getTasks(
        process.env.VUE_APP_ACCOUNT_API_URL,
        state.session._key,
        keyParams
      )
      const tasks = response.results
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
