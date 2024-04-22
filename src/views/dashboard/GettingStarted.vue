<template>
  <div class="mainContent__inner">
    <div class="flex flex-col sm:flex-row justify-between">
      <h1>Getting Started</h1>
    </div>

    <div class="box">
      <div class="flex flex-col space-y-4 py-4">
        <div class="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 py-4">
          <div class="md:w-1/2 pr-4">
            <h2 class="text-2xl">Welcome to Edge</h2>
            <p class="mb-2">You're here! Thank you for being part of the future of the cloud.</p>
            <p>Now let's get started.</p>

            <!-- STEP 1: Payment -->
            <div class="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 py-4">
              <div>
                <div v-if="progress.payment" class="w-8 h-8 bg-edge-green rounded-full flex items-center justify-center">
                  <CheckIcon class="w-5 h-5 text-white" />
                </div>
                <div v-else class="w-8 h-8 rounded-full border-2 border-edge-green"></div>
              </div>
              <div>
                <p class="text-md mb-2">Add a Payment Method to Get Started</p>
                <p class="text-gray-800 mb-2">Link a payment method to deploy services.</p>
                <router-link :to="{ name: 'Payment Cards' }" class="button button--success button--small h-8 w-max flex-shrink-0">
                  Add a Payment Method
                </router-link>
              </div>
            </div>

            <!-- STEP 2: Deploy -->
            <div class="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 py-4">
              <div>
                <div v-if="progress.service" class="w-8 h-8 bg-edge-green rounded-full flex items-center justify-center">
                  <CheckIcon class="w-5 h-5 text-white" />
                </div>
                <div v-else class="w-8 h-8 rounded-full border-2 border-edge-green"></div>
              </div>
              <div>
                <p class="text-md mb-2">Deploy your first service</p>
                <p class="text-gray-800 mb-2">Launch your own CDN, add your domains, spin up a virtual machine or publish an Edge Page!</p>
                <div class="flex space-x-2">
                  <router-link to="/cdn/deploy" class="button button--success button--small h-8 w-max flex-shrink-0">
                    Deploy CDN
                  </router-link>
                  <router-link to="/domains" class="button button--success button--small h-8 w-max flex-shrink-0">
                    Deploy DNS
                  </router-link>
                  <router-link to="/servers/deploy" class="button button--success button--small h-8 w-max flex-shrink-0">
                    Deploy Server
                  </router-link>
                  <router-link to="/pages" class="button button--success button--small h-8 w-max flex-shrink-0">
                    Deploy Page
                  </router-link>
                </div>
              </div>
            </div>

          </div>
          <div class="md:w-1/2 space-y-4">
            <GuideCard
              icon="https://edge.network/assets/img/accounts/docs.svg"
              title="Launching an Edge Virtual Machine in two minutes"
              description="Get online quickly with our latest walkthrough."
              link="https://youtu.be/jqx99OLYWds"
              buttonText="Watch"
            />
            <GuideCard
              icon="https://edge.network/assets/img/accounts/vm.svg"
              title="Image manipulation at the edge of the network"
              description="Discover how to streamline your content with Edge CDN."
              link="https://edge.network/en/content-delivery/documentation/"
              buttonText="Read"
            />
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<style scoped>
.bg-edge-green {
  background-color: #0ecc5f;
}
.border-edge-green {
  border-color: #0ecc5f;
}
</style>

<script>
import CheckIcon from '@/components/icons/CheckIcon.vue'
import GuideCard from '@/components/getting-started/GuideCard.vue'
import { mapState } from 'vuex'

export default {
  name: 'GettingStarted',
  components: {
    CheckIcon,
    GuideCard
  },
  computed: {
    ...mapState(['account', 'progress'])
  }
}
</script>
