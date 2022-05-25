// Copyright (C) 2022 Edge Network Technologies Limited
// Use of this source code is governed by a GNU GPL-style license
// that can be found in the LICENSE.md file. All rights reserved.

/* global process */

import * as utils from './account-utils/index'
import { createStore } from 'vuex'

const store = createStore({
  state: {
    account: null,
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
    logout(state) {
      state.account = null
      state.isAuthed = false
      state.session = null
    },
    setAccount(state, account) {
      state.account = account
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
    // eslint-disable-next-line max-len
    tasksByServerId: (state) => (serverId) => state.tasks.filter(task => task.entity === `servers/${serverId}`)
  }
})

export default store
