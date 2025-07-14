<template>
  <div class="flex flex-col w-full lg:space-x-8 lg:items-end lg:flex-row">

    <!-- input -->
    <div class="flex-1 input-group">
      <label class="label">Root Password</label>
      <div class="relative flex items-center">
        <input
          autocomplete="off"
          class="w-full input input--floating"
          :disabled="disableControls"
          :class="disableControls ? 'disabled' : ''"
          placeholder="Create a password"
          required
          :type="showPassword ? 'text' : 'password'"
          v-model="password"
        />
        <EyeIcon
          v-if="showPassword"
          @click="toggleShowPassword"
          class="absolute right-0 w-5 h-5 text-gray-400"
          :class="disableControls ? 'cursor-not-allowed' : 'hover:text-green cursor-pointer'"
        />
        <EyeOffIcon
          v-if="!showPassword"
          @click="toggleShowPassword"
          class="absolute right-0 w-5 h-5 text-gray-400"
          :class="disableControls ? 'cursor-not-allowed' : 'hover:text-green cursor-pointer'"
        />
      </div>
    </div>

    <!-- buttons -->
    <div class="buttons__wrapper flex mt-4 space-x-2 lg:mt-0 justify-end">
      <button
        @click.prevent="generate"
        class="button button--solid button--small"
        :disabled=disableControls
      >
        Generate
      </button>
      <button
        class="button button--solid button--small"
        v-if="canCopy"
        @click.prevent="copyToClipboard"
        :disabled=disableControls
      >
        {{copying ? 'Copied!' : 'Copy to clipboard'}}
      </button>
    </div>

  </div>
</template>

<script>
import { EyeIcon, EyeOffIcon } from '@heroicons/vue/solid'

const passwordCharset = {
  lowercase: 'abcdefghijklmnopqrstuvwxyz',
  uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  numbers: '0123456789',
  symbols: '@#$%^&*'
}

export default {
  name: 'Password',
  components: {
    EyeIcon,
    EyeOffIcon
  },
  data() {
    return {
      canCopy: false,
      copying: false,
      password: '',
      showPassword: false
    }
  },
  props: ['disableControls'],
  methods: {
    async copyToClipboard () {
      this.copying = true
      await navigator.clipboard.writeText(this.password)

      setTimeout(() => {
        this.copying = false
      }, 2000)
    },
    generate() {
      const password = [
        passwordCharset.lowercase[Math.floor(Math.random() * passwordCharset.lowercase.length)],
        passwordCharset.uppercase[Math.floor(Math.random() * passwordCharset.uppercase.length)],
        passwordCharset.numbers[Math.floor(Math.random() * passwordCharset.numbers.length)],
        passwordCharset.symbols[Math.floor(Math.random() * passwordCharset.symbols.length)]
      ]
      const allChars = Object.values(passwordCharset).join('')
      for (let i = password.length; i < 24; i++) {
        password.push(allChars[Math.floor(Math.random() * allChars.length)])
      }
      for (let i = password.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[password[i], password[j]] = [password[j], password[i]]
      }
      this.password = password.join('')
    },
    toggleShowPassword() {
      if (this.disableControls) return
      this.showPassword = !this.showPassword
    }
  },
  mounted() {
    this.canCopy = !!navigator.clipboard
    this.generate()
  },
  watch: {
    password(value) {
      this.$emit('password-changed', value)
    }
  }
}
</script>

<style scoped>
input.disabled {
  @apply cursor-not-allowed opacity-50;
}

@media (max-width: 400px) {
  .buttons__wrapper {
    @apply flex-col space-x-0 space-y-2;
  }
  .buttons__wrapper .button {
    @apply w-full
  }
}

</style>
