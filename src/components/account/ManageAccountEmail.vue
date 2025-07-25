<template>
  <div class="my-2 flex flex-col text-gray-500">
    <p class="text-gray-500 mb-0">
      Your email address can be used to sign in and receive notifications.
    </p>

    <!-- not editing -->
    <div v-if="!isEditing" class="mt-4">
      <div class="flex flex-col lg:flex-row lg:items-center gap-2 lg:gap-8 mb-6">
        <!-- email display -->
        <p class="text-2xl text-green mb-0">{{ account.email.address }}</p>

        <SubscribeCheckbox />
      </div>

      <!-- buttons -->
      <div class="flex flex-col sm:flex-row sm:space-x-2">
        <!-- update -->
        <button
          class="button button--outline-success sm:w-52"
          @click="isEditing = true"
        >
          <span>Update Email</span>
        </button>
        <!-- remove -->
        <button
          v-if="canRemoveEmail"
          class="button button--error sm:w-52"
          @click=toggleRemoveConfirmationModal
        >
          <div v-if="isLoading" class="flex items-center">
            <span>Removing</span>
            <span class="ml-2"><LoadingSpinner /></span>
          </div>
          <span v-else>Remove Email</span>
        </button>
      </div>
      <HttpError :error=httpError />
    </div>

    <!-- editing -->
    <div v-else class="mt-4">
      <!-- add email address step -->
      <div v-show="step === 1" class="my-2">
        <!-- email input and button -->
        <div class="input-field flex items-center w-full">
          <input
            v-model="v$.newEmail.$model"
            label="Email address"
            type="email"
            autocomplete="off"
            class="overflow-hidden flex-1 px-3 rounded-md rounded-r-none focus:outline-none border border-gray border-r-0 text-lg py-2"
            placeholder="Enter new email address"
            @keypress.enter="updateEmail"
          />
          <button
            class="rounded-none text-sm py-3 button button--success"
            @click.prevent="updateEmail"
            :disabled="!canUpdate"
          >
            <div v-if="isUpdating" class="flex flex-row items-center">
              <span>Updating</span>
              <span class="ml-2"><LoadingSpinner /></span>
            </div>
            <span v-else>Update</span>
          </button>
          <button
            class="rounded-l-none text-sm py-3 button button--error"
            @click.prevent="toggleEditing"
            :disabled="isUpdating"
          >
            <span>Cancel</span>
          </button>
        </div>
        <!-- error message  -->
        <ValidationError :errors="v$.newEmail.$errors" />
        <div class="mt-2" v-if="errors.newEmail">
          <HttpError :error="errors.newEmail" />
        </div>
      </div>

      <!-- verify email step -->
      <div v-show="step === 2" class="my-2">
        <!-- email sent message -->
        <div class="flex mb-2 items-center">
          <div>
            <BadgeCheckIcon class="h-5 text-green" />
          </div>
          <span class="ml-1 text-green">Confirmation email sent to {{ newEmail }}</span>
        </div>
        <!-- instructions -->
        <span class="text-gray-500">
          Not quite there yet.
          Check your emails and enter the confirmation code below to verify your email address.
        </span>
        <!-- resend email button and feedback -->
        <p class="text-gray-500 my-2">
          Haven't received the email?
          <span v-if="emailCooldown === 0"><span @click="resendEmail" class="underline cursor-pointer hover:text-green">Click here</span> to request another email.</span>
          <span v-else>Please wait {{ emailCooldown }} seconds.</span>
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
            @keypress.enter="toggleUpdateConfirmationModal"
          />
          <button
            class="order-2 rounded-none text-sm py-3 button button--success py-2 w-32"
            @click.prevent="toggleUpdateConfirmationModal"
            :disabled="!canVerify"
          >
            <div v-if="isVerifying" class="flex flex-row items-center">
              <span>Verifying</span>
              <span class="ml-2"><LoadingSpinner /></span>
            </div>
            <span v-else>Verify</span>
          </button>
          <button
            class="order-3 rounded-l-none text-sm py-3 button button--error py-2 w-32"
            @click.prevent="toggleEditing"
            :disabled="isVerifying"
          >
            <span>Cancel</span>
          </button>
        </div>
        <!-- error message  -->
        <ValidationError :errors="v$.confirmationCode.$errors" />
        <div v-if="errors.confirmationCode" class="flex items-center errorMessage mt-1">
          <ExclamationIcon class="w-3.5 h-3.5" />
          <span class="errorMessage__text">{{ errors.confirmationCode }}</span>
        </div>
      </div>
    </div>

    <!-- confirmation modals -->
    <DisableEmailConfirmation
      v-if="showRemoveConfirmationModal"
      @modal-confirm="removeEmail"
      @modal-close="toggleRemoveConfirmationModal"
    />
    <UpdateEmailConfirmation
      v-if="showUpdateConfirmationModal"
      @modal-confirm="verifyEmail"
      @modal-close="toggleUpdateConfirmationModal"
    />
  </div>
</template>

<script>
/* global process */

