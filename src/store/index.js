import auth from './auth'
import { createStore } from 'vuex'
import VuexPersist from 'vuex-persist'

const vuexLocalStorage = new VuexPersist({
  key: 'vuex',
  storage: window.localStorage
})

// Create a new vuex store.
const store = createStore({
  state: {
    serverErrors: {},
    serverSettings: {},
    vncSettings: {}
  },
  actions: {
    clear({ commit }) {
      commit('clear')
    },
    setServerError({ commit }, payload) {
      commit('setError', payload)
    },
    setServerProperty({ commit }, payload) {
      commit('set', payload)
    },
    setVncSettings({ commit }, payload) {
      commit('setVncSettings', payload)
    }
  },
  getters: {
    StateErrors: state => state.serverErrors,
    StateSettings: state => state.serverSettings,
    StateVncSettings: state => state.vncSettings
  },
  mutations: {
    clear(state) {
      Object.keys(state.serverSettings).forEach(key => {
        state.serverSettings[key] = null
      })
    },
    setError(state, payload) {
      const { property, value } = payload
      state.serverErrors[property] = value
    },
    set(state, payload) {
      const { property, value } = payload
      state.serverSettings[property] = value
    },
    setVncSettings(state, payload) {
      state.vncSettings = payload
    }
  },
  modules: {
    auth
  },
  plugins: [vuexLocalStorage.plugin]
})

export default store
