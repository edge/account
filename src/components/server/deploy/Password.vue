<template>
  <div class="flex flex-col w-full lg:space-x-8 lg:items-end lg:flex-row">

    <!-- input -->
    <div class="flex-1 input-group">
      <label class="label">Password</label>
      <div class="relative flex items-center">
        <input
          autocomplete="off"
          class="w-full input input--floating"
          :disabled="isRegionDisabled"
          :class="isRegionDisabled ? 'disabled' : ''"
          placeholder="Create a password"
          required
          :type="showPassword ? 'text' : 'password'"
          v-model="password"
        />
        <EyeIcon v-if="showPassword" @click="showPassword = false" class="absolute right-0 w-5 h-5 text-gray-400 hover:text-green cursor-pointer" />
        <EyeOffIcon v-if="!showPassword" @click="showPassword = true" class="absolute right-0 w-5 h-5 text-gray-400 hover:text-green cursor-pointer" />
      </div>
    </div>

    <!-- buttons -->
    <div class="buttons__wrapper flex mt-5 space-x-2 lg:mt-0 justify-end">
      <button @click.prevent="generate" class="button button--solid button--small">Generate</button>
      <button
        class="button button--solid button--small"
        v-if="canCopy"
        @click.prevent="copyToClipboard"
      >
        {{copying ? 'Copied!' : 'Copy to clipboard'}}
      </button>
    </div>

  </div>
</template>

<script>
import { anyid } from 'anyid'
import { EyeIcon, EyeOffIcon } from '@heroicons/vue/solid'

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
      idGenerator: null,
      password: '',
      showPassword: false
    }
  },
  props: ['isRegionDisabled'],
  methods: {
    async copyToClipboard () {
      this.copying = true
      await navigator.clipboard.writeText(this.password)

      setTimeout(() => {
        this.copying = false
      }, 2000)
    },
    generate() {
      this.password = this.idGenerator.id()
    }
  },
  mounted() {
    this.canCopy = !!navigator.clipboard
    this.idGenerator = anyid().encode('0Aa-IO').length(21).random()
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