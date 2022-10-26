<template>
  <div class="product box">
    <h4 class="title">{{ title }}</h4>
    <div class="summary">
      <span class="icon">
        <slot name="icon"></slot>
      </span>
      <span class="info">
        <span class="name">{{ product.name }}</span>
        <span class="price">{{ price }}</span>
      </span>
    </div>
    <div class="section live-chat">
      <h4>Live chat</h4>
      <div :class="`content ${hasLiveChat ? 'active' : 'inactive'}`">{{ liveChat }}</div>
    </div>
    <div class="section hours">
      <h4>Hours</h4>
      <div
        :class="`content ${hasHours ? 'active' : 'inactive'}`"
        v-html="hours"
      />
    </div>
    <div class="section circleloop">
      <h4>Circleloop</h4>
      <div :class="`content ${hasCircleloop ? 'active' : 'inactive'}`">{{ circleloop }}</div>
    </div>
    <div class="section account-manager">
      <h4>Account manager</h4>
      <div :class="`content ${hasAccountManager ? 'active' : 'inactive'}`">{{ accountManager }}</div>
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
    accountManager() {
      return this.product.accountManager[1]
    },
    circleloop() {
      return this.product.circleloop[1]
    },
    hasAccountManager() {
      return this.product.accountManager[0]
    },
    hasCircleloop() {
      return this.product.circleloop[0]
    },
    hasHours() {
      return this.product.hours[0]
    },
    hasLiveChat() {
      return this.product.liveChat[0]
    },
    hours() {
      if (this.product.hours[1]) return md.render(this.product.hours[1])
      return ''
    },
    liveChat() {
      return this.product.liveChat[1]
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

.product .title {
  @apply mb-0;
}

.summary {
  @apply flex flex-row;
}

.summary .icon {
  @apply inline-block w-8;
}

.summary .icon svg {
  @apply w-full;
}

.summary .info {
  @apply flex flex-col space-y-1 ml-2;
}

.product .section .content p {
  @apply mb-2;
}

.content.inactive {
  @apply text-gray;
}

.content.active {
  @apply text-green;
}
</style>
