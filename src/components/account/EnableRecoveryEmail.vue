<template>
  <div>
    <!-- add recovery email address step -->
    <div v-show="step === 1" class="my-2">
      <p class="text-gray-500">
        Add an email address to your account so that it may be recovered in the event that you lose your account number.
      </p>
      <!-- email input and button -->
      <div class="input-field flex items-center w-full">
        <input
          v-model="v$.email.$model"
          label="Email address"
          type="email"
          autocomplete="off"
          class="overflow-hidden flex-1 px-3 py-2 text-lg rounded-md rounded-r-none focus:outline-none border border-gray border-r-0"
          placeholder="Enter email address"
          @keypress="enableOnEnter"
        />
        <button
          class="rounded-l-none text-sm py-3 button button--success w-32"
          @click.prevent="enableRecovery"
          :disabled="!canEnable"
        >
          <div v-if="isLoading" class="flex flex-row">
            <span>Adding</span>
            <span class="ml-2"><LoadingSpinner /></span>
          </div>
          <span v-else>Add</span>
        </button>
      </div>
      <!-- error message  -->
      <div class="flex items-center errorMessage mt-2" v-for="error of v$.email.$errors" :key="error.$uid">
        <ExclamationIcon class="w-3.5 h-3.5" />
        <span class="errorMessage__text">{{ error.$message }}</span>
      </div>
      <div class="mt-2" v-if="errors.email">
        <HttpError :error="errors.email" />
      </div>
    </div>

    <!-- verify recovery email step -->
    <div v-show="step === 2" class="my-2">
      <!-- email sent message -->
      <div class="flex mb-2 items-center">
        <div>
          <BadgeCheckIcon class="h-5 text-green" />
        </div>
        <span class="ml-1 text-green">Confirmation email sent to {{ email }}</span>
      </div>
      <!-- back to change recovery email button -->
      <div class="mb-2">
        <button
          @click.prevent="returnToEnable"
          class="text-sm text-gray-500 underline hover:text-green"
        >
          Change recovery email address
        </button>
      </div>
      <!-- instructions -->
      <p class="text-gray-500">
        Not quite there yet.
        Check your emails and enter the confirmation code below to verify your recovery email address.
      </p>
      <!-- confirmation code and button -->
      <div class="input-field flex items-center w-full">
        <input
          v-model="v$.confirmationCode.$model"
          label="Confirmation code"
          autocomplete="off"
          class="text-center text-lg overflow-hidden flex-1 px-3 py-2 rounded-md rounded-r-none focus:outline-none border border-gray border-r-0"
          v-mask="'# # # # # #'"
          placeholder="1 2 3 4 5 6"
          @keypress="verifyOnEnter"
        />
        <button
          class="order-2 rounded-l-none text-sm py-3 button button--success py-2 w-32"
          @click.prevent="verifyRecovery"
          :disabled="!canVerify"
        >
          <div v-if="isLoading" class="flex flex-row items-center">
            <span>Verifying</span>
            <span class="ml-2"><LoadingSpinner /></span>
          </div>
          <span v-else>Verify</span>
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
  </div>
</template>

<script>
/* global process */

import * as utils from '../../account-utils/index'
import * as validation from '../../utils/validation'
import { BadgeCheckIcon } from '@heroicons/vue/solid'
import { ExclamationIcon } from '@heroicons/vue/outline'
import HttpError from '@/components/HttpError'
import LoadingSpinner from '@/components/icons/LoadingSpinner'
import useVuelidate from '@vuelidate/core'
import { mapActions, mapState } from 'vuex'

export default {
  components: {
    BadgeCheckIcon,
    ExclamationIcon,
    HttpError,
    LoadingSpinner
  },
  data() {
    return {
      confirmationCode: '',
      email: '',
      errors: {
        confirmationCode: '',
        email: ''
      },
      httpError: {response: {body: {message: 'test'}}},
      isLoading: false,
      step: 1
    }
  },
  validations() {
    return {
      email: [
        validation.email,
        validation.required
      ],
      confirmationCode: [
        validation.confirmationCode
      ]
    }
  },
  props: ['fullScreen'],
  computed: {
    ...mapState(['account', 'session']),
    canEnable() {
      return !this.v$.email.$invalid && !this.errors.email && !this.isLoading
    },
    canVerify() {
      return !this.v$.confirmationCode.$invalid && !this.errors.confirmationCode && !this.isLoading
    },
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
    ...mapActions(['updateAccount']),
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
          process.env.VUE_APP_ACCOUNT_API_URL,
          this.session._key,
          this.email
        )
        setTimeout(async () => {
          await this.updateAccount()
          this.isLoading = false
          this.step = 2
        }, 500)
      }
      catch (error) {
        setTimeout(() => {
          this.errors.email = error
          this.isLoading = false
        }, 1000)
      }
    },
    returnToEnable() {
      this.email = ''
      this.step = 1
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
        await utils.accounts.verifyRecovery(
          process.env.VUE_APP_ACCOUNT_API_URL,
          this.session._key,
          this.recoverySecret
        )
        setTimeout(async () => {
          await this.updateAccount()
          this.isLoading = false
        }, 800)
      }
      catch (error) {
        setTimeout(() => {
          this.errors.confirmationCode = 'Verification code invalid'
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
      this.errors.confirmationCode = ''
    },
    email() {
      this.errors.email = ''
    }
  }
}
</script>

<style scoped>
.input-field {
  max-width: 548px;
}

@media (max-width: 450px) {
  /* split input and button into two rows */
  .input-field {
    @apply w-full flex-col;
  }

  .input-field input {
    @apply w-full border-r rounded-r-md mb-2 text-md;
  }

  .input-field .button {
    @apply w-full rounded-l-md;
  }
}
</style>
