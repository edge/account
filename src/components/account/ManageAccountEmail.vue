<template>
  <div>
    <h4>Email Address</h4>
    <p class="text-gray-500">
      Your email address can be used it to sign in, receive notifications and recover your account in case you lose your account number.
    </p>
    <div>
      <ChangeAccountEmail v-if="isEditing" />
      <DisableRecoveryEmail v-else-if="isEmailEnabled" />
      <EnableRecoveryEmail v-else />
    </div>
  </div>
</template>

<script>
import ChangeAccountEmail from '@/components/account/ChangeAccountEmail'
import DisableRecoveryEmail from '@/components/account/DisableRecoveryEmail'
import EnableRecoveryEmail from '@/components/account/EnableRecoveryEmail'
import { mapState } from 'vuex'

export default {
  name: 'ManageAccountEmail',
  title() {
    return 'Edge Account Portal » Account'
  },
  data() {
    return {
      isEditing: false
    }
  },
  components: {
    ChangeAccountEmail,
    DisableRecoveryEmail,
    EnableRecoveryEmail
  },
  computed: {
    ...mapState(['account', 'backupCodes']),
    isEmailEnabled() {
      return this.account.email && this.account.email.address
    }
  }
}

</script>

<style scoped>

</style>
