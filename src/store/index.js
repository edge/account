import auth from './auth'
import { createStore } from 'vuex'
import VuexPersist from 'vuex-persist'

const vuexLocalStorage = new VuexPersist({
  key: 'vuex',
  storage: window.localStorage
})

// Create a new vuex store.
const store = createStore({
  modules: {
    auth
  },
  plugins: [vuexLocalStorage.plugin]
})

export default store
