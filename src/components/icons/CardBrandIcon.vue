<template>
  <img
    v-if="iconExists"
    :class=className
    :src=filePath
    alt="card brand icon"
  >
  <div v-else><CreditCardIcon class="w-10 text-green" /></div>
</template>

<script>
import { CreditCardIcon } from '@heroicons/vue/solid'

export default {
  name: 'CardBrandIcon',
  props: ['className', 'brand'],
  components: {
    CreditCardIcon
  },
  computed: {
    iconExists() {
      return ['amex', 'discover', 'mastercard', 'visa'].includes(this.brand)
    },
    filePath() {
      return `/assets/images/card_brands/${this.brand}.png`
    }
  }
}
</script>

<style scoped>
img {
  height: 40px;
}
</style>
