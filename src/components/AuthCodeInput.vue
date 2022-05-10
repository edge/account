<template>
  <form class="flex flex-row">
    <input
      class="auth-number"
      v-model="input1"
      v-mask="'#'"
      @click="focusOnFirstEmpty"
      @keydown="onKeyDown"
      placeholder="·"
      ref="1"
      autocomplete="off"
    />
    <input
      class="auth-number"
      v-model="input2"
      v-mask="'#'"
      @click="focusOnFirstEmpty"
      @keydown="onKeyDown"
      placeholder="·"
      ref="2"
      autocomplete="off"
    />
    <input
      class="auth-number"
      v-model="input3"
      v-mask="'#'"
      @click="focusOnFirstEmpty"
      @keydown="onKeyDown"
      placeholder="·"
      ref="3"
      autocomplete="off"
    />
    <input
      class="auth-number"
      v-model="input4"
      v-mask="'#'"
      @click="focusOnFirstEmpty"
      @keydown="onKeyDown"
      placeholder="·"
      ref="4"
      autocomplete="off"
    />
    <input
      class="auth-number"
      v-model="input5"
      v-mask="'#'"
      @click="focusOnFirstEmpty"
      @keydown="onKeyDown"
      placeholder="·"
      ref="5"
      autocomplete="off"
    />
    <input
      class="auth-number"
      v-model="input6"
      v-mask="'#'"
      @click="focusOnFirstEmpty"
      @keydown="onKeyDown"
      placeholder="·"
      ref="6"
      autocomplete="off"
    />
  </form>
  <div v-if="error" class="flex items-center errorMessage mt-2">
    <ExclamationIcon class="w-3.5 h-3.5" />
    <span class="errorMessage__text">{{ error }}</span>
  </div>
</template>

<script>
import { ExclamationIcon } from '@heroicons/vue/outline'

export default {
  name: 'AuthCodeInput',
  props: ['error', 'onComplete', 'resetErrors'],
  components: {
    ExclamationIcon
  },
  data() {
    return {
      input1: '',
      input2: '',
      input3: '',
      input4: '',
      input5: '',
      input6: ''
    }
  },
  computed: {
    confirmationCode() {
      return `${this.input1}${this.input2}${this.input3}${this.input4}${this.input5}${this.input6}`
    }
  },
  methods: {
    checkNumber(num) {
      return /[0-9]/.test(num)
    },
    focusNext(e) {
      // move to previous input if hitting backspace
      if(e.which === 8) {
        // do nothing if first input box
        if (!e.target.previousElementSibling) return
        e.target.previousElementSibling.focus()
        e.target.previousElementSibling.setSelectionRange(1, 1)
      }
      // do nothing if last input box
      if (!e.target.nextElementSibling) return
      // do nothing if not a number entered
      if (!this.checkNumber(e.key)) return

      // move to next input after keydown
      e.target.nextElementSibling.focus()
      e.target.nextElementSibling.setSelectionRange(0, 0)
    },
    // on selecting any input field, refocus on the first empty input field
    focusOnFirstEmpty(e) {
      if (e.target.value) return
      const firstEmptyIndex = this.confirmationCode.length
      this.$refs[firstEmptyIndex + 1].focus()
    },
    onKeyDown(e) {
      // timeout to allow the input to be entered before performing tasks
      setTimeout(() => {
        this.resetErrors()
        this.focusNext(e)
        if (this.confirmationCode.length === 6) {
          this.submitOnComplete()
        }
      }, 1)

    },
    submitOnComplete() {
      this.onComplete(this.confirmationCode)
    }
  }
}
</script>

<style>
.auth-number {
  @apply border-2 border-gray rounded-md text-gray text-3xl;
  width: 15%;
  height: 50px;
  text-align: center;
  cursor: default;
  margin: 0;
  margin-right: 2%;
  padding: 0;
}

.auth-number:focus {
  @apply border-green;
  outline: 0;
  box-shadow: none;
  -webkit-tap-highlight-color: transparent;
}
</style>