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
    serverSettings: {}
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
    }
  },
  getters: {
    StateErrors: state => state.serverErrors,
    StateSettings: state => state.serverSettings
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
    }
  },
  modules: {
    auth
  },
  plugins: [vuexLocalStorage.plugin]
})

export default store
