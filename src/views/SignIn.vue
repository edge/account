<template>
  <div class="signIn">
    <div class="signIn__left">
      <div class="signIn__content">
        <Logo/>
        <p class="pr-5 text-lg">Welcome back. Enter your account number to sign into the Edge Network.</p>

        <form class="signIn__form">          
          <!-- input group -->
          <!-- apply input-group__error class for error styles -->
          <div class="input-group">
            <label class="label">Account number</label>
            <input class="input input--floating" v-mask="'#### #### #### ####'" v-model="accountNumber" placeholder="1234 5678 9012 3456" />
          </div>

          <!-- error message  -->
          <!-- <div class="flex items-center errorMessage"> 
            <ExclamationIcon class="w-3.5 h-3.5" />
            <span class="errorMessage__text">This is an error message</span>
          </div> -->

          <!-- buttons -->
          <div class="flex flex-col space-y-2">
            <button
              @click.prevent="signIn()"
              class="button button--success"
              :disabled="isSigningIn"
            >
              <span v-if="isSigningIn">Signing in</span>
              <span v-else>Sign In</span>
              <span v-if="isSigningIn">
                <svg class="w-4 ml-2 animate-spin" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                  <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                  <line x1="12" y1="6" x2="12" y2="3" />
                  <line x1="16.25" y1="7.75" x2="18.4" y2="5.6" />
                  <line x1="18" y1="12" x2="21" y2="12" />
                  <line x1="16.25" y1="16.25" x2="18.4" y2="18.4" />
                  <line x1="12" y1="18" x2="12" y2="21" />
                  <line x1="7.75" y1="16.25" x2="5.6" y2="18.4" />
                  <line x1="6" y1="12" x2="3" y2="12" />
                  <line x1="7.75" y1="7.75" x2="5.6" y2="5.6" />
                </svg>
              </span>
            </button>
            <span class="w-full tracking-wider text-center text-black">OR</span>
            <button
              @click.prevent="createNewAccount()"
              class="button button--solid"
              :disabled="isCreatingAccount"
            >
              <span v-if="isCreatingAccount">Creating your account</span>
              <span v-else>Create new account</span>
              <span v-if="isCreatingAccount">
                <svg class="w-4 ml-2 animate-spin" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                  <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                  <line x1="12" y1="6" x2="12" y2="3" />
                  <line x1="16.25" y1="7.75" x2="18.4" y2="5.6" />
                  <line x1="18" y1="12" x2="21" y2="12" />
                  <line x1="16.25" y1="16.25" x2="18.4" y2="18.4" />
                  <line x1="12" y1="18" x2="12" y2="21" />
                  <line x1="7.75" y1="16.25" x2="5.6" y2="18.4" />
                  <line x1="6" y1="12" x2="3" y2="12" />
                  <line x1="7.75" y1="7.75" x2="5.6" y2="5.6" />
                </svg>
              </span>
            </button>
          </div>
        </form>

      </div>
    </div>
    <div class="signIn__right">
      <img class="object-cover w-full h-full" src="https://images.unsplash.com/photo-1614777735430-7b46df56b404?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=664&q=80" />
    </div>
  </div>
</template>

<script>
import { ExclamationIcon } from '@heroicons/vue/outline'
import Logo from '@/components/Logo'
import SideNavigation from '@/components/SideNavigation'
import UserMenu from '@/components/UserMenu'
import { mapActions } from 'vuex'

export default {
  name: 'Sign In',
  title() {
    return 'Edge Account Portal » Sign In'
  },
  components: {
    ExclamationIcon,
    Logo,
    SideNavigation,
    UserMenu,
  },
  data() {
    return {
      accountNumber: '',
      isCreatingAccount: false,
      isSigningIn: false
    }
  },
  methods: {
    ...mapActions(['auth/login', 'auth/register']),
    async createNewAccount() {
      this.isCreatingAccount = true
      await this['auth/register']()
      
      setTimeout(() => {
        this.$router.push('/')
      }, 2000)
    },
    async signIn() {
      this.isSigningIn = true
      await this['auth/login'](this.accountNumber)
      setTimeout(() => {
        this.$router.push('/')
      }, 2000)
    }
  }
}
</script>
<style scoped>
  .signIn {
    @apply flex w-screen h-screen bg-white;
  }
  .signIn__left {
    @apply flex justify-center w-full h-full px-5 lg:w-1/2;
  }
  .signIn__right {
    @apply hidden w-1/2 h-full lg:block;
  }
  .signIn__content {
    @apply flex flex-col w-full my-auto space-y-8 py-10 sm:max-w-md;
  }
  .signIn__form {
    @apply flex flex-col space-y-6;
  }
</style>
