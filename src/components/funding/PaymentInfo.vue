<template>
  <div class="box">
    <h4>Payment Information</h4>
    <!-- eslint-disable-next-line max-len -->
    <p class="mt-3 text-gray-500">Enter your payment information to purchase {{formattedXE}} XE (estimated) for {{formattedUSD}} USD now.</p>
    <div class="flex flex-col w-full mt-5 lg:space-x-4 lg:items-end lg:flex-row">
      <div class="flex-1 w-full lg:w-auto input-group">
        <label class="label">Name</label>
        <input
          type="text"
          v-model="v$.name.$model"
          placeholder="John Smith"
          class="bg-transparent input input--floating"
          @keypress="submitOnEnter"
        />
      </div>
      <span v-for="error of v$.name.$errors" :key="error.$uid" class="mt-2 text-red">{{error.$message}}</span>
    </div>
    <div class="flex flex-col w-full mt-5 lg:space-x-4 lg:items-end lg:flex-row">
      <div class="flex-1 w-full lg:w-auto input-group">
        <label class="label">Email address (optional)</label>
        <input
          type="text"
          v-model="v$.email.$model"
          placeholder="john.smith@company.net"
          class="bg-transparent input input--floating"
          @keypress="submitOnEnter"
        />
      </div>
      <span v-for="error of v$.email.$errors" :key="error.$uid" class="mt-2 text-red">{{error.$message}}</span>
    </div>
    <div class="flex flex-col w-full mt-5 lg:space-x-4 lg:items-end lg:flex-row">
      <div class="flex-1 w-full lg:w-auto input-group">
        <label class="label">Street</label>
        <input
          type="text"
          v-model="v$.line1.$model"
          placeholder="1 Smith Avenue"
          class="bg-transparent input input--floating"
          @keypress="submitOnEnter"
        />
        <input
          type="text"
          v-model="v$.line2.$model"
          class="bg-transparent input input--floating"
          @keypress="submitOnEnter"
        />
      </div>
    </div>
    <div class="flex flex-col w-full mt-5 lg:space-x-4 lg:items-end lg:flex-row">
      <div class="flex-1 w-full lg:w-auto input-group">
        <label class="label">City</label>
        <input
          type="text"
          v-model="v$.city.$model"
          placeholder="London"
          class="bg-transparent input input--floating"
          @keypress="submitOnEnter"
        />
      </div>
    </div>
    <div class="flex flex-col w-full mt-5 lg:space-x-4 lg:items-end lg:flex-row">
      <div class="flex-1 w-full lg:w-auto input-group">
        <label class="label">Region</label>
        <input
          type="text"
          v-model="v$.state.$model"
          class="bg-transparent input input--floating"
          @keypress="submitOnEnter"
        />
      </div>
    </div>
    <div class="flex flex-col w-full mt-5 lg:space-x-4 lg:items-end lg:flex-row">
      <div class="flex-1 w-full lg:w-auto input-group">
        <label class="label">Country</label>
        <input
          type="text"
          v-model="v$.country.$model"
          placeholder="United Kingdom"
          class="bg-transparent input input--floating"
          @keypress="submitOnEnter"
        />
      </div>
    </div>
    <div class="flex flex-col w-full mt-5 lg:space-x-4 lg:items-end lg:flex-row">
      <div class="flex-1 w-full lg:w-auto input-group">
        <label class="label">Postcode</label>
        <input
          type="text"
          v-model="v$.postcode.$model"
          placeholder="W1 ABC"
          class="bg-transparent input input--floating"
          @keypress="submitOnEnter"
        />
      </div>
    </div>
    <div class="flex flex-col w-full mt-5 lg:space-x-4 lg:items-end lg:flex-row">
      <div class="flex-1 w-full lg:w-auto input-group">
        <label class="label">Card Number</label>
        <input
          type="text"
          v-model="v$.card.$model"
          placeholder="1111 2222 3333 4444"
          class="bg-transparent input input--floating"
          @keypress="submitOnEnter"
        />
      </div>
    </div>
    <div class="flex flex-col w-full mt-5 lg:space-x-4 lg:items-end lg:flex-row">
      <div class="flex-1 w-full lg:w-auto input-group">
        <label class="label">Expiry</label>
        <input
          type="text"
          v-model="v$.expiry.$model"
          placeholder="01/2025"
          class="bg-transparent input input--floating"
          @keypress="submitOnEnter"
        />
      </div>
    </div>
    <div class="flex flex-col w-full mt-5 lg:space-x-4 lg:items-end lg:flex-row">
      <div class="flex-1 w-full lg:w-auto input-group">
        <label class="label">CVC</label>
        <input
          type="text"
          v-model="v$.cvc.$model"
          placeholder="123"
          class="bg-transparent input input--floating"
          @keypress="submitOnEnter"
        />
      </div>
    </div>
    <div class="flex flex-col w-full mt-5 lg:space-x-4 lg:items-end lg:flex-row">
      <button
        class="w-full mt-3 button button--small button--success sm:mt-0"
        @click="trySubmit"
        :disabled="!canSubmit">
        Purchase
      </button>
    </div>
  </div>
</template>

<script>
import * as validation from '@vuelidate/validators'
import { useVuelidate } from '@vuelidate/core'

export default {
  name: 'PaymentInfo',
  data() {
    return {
      name: '',
      email: '',
      line1: '',
      line2: '',
      city: '',
      state: '',
      country: '',
      postcode: '',
      card: '',
      expiry: '',
      cvc: ''
    }
  },
  props: {
    amountUSD: Number,
    amountXE: Number,
    submit: Function
  },
  computed: {
    canSubmit() {
      return !this.v$.$invalid
    },
    formattedUSD() {
      return this.amountUSD.toFixed(2)
    },
    formattedXE() {
      return this.amountXE.toFixed(6)
    }
  },
  validations() {
    return {
      name: [validation.required],
      email: [validation.email],
      line1: [validation.required],
      line2: [],
      city: [validation.required],
      state: [],
      country: [validation.required],
      postcode: [validation.required],
      card: [validation.required],
      expiry: [validation.required],
      cvc: [validation.required]
    }
  },
  methods: {
    submitOnEnter(event) {
      if (event.charCode !== 13) return
      event.preventDefault()
      this.trySubmit()
    },
    async trySubmit() {
      if (!await this.v$.$validate()) return

      this.submit({
        name: this.name,
        email: this.email,
        line1: this.line1,
        line2: this.line2,
        city: this.city,
        state: this.state,
        country: this.country,
        postcode: this.postcode,
        card: this.card,
        expiry: this.expiry,
        cvc: this.cvc
      })
    }
  },
  setup() {
    return {
      v$: useVuelidate()
    }
  }
}
</script>
