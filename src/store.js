// Copyright (C) 2022 Edge Network Technologies Limited
// Use of this source code is governed by a GNU GPL-style license
// that can be found in the LICENSE.md file. All rights reserved.

/*global process*/

import { createStore } from 'vuex'

const store = createStore({
  state: {
    account: null,
    isAuthed: false,
    session: null
  },
  mutations: {
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
    }
  }
})

export default store
