<script setup>
/* global process */
import * as utils from '@edge/account-utils'
import HttpError from '@/components/HttpError'
import LoadingSpinner from '@/components/icons/LoadingSpinner.vue'
import Modal from '@/components/Modal'
import { useStore } from 'vuex'
import { AtSymbolIcon, ChatIcon, InboxIcon, InboxInIcon, PhoneIcon } from '@heroicons/vue/outline'
import { computed, effect, ref, shallowRef } from 'vue'
import { useCrisp, useTitle } from '@/hooks'

const discordUrl = 'https://discord.gg/3sEvuYJ'
const productKeys = [
  process.env.VUE_APP_PRODUCT_ID_PRIORITYSUPPORT,
  process.env.VUE_APP_PRODUCT_ID_MANAGEDHOSTING
]
const supportEmail = 'support@edge.network'
const wikiUrl = 'https://wiki.edge.network'

const crisp = useCrisp()
const store = useStore()
const title = useTitle()

const data = shallowRef()
const error = ref()
const loading = ref(true)
const loadingError = ref()
const showSubscribeModal = ref(false)
const subscribeIntent = ref()

const basicSupport = {
  _key: '',
  name: 'Basic Support',
  price: {
    type: 'fixed',
    cost: 0,
    indivisible: true
  }
}

const prioritySupport = computed(() => data.value && data.value.results.find(p => p._key === process.env.VUE_APP_PRODUCT_ID_PRIORITYSUPPORT))
const managedHosting = computed(() => data.value && data.value.results.find(p => p._key === process.env.VUE_APP_PRODUCT_ID_MANAGEDHOSTING))

const currentSubscription = computed(() => store.state.subscriptions.find(s => productKeys.includes(s.product)))
const currentProduct = computed(() => currentSubscription.value && data.value && data.value.results.find(p => p._key === currentSubscription.value.product))

const currentSubscriptionEnds = computed(() => {
  if (currentProduct.value && currentProduct.value.minDuration) {
    return currentSubscription.value.created + (currentProduct.value.minDuration * 1000 * 60 * 60)
  }
  return 0
})

function canDowngradeTo(product) {
  if (currentProduct.value) {
    if (currentProduct.value._key === product._key) return false

    if (currentProduct.value.price.type !== product.price.type) return true

    let currentPrice = 0
    if (currentProduct.value.price.type === 'fixed') currentPrice = currentProduct.value.price.cost
    else if (currentProduct.value.price.type === 'flatRate') currentPrice = currentProduct.value.price.cost / currentProduct.value.price.costBasis
    let newPrice = 0
    if (product.price.type === 'fixed') newPrice = product.price.cost
    if (product.price.type === 'flatRate') newPrice = product.price.cost / product.price.costBasis

    return newPrice <= currentPrice
  }
  return false
}

function canUpgradeTo(product) {
  if (currentProduct.value) {
    if (currentProduct.value._key === product._key) return false

    if (currentProduct.value.price.type !== product.price.type) return true

    let currentPrice = 0
    if (currentProduct.value.price.type === 'fixed') currentPrice = currentProduct.value.price.cost
    else if (currentProduct.value.price.type === 'flatRate') currentPrice = currentProduct.value.price.cost / currentProduct.value.price.costBasis
    let newPrice = 0
    if (product.price.type === 'fixed') newPrice = product.price.cost
    if (product.price.type === 'flatRate') newPrice = product.price.cost / product.price.costBasis

    return newPrice >= currentPrice
  }
  return product._key !== ''
}

function closeSubscribeModal() {
  showSubscribeModal.value = false
  subscribeIntent.value = undefined
}

function getDisplayMinimumTerm(product) {
  if (product.minDuration === 24) return '1 day'
  const days = Math.floor(product.minDuration / 24)
  return `${days} days`
}