import * as format from '@/utils/format'
import * as utils from '@edge/account-utils'
import * as validation from '@/utils/validation'
import { BadgeCheckIcon } from '@heroicons/vue/solid'
import DisableEmailConfirmation from '@/components/confirmations/DisableEmailConfirmation'
import { ExclamationIcon } from '@heroicons/vue/outline'
import HttpError from '@/components/HttpError'
import LoadingSpinner from '@/components/icons/LoadingSpinner'
import SubscribeCheckbox from '../../modules/newsletter/components/SubscribeCheckbox.vue'
import UpdateEmailConfirmation from '@/components/confirmations/UpdateEmailConfirmation'
import ValidationError from '@/components/ValidationError.vue'
import useVuelidate from '@vuelidate/core'
import { mapActions, mapState } from 'vuex'

export default {
  components: {
    BadgeCheckIcon,
    DisableEmailConfirmation,
    ExclamationIcon,
    HttpError,
    LoadingSpinner,
    SubscribeCheckbox,
    UpdateEmailConfirmation,
    ValidationError
  },
  data() {
    return {
      confirmationCode: '',
      errors: {
        confirmationCode: '',
        newEmail: ''
      },
      emailCooldown: 0,
      httpError: '',
      isEditing: false,
      isLoading: false,
      isUpdating: false,
      isVerifying: false,
      newEmail: '',
      showRemoveConfirmationModal: false,
      showUpdateConfirmationModal: false,
      step: 1
    }
  },
  validations() {
    return {
      confirmationCode: [
        validation.confirmationCode
      ],
      newEmail: [
        validation.email,
        validation.required
      ]
    }
  },
  computed: {
    ...mapState(['account', 'config', 'session']),
    canRemoveEmail() {
      if (this.config && this.config.accounts && this.config.accounts.email) return !this.config.accounts.email.required
      return true
    },
    canUpdate() {
      return !this.v$.newEmail.$invalid && !this.errors.newEmail && !this.isUpdating
    },
    canVerify() {
      return !this.v$.confirmationCode.$invalid && !this.errors.confirmationCode && !this.isVerifying && !this.isUpdating
    },
    secret() {
      return format.removeSpaces(this.confirmationCode)
    }
  },
  methods: {
    ...mapActions(['updateAccount']),
    async removeEmail() {
      this.httpError = ''
      this.isLoading = true
      try {
        this.toggleRemoveConfirmationModal()
        await utils.removeAccountEmail(process.env.VUE_APP_ACCOUNT_API_URL, this.session._key, {
          account: this.account._key
        })
        setTimeout(async () => {
          await this.updateAccount()
          this.isLoading = false
        }, 500)
      }
      catch (error) {
        setTimeout(async () => {
          this.httpError = error
          this.isLoading = false
        }, 500)
      }
    },
    async resendEmail() {
      await utils.resendAccountVerificationEmail(process.env.VUE_APP_ACCOUNT_API_URL, this.session._key, {
        account: this.account._key
      })
      this.resetEmailCooldown()
    },
    resetEmailCooldown() {
      if (this.iEmailCooldown) clearInterval(this.iEmailCooldown)
      // set 15s email cooldown timer
      this.emailCooldown = 15
      this.iEmailCooldown = setInterval(() => {
        this.emailCooldown = this.emailCooldown - 1
        if (this.emailCooldown === 0) clearInterval(this.iEmailCooldown)
      }, 1000)
    },
    toggleEditing() {
      this.newEmail = ''
      this.confirmationCode = ''
      this.step = 1
      this.isEditing = !this.isEditing
    },
    toggleRemoveConfirmationModal() {
      this.showRemoveConfirmationModal = !this.showRemoveConfirmationModal
    },
    toggleUpdateConfirmationModal() {
      this.showUpdateConfirmationModal = !this.showUpdateConfirmationModal
    },
    async updateEmail() {
      if (this.v$.newEmail.$invalid) return
      if (this.newEmail === this.account.email.address) {
        this.toggleEditing()
        return
      }

      this.isUpdating = true

      try {
        await utils.updateAccountEmail(process.env.VUE_APP_ACCOUNT_API_URL, this.session._key, {
          account: this.account._key,
          address: this.newEmail
        })

        setTimeout(async () => {
          this.resetEmailCooldown()

          this.isUpdating = false
          this.step = 2
        }, 500)
      }
      catch (error) {
        setTimeout(() => {
          this.errors.newEmail = error
          this.isUpdating = false
        }, 1000)
      }
    },
    async verifyEmail() {
      if (this.v$.confirmationCode.$invalid) return
      this.toggleUpdateConfirmationModal()
      this.isVerifying = true
      try {
        await utils.verifyAccountEmail(process.env.VUE_APP_ACCOUNT_API_URL, this.session._key, {
          account: this.account._key,
          secret: this.secret
        })
        setTimeout(async () => {
          await this.updateAccount()
          this.isVerifying = false
          this.isEditing = false
          this.confirmationCode = ''
          this.newEmail = ''
          this.step = 1
        }, 800)
      }
      catch (error) {
        setTimeout(() => {
          this.errors.confirmationCode = 'Verification code invalid'
          this.isVerifying = false
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
    newEmail() {
      this.errors.newEmail = ''
    }
  }
}
</script>

<style scoped>
.input-field {
  max-width: 548px;
}

@media (max-width: 600px) {
  /* split input and button into two rows */
  .input-field {
    @apply w-full flex-col;
  }

  .input-field input {
    @apply w-full border-r rounded-r-md mb-2 text-md;
  }

  .input-field .button {
    @apply w-full rounded-md mb-2;
  }
}

.input-field .smaller-font {
  @apply text-md;
  padding-top: calc(0.75rem - 1px);
  padding-block: calc(0.75rem - 1px);
}
</style>
