<template>
  <div>
    <p class="text-gray-500">Add an email address to your account so that it may be recovered in the event that you lose your account number.</p>

    <div class="flex items-center w-full py-5">
      <input
        v-model="email"
        label="Email address"
        type="email"
        autocomplete="off"
        class="flex-1 w-full px-3 py-2 text-lg rounded-md rounded-r-none focus:outline-none"
        placeholder="Enter your email address"
      />
      <button
        class="order-2 rounded-l-none button button--success lg:order-1"
        @click.prevent="update"
        :disabled="!email || errors.email"
      >
        <span v-if="isSaving">Updating</span>
        <span v-else>Update</span>
        <span v-if="isSaving">
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
    <span class="flex-1 order-1 text-red lg:order-2" v-if="errors.email">{{errors.email}}</span>
  </div>
</template>

<script>
  import { mapActions } from 'vuex'

  export default {
    props: ['user'],
    data() {
      return {
        email: null,
        errors: {},
        isSaving: false
      }
    },
    mounted() {
      if (this.user && this.user.email) {
        this.email = this.user.email
      }
    },
    methods: {
      ...mapActions(['auth/update']),
      isEmailValid() {
        const pattern = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,24}))$/
        this.errors.email = null
        
        if (!this.email) {
          this.errors.email = 'Please enter your email address'
          return false
        }
        
        if (pattern.test(this.email)) {
          return true
        } else {
          this.errors.email = 'Please enter a valid email address'
          return false
        }
      },
      async update() {
        if (this.isEmailValid()) {
          this.isSaving = true
          
          const body = {
            accountNumber: this.user.accountNumber,
            email: this.email   
          }

          await this['auth/update'](body)
          
          setTimeout(() => {
            this.isSaving = false
          }, 2000)
        }
      }
    },
    watch: {
      email(value) {
        this.isEmailValid()
      }
    }
  }

</script>