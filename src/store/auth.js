import { createAccount, getAccount } from '../utils/api'

const state = {
  user: null
}

const getters = {
  isAuthenticated: state => !!state.user,    
  StateUser: state => state.user
}

const actions = {
  async register({ commit }) {
    const userAccount = await createAccount()

    await commit('setUser', userAccount)
  },
  async login({ commit }, id) {
    const userAccount = await getAccount(encodeURIComponent(id))
    
    await commit('setUser', userAccount)
  },
  async logout({ commit }) {
    commit('LogOut', null)
  }
}

const mutations = {
  setUser(state, user) {
    state.user = user
  },
  LogOut(state) {
    state.user = null
  }
}

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}