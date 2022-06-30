// Copyright (C) 2022 Edge Network Technologies Limited
// Use of this source code is governed by a GNU GPL-style license
// that can be found in the LICENSE.md file. All rights reserved.

/* global process */

import * as utils from './account-utils/index'
import { createStore } from 'vuex'

const store = createStore({
  state: {
    account: null,
    balance: null,
    isAuthed: false,
    serverCount: null,
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
    setBalance(state, balance) {
      state.balance = balance
    },
    setIsAuthed(state, isAuthed) {
      state.isAuthed = isAuthed
    },
    setServerCount(state, count) {
      state.serverCount = count
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
    async updateServerCount({ commit, state }) {
      const response = await utils.servers.getServers(
        process.env.VUE_APP_ACCOUNT_API_URL,
        state.session._key,
        { limit: 1}
      )
      commit('setServerCount', response.metadata.totalCount)
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
    balanceSuspend: (state) => state.balance && state.balance.available <= state.balance.threshold.suspend,
    // eslint-disable-next-line max-len
    balanceWarning: (state, getters) => state.balance && !getters.balanceSuspend && state.balance.available < state.balance.threshold.warning,
    // eslint-disable-next-line max-len
    tasksByServerId: (state) => (serverId) => state.tasks.filter(task => task.entity === `servers/${serverId}`)
  }
})

export default store
