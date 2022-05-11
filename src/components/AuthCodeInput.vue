<template>
  <form class="wrapper" ref="authForm" :class="isAuthed ? 'authed' : ''">
    <input
      class="auth-number"
      v-model="input1"
      v-mask="'#'"
      @click="focusOnFirstEmpty"
      @keydown="onKeyDown"
      placeholder="·"
      ref="1"
      autocomplete="off"
      :disabled="submitting"
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
      :disabled="submitting"
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
      :disabled="submitting"
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
      :disabled="submitting"
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
      :disabled="submitting"
    />
    <input
      class="auth-number last"
      v-model="input6"
      v-mask="'#'"
      @click="focusOnFirstEmpty"
      @keydown="onKeyDown"
      placeholder="·"
      ref="6"
      autocomplete="off"
      :disabled="submitting"
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
  props: ['error', 'isAuthed', 'onComplete', 'resetErrors'],
  components: {
    ExclamationIcon
  },
  data() {
    return {
      submitting: false,
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
      const backspace = e.which === 8
      const leftArrow = e.which === 37
      const rightArrow = e.which === 39
      const number = this.checkNumber(e.key)

      // move to previous input if hitting backspace or left arrow
      if(backspace || leftArrow) {
        // do nothing if first input box
        if (!e.target.previousElementSibling) return
        e.target.previousElementSibling.focus()
        if (leftArrow) e.target.previousElementSibling.setSelectionRange(0, 0)
        else e.target.previousElementSibling.setSelectionRange(1, 1)
      }

      // move to next input if number entered or hitting right arrow key
      if (number || rightArrow) {
        // do nothing if last input box
        if (!e.target.nextElementSibling) return
        e.target.nextElementSibling.focus()
        e.target.nextElementSibling.setSelectionRange(0, 0)
      }
    },
    // on selecting any input field, refocus on the first empty input field
    focusOnFirstEmpty(e) {
      if (e.target.value) return
      const firstEmptyIndex = this.confirmationCode.length
      this.$refs[firstEmptyIndex + 1].focus()
    },
    onKeyDown(e) {
      const enter = e.which === 13
      const number = this.checkNumber(e.key)
      const finalInput = e.target.className.includes('last')
      // timeout to allow the input to be entered before performing tasks
      setTimeout(() => {
        this.resetErrors()
        this.focusNext(e)
        // submit form if entering final number or hitting enter
        if (number && finalInput) this.submitForm()
        if (enter) this.submitForm()
      }, 1)

    },
    setAllInputs(newInput) {
      this.input1 = newInput
      this.input2 = newInput
      this.input3 = newInput
      this.input4 = newInput
      this.input5 = newInput
      this.input6 = newInput
    },
    async submitForm() {
      this.submitting = true
      if (this.confirmationCode.length < 6) return
      await this.onComplete(this.confirmationCode)
      this.submitting = false
    }
  },
  mounted() {
    this.$refs['1'].focus()
  },
  watch: {
    error() {
      if (!this.error) return
      this.setAllInputs('')
      this.$refs['1'].focus()
      this.$refs.authForm.classList.toggle('error-shake')
      setTimeout(() => {
        this.$refs.authForm.classList.toggle('error-shake')
      }, 200);
    }
  }
}
</script>

<style>
.wrapper {
  @apply flex flex-row w-full justify-between;
}

.auth-number {
  @apply border-2 border-gray-700 rounded-md text-gray-700 text-3xl h-14;
  width: 15%;
  max-width: 70px;
  text-align: center;
  cursor: default;
}

.auth-number:focus {
  @apply border-green;
  outline: 0;
  box-shadow: none;
  -webkit-tap-highlight-color: transparent;
}

.auth-number[disabled] {
  @apply border-gray text-gray;
}

.wrapper.authed .auth-number {
  @apply border-green text-green;
}

.error-shake {
  -webkit-animation: kf_shake 0.4s 1 linear;
  -moz-animation: kf_shake 0.4s 1 linear;
  -o-animation: kf_shake 0.4s 1 linear;
}
.error-shake .auth-number {
  @apply border-red;
}
@-webkit-keyframes kf_shake {
  0% { -webkit-transform: translate(6px); }
  20% { -webkit-transform: translate(-6px); }
  40% { -webkit-transform: translate(3px); }
  60% { -webkit-transform: translate(-3px); }
  80% { -webkit-transform: translate(1px); }
  100% { -webkit-transform: translate(0px); }
}
@-moz-keyframes kf_shake {
  0% { -moz-transform: translate(6px); }
  20% { -moz-transform: translate(-6px); }
  40% { -moz-transform: translate(3px); }
  60% { -moz-transform: translate(-3px); }
  80% { -moz-transform: translate(1px); }
  100% { -moz-transform: translate(0px); }
}
@-o-keyframes kf_shake {
  0% { -o-transform: translate(6px); }
  20% { -o-transform: translate(-6px); }
  40% { -o-transform: translate(3px); }
  60% { -o-transform: translate(-3px); }
  80% { -o-transform: translate(1px); }
  100% { -o-origin-transform: translate(0px); }
}

@screen sm {
  .wrapper {
    @apply grid grid-cols-6 gap-x-1;
  }

  .auth-number {
    @apply w-full;
  }
}
@media (max-width: 300px) {
  .auth-number {
    @apply text-xl h-10;
  }
}
</style>