function getDisplayPrice(product) {
  if (product.price.type === 'flatRate') {
    const days = product.price.costBasis / 24
    if (days === 1) {
      return `$${product.price.cost} per day`
    }
    return `$${product.price.cost} per ${days} days`
  }
  else if (product.price.type === 'fixed') {
    if (product.price.cost === 0) return 'Free'
    return `$${product.price.cost} per month`
  }
  return 'Unknown'
}

function isSubscribed(product) {
  if (currentSubscription.value) {
    return currentSubscription.value.product === product._key
  }
  return product._key === ''
}

function openSubscribeModal(product) {
  subscribeIntent.value = product
  showSubscribeModal.value = true
}

async function reloadProducts() {
  try {
    loading.value = true
    loadingError.value = undefined

    const res = await utils.getProducts(process.env.VUE_APP_ACCOUNT_API_URL, store.state.session._key, {
      key: productKeys
    })
    data.value = res
  }
  catch (err) {
    console.error(err)
    loadingError.value = err
  }
  finally {
    loading.value = false
  }
}

async function subscribe(product) {
  try {
    if (product._key === '') {
      await utils.unsubscribeFromProduct(process.env.VUE_APP_ACCOUNT_API_URL, store.state.session._key, currentSubscription.value.product)
    }
    else {
      await utils.subscribeToProduct(process.env.VUE_APP_ACCOUNT_API_URL, store.state.session._key, product._key)
    }
    await store.dispatch('updateSubscriptions')
  }
  catch (err) {
    error.value = err
  }
  finally {
    showSubscribeModal.value = false
  }
}

effect(() => {
  title.set('Support')
  reloadProducts()
  store.dispatch('updateSubscriptions')
})
</script>

