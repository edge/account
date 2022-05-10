<template>
  <div v-show="step === 1" class="my-2">
    <p class="text-gray-500">Add an email address to your account so that it may be recovered in the event that you lose your account number.</p>
    <div class="flex items-center w-full">
      <input
        v-model="v$.email.$model"
        label="Email address"
        type="email"
        autocomplete="off"
        class="overflow-hidden flex-1 px-3 py-2 text-lg rounded-md rounded-r-none focus:outline-none"
        :class="fullScreen ? 'text-lg' : 'border border-gray border-r-0'"
        placeholder="Enter your email address"
        @keypress="enableOnEnter"
      />
      <button
        class="order-2 rounded-l-none text-sm py-3 button button--success py-2 lg:order-1"
        @click.prevent="enableRecovery"
        :disabled="this.v$.email.$invalid || isLoading"
      >
        <div v-if="isLoading" class="flex flex-row">
          <span>Sending Email</span>
          <span><LoadingSpinner /></span>
        </div>
        <span v-else>Add</span>
      </button>
    </div>
    <!-- error message  -->
    <div class="flex items-center errorMessage mt-2" v-for="error of v$.email.$errors" :key="error.$uid">
      <ExclamationIcon class="w-3.5 h-3.5" />
      <span class="errorMessage__text">{{ error.$message }}</span>
    </div>
    <div v-if="errors.email" class="flex items-center errorMessage mt-1">
      <ExclamationIcon class="w-3.5 h-3.5" />
      <span class="errorMessage__text">{{ errors.email }}</span>
    </div>
  </div>

  <div v-show="step === 2" class="my-2">
    <div class="flex mb-2 items-center">
      <div>
        <BadgeCheckIcon class="h-5 text-green" />
      </div>
      <span class="ml-1 text-green">Confirmation email sent to {{ email }}</span>
    </div>
    <p class="text-gray-500">Not quite there yet. Check your emails and enter the confirmation code below to verify your recovery email address.</p>
    <div class="flex items-center w-full">
      <input
        v-model="v$.confirmationCode.$model"
        label="Confirmation code"
        autocomplete="off"
        class="text-center text-lg overflow-hidden flex-1 px-3 py-2 rounded-md rounded-r-none focus:outline-none "
        :class="fullScreen ? '' : 'border border-gray border-r-0'"
        v-mask="'# # # # # #'"
        placeholder="1 2 3 4 5 6"
        @keypress="verifyOnEnter"
      />
      <button
        class="order-2 rounded-l-none text-sm py-3 button button--success py-2 lg:order-1"
        @click.prevent="verifyRecovery"
        :disabled="v$.confirmationCode.$invalid || isLoading"
      >
        <div v-if="isLoading" class="flex flex-row items-center">
          <span>Verifying</span>
          <span><LoadingSpinner /></span>
        </div>
        <span v-else>Verify Email</span>
      </button>
    </div>
    <!-- error message  -->
    <div class="flex items-center errorMessage mt-2" v-for="error of v$.confirmationCode.$errors" :key="error.$uid">
      <ExclamationIcon class="w-3.5 h-3.5" />
      <span class="errorMessage__text">{{ error.$message }}</span>
    </div>
    <div v-if="errors.confirmationCode" class="flex items-center errorMessage mt-1">
      <ExclamationIcon class="w-3.5 h-3.5" />
      <span class="errorMessage__text">{{ errors.confirmationCode }}</span>
    </div>
  </div>
</template>

<script>
import * as utils from '../../account-utils/index'
import * as validation from '../../utils/validation'
import LoadingSpinner from '@/components/icons/LoadingSpinner'
import { BadgeCheckIcon } from '@heroicons/vue/solid'
import { ExclamationIcon } from '@heroicons/vue/outline'
import { mapState } from 'vuex'
import useVuelidate from '@vuelidate/core'

const ACCOUNT_API_URL = process.env.VUE_APP_ACCOUNT_API_URL

export default {
  components: {
    BadgeCheckIcon,
    ExclamationIcon,
    LoadingSpinner
  },
  data() {
    return {
      confirmationCode: null,
      email: null,
      errors: {
        confirmationCode: '',
        email: ''
      },
      isLoading: false,
      step: 1,
    }
  },
  validations() {
    return {
      email: [
        validation.email,
        validation.required
      ],
      confirmationCode: [
        validation.confirmationCode,
      ]
    }
  },
  props: ['fullScreen'],
  computed: {
    ...mapState(['account', 'session']),
    recoverySecret() {
      return this.confirmationCode.split(' ').join('')
    }
  },
  mounted() {
    if (this.account && this.account.email) {
      this.email = this.account.email
    }
  },
  methods: {
    enableOnEnter(event) {
      if (event.charCode !== 13) return
      event.preventDefault()
      this.enableRecovery()
    },
    async enableRecovery() {
      if (this.v$.email.$invalid) return
      this.isLoading = true

      try {
        await utils.accounts.enableRecovery(
          ACCOUNT_API_URL,
          this.session._key,
          this.email
        )
        setTimeout(() => {
          this.isLoading = false
          this.step = 2
        }, 1000)
      } catch (error) {
        this.errors.email = 'Oops, something went wrong. Please try again.'
        setTimeout(() => {
          this.isLoading = false
        }, 1000)
      }
    },
    verifyOnEnter(event) {
      if (event.charCode !== 13) return
      event.preventDefault()
      this.verifyRecovery()
    },
    async verifyRecovery() {
      if (this.v$.confirmationCode.$invalid) return
      this.isLoading = true
      try {
        await utils.accounts.verifyRecovery(ACCOUNT_API_URL, this.session._key, this.account._key, this.recoverySecret)
        this.confirmEnabled()
        this.isLoading = false
      } catch (error) {
        this.errors.confirmationCode = 'Unable to verify confirmation code'
        setTimeout(() => {
          this.isLoading = false
        }, 1000)
      }
    }
  },
  setup() {
    return {
      v$: useVuelidate()
    }
  },
  watch: {
    confirmationCode() {
      // reset confirmation code error (i.e. invalid) when input is changed
      this.errors.confirmationCode = ''
    },
    email() {
      this.errors.email = ''
    }
  }
}
</script>
