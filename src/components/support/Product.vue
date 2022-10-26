<template>
  <div class="product box">
    <h2>{{ title }}</h2>
    <div class="summary">
      <span class="icon">
        <slot name="icon"></slot>
      </span>
      <span class="name">{{ product.name }}</span>
      <span class="price">{{ price }}</span>
    </div>
    <div class="section live-chat">
      <h4>Live chat</h4>
      <div class="content">{{ product.liveChat }}</div>
    </div>
    <div class="section hours">
      <h4>Hours</h4>
      <div class="content" v-html="hours"/>
    </div>
    <div class="section circleloop">
      <h4>Circleloop</h4>
      <div class="content">{{ product.circleloop }}</div>
    </div>
    <div class="section account-manager">
      <h4>Account manager</h4>
      <div class="content">{{ product.accountManager }}</div>
    </div>
    <slot name="actions"></slot>
  </div>
</template>

<script>
import MarkdownIt from 'markdown-it'

const md = new MarkdownIt()

export default {
  name: 'SupportProduct',
  props: ['icon', 'product', 'title'],
  computed: {
    hours() {
      if (this.product.hours) return md.render(this.product.hours)
      return ''
    },
    price() {
      if (this.product.price.type === 'flatRate') {
        return `$${this.product.price.cost}/${this.product.price.costBasis/24} days`
      }
      else if (this.product.price.type === 'free') {
        return 'Free'
      }
      return ''
    }
  }
}
</script>

<style scoped>
.product {
  @apply grid gap-y-4;
  @apply flex-col w-1/2;
  @apply cursor-pointer transition-all duration-100;
}

.summary .icon {
  @apply inline-block w-8;
}

.summary .icon svg {
  @apply w-full;
}

.section .content {
  @apply text-green;
}
</style>