<template>
  <div class="mainContent__inner">
    <div class="flex justify-between">
      <h1>Support</h1>
    </div>

    <div v-if="loadingError" class="flex items-center">
      <HttpError :error="loadingError"/>
    </div>

    <div v-if="loading" class="flex items-center">
      <span>Loading products</span>
      <div class="ml-2"><LoadingSpinner /></div>
    </div>

    <div v-else>
      <div class="products">
        <!-- Basic Support -->
        <div v-if="basicSupport" class="product box" :class="isSubscribed(basicSupport) ? 'active' : ''">
          <h4 class="title">{{ basicSupport.name }}</h4>
          <div class="summary">
            <span class="icon">
              <InboxInIcon v-if="isSubscribed(basicSupport)" />
              <InboxIcon v-else />
            </span>
            <span class="info">
              <span class="price">{{ getDisplayPrice(basicSupport) }}</span>
            </span>
          </div>
          <div class="detail">
            <div class="product__section live-chat">
              <span class="label">Live chat</span>
              <span class="info">Available</span>
            </div>
            <div class="product__section hours">
              <span class="label">Response time</span>
              <span class="info">&lt; 24 hours</span>
            </div>
            <div class="product__section circleloop">
              <span class="label">Phone support</span>
              <span class="info inactive">Not available on basic plan</span>
            </div>
            <div class="product__section account-manager">
              <span class="label">Account manager</span>
              <span class="info inactive">Not available on basic plan</span>
            </div>
          </div>
          <div v-if="isSubscribed(basicSupport)" class="actions flex flex-col">
            <button disabled class="button button--success button--small">
              <span>Current plan</span>
            </button>
          </div>
          <div v-else-if="canDowngradeTo(basicSupport)" class="actions flex flex-col">
            <button @click.prevent="openSubscribeModal(basicSupport)" class="button button--success button--small">
              <span>Downgrade</span>
            </button>
          </div>
        </div>

        <!-- Priority Support -->
        <div v-if="prioritySupport" class="product box" :class="isSubscribed(prioritySupport) ? 'active' : ''">
          <h4 class="title">{{ prioritySupport.name }}</h4>
          <div class="summary">
            <span class="icon">
              <InboxInIcon v-if="isSubscribed(prioritySupport)" />
              <InboxIcon v-else />
            </span>
            <span class="info">
              <span class="price">{{ getDisplayPrice(prioritySupport) }}</span>
            </span>
          </div>
          <div class="detail">
            <div class="product__section live-chat">
              <span class="label">Live chat</span>
              <span class="info">Available</span>
            </div>
            <div class="product__section hours">
              <span class="label">Response time</span>
              <span class="info">
                &lt; 1 hour 08:00-20:00 UTC<br/>
                &lt; 8 hours 20:00-08:00 UTC
              </span>
            </div>
            <div class="product__section circleloop">
              <span class="label">Phone support</span>
              <span class="info">Available</span>
            </div>
            <div class="product__section account-manager">
              <span class="label">Account manager</span>
              <span class="info">Available</span>
            </div>
            <div v-if="prioritySupport.minDuration" class="product__section min-term">
              <span class="label">Minimum term</span>
              <span class="info">{{ getDisplayMinimumTerm(prioritySupport) }}</span>
            </div>
          </div>
          <div v-if="isSubscribed(prioritySupport)" class="actions flex flex-col">
            <button disabled class="button button--success button--small">
              <span>Current plan</span>
            </button>
          </div>
          <div v-else-if="canUpgradeTo(prioritySupport)" class="actions flex flex-col">
            <button @click.prevent="openSubscribeModal(prioritySupport)" class="button button--success button--small">
              <span>Upgrade</span>
            </button>
          </div>
          <div v-else-if="canDowngradeTo(prioritySupport)" class="actions flex flex-col">
            <button @click.prevent="openSubscribeModal(prioritySupport)" class="button button--success button--small">
              <span>Downgrade</span>
            </button>
          </div>
        </div>

        <!-- Managed Hosting -->
        <div v-if="managedHosting" class="product box" :class="isSubscribed(managedHosting) ? 'active' : ''">
          <h4 class="title">{{ managedHosting.name }}</h4>
          <div class="summary">
            <span class="icon">
              <InboxInIcon v-if="isSubscribed(managedHosting)" />
              <InboxIcon v-else />
            </span>
            <span class="info">
              <span class="price">{{ getDisplayPrice(managedHosting) }}</span>
            </span>
          </div>
          <div class="detail">
            <div class="product__section support">
              <span class="label">Support</span>
              <span class="info">Same as Priority Support</span>
            </div>
            <div class="product__section includes">
              <span class="label">Includes</span>
              <ul class="info">
                <li>Server Setup and Configuration</li>
                <li>Security Management</li>
                <li>Performance Monitoring and Optimization</li>
                <li>Software Updates and Maintenance</li>
                <li>Backup and Disaster Recovery</li>
                <li>Managed Scalability</li>
                <li>Onboarding Support</li>
              </ul>
            </div>
            <div v-if="managedHosting.minDuration" class="product__section min-term">
              <span class="label">Minimum term</span>
              <span class="info">{{ getDisplayMinimumTerm(managedHosting) }}</span>
            </div>
          </div>
          <div v-if="isSubscribed(managedHosting)" class="actions flex flex-col">
            <button disabled class="button button--success button--small">
              <span>Current plan</span>
            </button>
          </div>
          <div v-else-if="canUpgradeTo(managedHosting)" class="actions flex flex-col">
            <button @click.prevent="openSubscribeModal(managedHosting)" class="button button--success button--small">
              <span>Upgrade</span>
            </button>
          </div>
          <div v-else-if="canDowngradeTo(managedHosting)" class="actions flex flex-col">
            <button @click.prevent="openSubscribeModal(managedHosting)" class="button button--success button--small">
              <span>Downgrade</span>
            </button>
          </div>
        </div>
      </div>

      <div v-if="error" class="box mb-4 mt-4">
        <HttpError :error="error"/>
      </div>

      <div class="mt-4 support box">
        <h4>Your Support</h4>

        <div v-if="currentSubscription">
          You are subscribed to {{ currentProduct.name }}. To access support:
          <ul class="flex flex-col md:flex-row mt-4 mb-8 gap-4">
            <li class="flex flex-col flex-grow text-center">
              <ChatIcon class="w-12 self-center mb-1" />
              <a href="#" @click="crisp.open" class="hover:text-green">Open live chat</a>
            </li>
            <li class="flex flex-col flex-grow text-center">
              <AtSymbolIcon class="w-12 self-center mb-1" />
              Email an account manager: <a :href="`mailto:${{ supportEmail }}`" class="hover:text-green">{{ supportEmail }}</a>
            </li>
            <li class="flex flex-col flex-grow text-center">
              <PhoneIcon class="w-12 self-center mb-1" />
              Call us on <a href="tel:02080641444" class="hover:text-green">020 8064 1444</a>
            </li>
          </ul>
          <p>For other guides and resources, you can also visit our <a :href="wikiUrl" target="_blank" class="hover:text-green">Community Wiki</a> or join the <a :href="discordUrl" target="_blank" class="hover:text-green">Discord community.</a></p>
          <span v-if="currentSubscriptionEnds > Date.now()">
            You are in the minimum term of your current subscription.
            You can change your support plan on or after {{ new Date(currentSubscriptionEnds).toLocaleDateString() }}.
          </span>
        </div>
        <div v-else>
          You can receive free basic support on:
          <ul>
            <li><a href="#" @click="crisp.open">Live chat</a></li>
            <li><a :href="wikiUrl" target="_blank">Community Wiki</a></li>
            <li><a :href="discordUrl" target="_blank">Discord</a></li>
          </ul>
          You can upgrade to another support plan for dedicated support.
        </div>
      </div>
    </div>

    <Modal v-if="showSubscribeModal">
      <template v-slot:header>
        <span class="text-green">Change of Support Plan</span>
      </template>
      <template v-slot:body>
        <div class="flex flex-col space-y-2">
          <span>You are switching from {{ currentProduct && currentProduct.name || basicSupport.name }} to {{ subscribeIntent.name }}.</span>
          <span v-if="subscribeIntent._key === ''">You will not be billed for free basic support.</span>
          <span v-else-if="subscribeIntent.price.type === 'fixed'">You will be billed monthly for this support plan.</span>
          <span v-else-if="subscribeIntent.price.type === 'flatRate'">You will be billed daily for this support plan.</span>
          <span v-if="subscribeIntent.minDuration">
            There is a minimum term of {{ getDisplayMinimumTerm(subscribeIntent) }} before you can change your support plan again.
          </span>
        </div>
      </template>
      <template v-slot:buttons>
      <button class="w-full mt-3 button button--small button--outline sm:mt-0" @click="closeSubscribeModal">Cancel</button>
      <button class="w-full button button--small button--success" @click="subscribe(subscribeIntent)" :disabled="store.state.balanceWarning">Confirm</button>
    </template>
    </Modal>
  </div>
</template>

<style scoped>
.products {
  @apply flex flex-col space-y-4;
}

.product__section {
  @apply flex flex-col overflow-hidden w-full;
}

.label {
  @apply font-bold block;
}

.info {
  @apply text-gray-500;
}

.info.inactive {
  @apply text-gray;
}

.help {
  @apply text-center flex flex-col w-full m-auto border-t-2 space-y-2;
}

.help .label {
  @apply mb-2 mt-4;
}

.product a, .link {
  @apply text-green cursor-pointer hover:text-green-600 hover:underline;
}


@screen lg {
  .products {
    @apply flex-row space-x-4 space-y-0;
  }

  .product {
    @apply w-1/2;
  }
}

.product {
  @apply grid gap-y-4;
  @apply flex-col;
}

.product.active {
  @apply border-2;
  border-color: #0ecc5f;
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
  @apply flex flex-col ml-2;
}
</style>
