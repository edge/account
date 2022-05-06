<template>
  <div v-show="step === 1">
    <p class="text-gray-500">Add an email address to your account so that it may be recovered in the event that you lose your account number.</p>

    <div class="flex items-center w-full rounded-md" :class="wide ? '' : 'border border-gray'">
      <input
        v-model="v$.email.$model"
        label="Email address"
        type="email"
        autocomplete="off"
        class="overflow-hidden flex-1 px-3 py-2 rounded-md rounded-r-none focus:outline-none"
        :class="wide ? 'text-lg' : 'text-md'"
        placeholder="Enter your email address"
      />
      <button
        class="order-2 rounded-l-none text-sm button button--success lg:order-1"
        @click.prevent="addEmail"
        :disabled="this.v$.email.$invalid"
      >
        <span v-if="isSaving"><LoadingSpinner /></span>
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

    <div v-if="showFeedback" class="flex items-center mt-2 space-x-1 text-green">
      <CheckCircleIcon class="w-4 h-4" />
      <span>Confirmation email sent.</span>
    </div>
  </div>

  <div v-show="step === 2">
    <p class="text-gray-500">Not quite there yet. Check your emails for a verification email and enter the confirmation code below.</p>

    <div class="flex items-center w-full rounded-md" :class="wide ? '' : 'border border-gray'">
      <input
        v-model="v$.confirmationCode.$model"
        label="Confirmation code"
        autocomplete="off"
        class="overflow-hidden flex-1 px-3 py-2 rounded-md rounded-r-none text-center focus:outline-none"
        :class="wide ? 'text-lg' : 'text-md'"
        v-mask="'# # # # # #'"
        placeholder="1 2 3 4 5 6"
      />
      <button
        class="order-2 rounded-l-none text-sm button button--success lg:order-1"
        @click.prevent="confirmEmail"
        :disabled="v$.confirmationCode.invalid"
      >
        <span v-if="isSaving"><LoadingSpinner /></span>
        <span v-else>Confirm</span>
      </button>
    </div>
    <!-- error message  -->
    <div class="flex items-center errorMessage mt-2" v-for="error of v$.confirmationCode.$errors" :key="error.$uid">
      <ExclamationIcon class="w-3.5 h-3.5" />
      <span class="errorMessage__text">{{ error.$message }}</span>
    </div>
    <div v-if="errors.email" class="flex items-center errorMessage mt-1">
      <ExclamationIcon class="w-3.5 h-3.5" />
      <span class="errorMessage__text">{{ errors.confirmationCode }}</span>
    </div>

    <div v-if="showFeedback" class="flex items-center mt-2 space-x-1 text-green">
      <CheckCircleIcon class="w-4 h-4" />
      <span>Recovery email updated successfully.</span>
    </div>
  </div>
</template>

<script>
import * as utils from '../../account-utils/index'
import * as validation from '../../utils/validation'
import LoadingSpinner from '@/components/icons/LoadingSpinner'
import { CheckCircleIcon, ExclamationIcon } from '@heroicons/vue/outline'
import { mapState } from 'vuex'
import useVuelidate from '@vuelidate/core'

const ACCOUNT_API_URL = process.env.VUE_APP_ACCOUNT_API_URL

export default {
  components: {
    CheckCircleIcon,
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
      isSaving: false,
      showFeedback: false,
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
        validation.confirmationCode,
        validation.required
      ]
    }
  },
  props: ['wide'],
  computed: {
    ...mapState(['account', 'session'])
  },
  mounted() {
    if (this.account && this.account.email) {
      this.email = this.account.email
    }
  },
  methods: {
    async addEmail() {
      if (!this.v$.email.invalid) {
        this.isSaving = true

        const res = await utils.accounts.enableRecovery(
          ACCOUNT_API_URL,
          this.account._key,
          this.email,
          this.session._key
        )
        console.log(res)

        setTimeout(() => {
          this.isSaving = false
          this.showFeedback = true

          this.step = 2

          setTimeout(() => {
            this.showFeedback = false
          }, 2000)
        }, 2000)
      }
    },
    async confirmEmail() {
      if (!this.v$.email.invalid) {
        this.isSaving = true

        const res = await utils.accounts.verifyRecovery(
          ACCOUNT_API_URL,
          this.account._key,
          this.confirmationCode.split(' ').join(''),
          this.session._key
        )
        console.log(res)

        // const body = {
        //   accountNumber: this.account._key,
        //   email: this.email
        // }

        setTimeout(() => {
          this.isSaving = false
          this.showFeedback = true

          this.step = 2

          setTimeout(() => {
            this.showFeedback = false
          }, 2000)
        }, 2000)
      }
    }
  },
  setup() {
    return {
      v$: useVuelidate()
    }
  }
}
</script>
