<template>
  <div class="product">
    <h2>{{title}}</h2>
    <div class="summary">
      <span class="icon">
        <slot name="icon"></slot>
      </span>
      <span class="name">{{product.name}}</span>
      <span class="price">{{price}}</span>
    </div>
    <div class="section live-chat">
      <h3>Live chat</h3>
      <div class="content">{{product.liveChat}}</div>
    </div>
    <div class="section hours">
      <h3>Hours</h3>
      <div class="content" v-html="hours"/>
    </div>
    <div class="section circleloop">
      <h3>Circleloop</h3>
      <div class="content">{{product.circleloop}}</div>
    </div>
    <div class="section account-manager">
      <h3>Account manager</h3>
      <div class="content">{{product.accountManager}}</div>
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
