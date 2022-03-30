import {
  createAccount,
  getAccount, 
  handleTwoFactor,
  updateAccount
} from '../utils/api'

const state = {
  user: null
}

const getters = {
  isAuthenticated: state => !!state.user,    
  StateUser: state => state.user
}

const actions = {
  async enable2fa({ commit }, payload) {
    payload.action = 'enable2fa'
    const response = await handleTwoFactor(payload)
    
    if (response && response.totp) {
      await commit('setUser', response)
      return response.totp
    } else if (response && response.results && response.results.length === 0) {
      return false
    }
  },
  async disable2fa({ commit }, payload) {
    payload.action = 'disable2fa'
    const response = await handleTwoFactor(payload)
   
    if (response && !response.totp) {
      await commit('setUser', response)
    }
  },
  async register({ commit }, accountNumber) {
    const userAccount = await createAccount(accountNumber)

    await commit('setUser', userAccount)
  },
  async login({ commit }, id) {
    const userAccount = await getAccount(encodeURIComponent(id))

    if (userAccount.totp) {
      return { requires2fa: true, totpSecret: userAccount.totpSecret }
    } else {
      if (userAccount._id) {
        await commit('setUser', userAccount)
      }
    }
  },
  async logout({ commit }) {
    commit('LogOut', null)
  },
  async update({ commit }, payload) {
    const response = await updateAccount(payload)

    await commit('setUser', response)
    return response
  },
  async verifyToken({ commit }, payload) {
    payload.action = 'verify'
    const response = await handleTwoFactor(payload)

    if (response && response.totp) {
      await commit('setUser', response)
    }
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