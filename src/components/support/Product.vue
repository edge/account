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
    <slot name="detail"></slot>
    <slot name="actions"></slot>
  </div>
</template>

<script>
export default {
  name: 'SupportProduct',
  props: ['icon', 'product', 'title'],
  computed: {
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
</style>
