<template>
  <div class="mainContent__inner">

    <div class="flex justify-between">
      <h1>Edge Support</h1>
    </div>

    <div v-if="!loaded" class="flex items-center">
      <span>Loading products</span>
      <div class="ml-2"><LoadingSpinner /></div>
    </div>

    <ul v-if="loaded" className="productList">
      <li
        v-for="product of products"
        :key="product._key"
        :className="`productList__item ${isSubscribed(product._key) ? 'active' : ''}`"
      >
        <span class="productList__name">{{product.name}}</span>

        <div class="productList__cost" v-if="product.price.type == 'flatRate'">
          ${{product.price.cost}}/{{product.price.costBasis/24}} days
        </div>

        <div v-if="isSubscribed(product._key)">
          <div class="mb-4">You are subscribed.</div>
          <button
            v-if="!product.internal && product.active"
            @click.prevent="() => unsubscribe(product)"
            class="button button--small button--error"
          >
            <span>Unsubscribe</span>
          </button>
        </div>
        <div v-else>
          <div class="mb-4">You are not subscribed.</div>
          <button
            v-if="!product.internal"
            @click.prevent="() => subscribe(product)"
            class="button button--success button--small"
          >
            <span>Subscribe</span>
          </button>
        </div>

        <div v-if="hasError(product._key)" class="error">
          {{getError(product).message}}
        </div>
      </li>
    </ul>
  </div>
</template>

<script>
/* global process */
import * as api from '@/account-utils'
import LoadingSpinner from '@/components/icons/LoadingSpinner'
import { mapState } from 'vuex'

const productIDs = process.env.VUE_APP_PRODUCT_IDS.split(',')

export default {
  name: 'Support',
  title() {
    return 'Edge Account Portal » Support'
  },
  data() {
    return {
      loaded: false,
      errors: {},
      products: {}
    }
  },
  components: {
    LoadingSpinner
  },
  computed: {
    ...mapState(['session', 'subscriptions'])
  },
  methods: {
    getError(id) {
      return this.errors[id]
    },
    getSubscription(id) {
      return this.subscriptions.find(s => s.product === id)
    },
    hasError(id) {
      return this.errors[id] !== undefined
    },
    isSubscribed(id) {
      if (this.products[id] === undefined) return false
      return this.subscriptions.find(s => s.product === id) !== undefined
    },
    async refreshProducts() {
      const getResult = await Promise.allSettled(productIDs.map(async id => {
        const { product } = await api.products.get(process.env.VUE_APP_ACCOUNT_API_URL, this.session._key, id)
        return product
      }))
      const products = getResult
        .filter(r => r.status === 'fulfilled')
        .map(r => r.value)
      this.products = products.reduce((ps, p) => {
        ps[p._key] = p
        return ps
      }, {})
      this.loaded = true
    },
    refreshSubscriptions() {
      return this.$store.dispatch('updateSubscriptions')
    },
    async subscribe(product) {
      delete this.errors[product._key]
      try {
        await api.products.subscribe(process.env.VUE_APP_ACCOUNT_API_URL, this.session._key, product._key)
        await this.refreshSubscriptions()
      }
      catch (err) {
        this.errors[product._key] = err
        console.error(err)
      }
    },
    async unsubscribe(product) {
      delete this.errors[product._key]
      try {
        await api.products.unsubscribe(process.env.VUE_APP_ACCOUNT_API_URL, this.session._key, product._key)
        await this.refreshSubscriptions()
      }
      catch (err) {
        this.errors[product._key] = err
        console.error(err)
      }
    }
  },
  mounted() {
    this.refreshSubscriptions()
      .then(() => {
        this.refreshProducts()
      })
      .catch(err => console.error(err))
  }
}
</script>

<style scoped>
.productList {
  @apply space-y-2;
}

/* list item */
.productList__item {
  @apply grid auto-rows-auto gap-y-4 bg-white text-gray-500 border-l-8 border-gray-400 rounded-md w-full p-5;
  @apply cursor-pointer transition-all duration-100;
}

.productList__item.active {
  @apply border-green;
}

.productList__name {
  @apply text-md truncate;
}
</style>
