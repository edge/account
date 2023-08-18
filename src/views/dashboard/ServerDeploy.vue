<template>
  <div class="mainContent__inner">
    <h1>Deploy a new server</h1>
    <form class="flex flex-col col-span-12 pb-20 space-y-4">
      <!-- balance warning -->
      <div v-if="balanceSuspend || balanceWarning" class="box flex space-x-2">
        <div><ExclamationIcon class="w-5 text-red" /></div>
        <span class="text-red">Deployments are disabled while your balance is below ${{ balance.threshold.warning.usd }}. Please add funds or set up Pay by Credit Card to deploy new services.</span>
      </div>

      <!-- network region -->
      <div class="box">
        <h4>Network region</h4>
        <NetworkRegion
          :disableControls=disableControls
          @region-changed="updateRegion"
          ref="networkRegion"
        />
      </div>

      <!-- operating system -->
      <div class="box">
        <h4>Operating System</h4>
        <OperatingSystem
          :disableControls=disableControls
          @os-changed="updateOS"
        />
      </div>

      <!-- server specs - cpu / ram / storage -->
      <div class="box">
        <h4>Server specs</h4>
        <ServerSpecs
          :disableControls=disableControls
          v-if="selectedRegion"
          :hourlyCost=hourlyCost
          :region=selectedRegion
          @specs-changed="updateSpec"
        />
      </div>

      <!-- automated backups -->
      <!-- <div class="box">
        <div @click="toggleBackups" class="flex items-center justify-between w-full cursor-pointer">
          <h4>Automated Backups</h4>
          <Toggle
            v-model="enableBackups"
            :classes="{
              toggleOn: 'bg-green border-green'
            }"
          />
        </div>
      </div> -->

      <!-- server name -->
      <div class="box">
        <ServerName
          :disableControls=disableControls
          @name-changed="updateServerName"
          :hostname=hostname
          :isRegionDisabled="isRegionDisabled"
        />
        <ValidationError v-if="serverNameUpdated" :errors="v$.serverOptions.settings.name.$errors" />

        <Domain
          :disableControls=disableControls
          @domain-changed="updateDomain"
          :hostname="hostname"
          :isRegionDisabled="isRegionDisabled"
        />
        <ValidationError v-if="serverDomainUpdated" :errors="v$.serverOptions.settings.domain.$errors" />
      </div>

      <!-- password -->
      <div class="box">
        <Password
          :disableControls=disableControls
          @password-changed="updatePassword"
          :isRegionDisabled="isRegionDisabled"
        />
        <ValidationError :errors="v$.serverOptions.settings.password.$errors" />
      </div>

      <!-- deploy button & error message -->
      <div class="flex flex-col w-full space-y-2">
        <button
          @click.prevent="deploy"
          :disabled="!canDeploy"
          class="button button--success self-end w-full md:max-w-xs"
        >
          <div v-if=isLoading class="flex">
            <span>Deploying</span>
            <span class="ml-2"><LoadingSpinner /></span>
          </div>
          <span v-else>Deploy</span>
        </button>

        <div class="flex md:justify-end mt-2"><HttpError :error=httpError /></div>
        <div v-if=internalServerError class="server__error" :class="overCapacityError && 'over-capacity'">
          <span class="font-bold">{{
            overCapacityError
            ? "We're over capacity"
            : "Something went wrong"
          }}</span>
          <span>
            {{
              overCapacityError
              ? "It appears that we are at capacity in this region. We're working hard to increase this. Please check back soon."
              : "There was an issue while deploying this server. Please try again, or contact support@edge.network if the issue persists."
            }}
          </span>
        </div>
      </div>
    </form>
  </div>
</template>

<script>
/* global process */

import * as api from '@/account-utils'
import * as validation from '@/utils/validation'
import Domain from '@/components/server/deploy/Domain'
import { ExclamationIcon } from '@heroicons/vue/outline'
import HttpError from '@/components/HttpError'
import LoadingSpinner from '@/components/icons/LoadingSpinner'
import NetworkRegion from '@/components/server/deploy/NetworkRegion'
import OperatingSystem from '@/components/server/deploy/OperatingSystem'
import Password from '@/components/server/deploy/Password'
import ServerName from '@/components/server/deploy/ServerName'
import ServerSpecs from '@/components/server/deploy/ServerSpecs'
import ValidationError from '@/components/ValidationError.vue'
import useVuelidate from '@vuelidate/core'
import { mapGetters, mapState } from 'vuex'


export default {
  name: 'ServerDeploy',
  title() {
    return 'Edge Account Portal » Deploy a new server'
  },
  components: {
    Domain,
    ExclamationIcon,
    HttpError,
    LoadingSpinner,
    NetworkRegion,
    OperatingSystem,
    Password,
    ServerName,
    ServerSpecs,
    ValidationError
  },
  data() {
    return {
      areSpecsValid: true,
      hostname: null,
      httpError: '',
      isLoading: false,
      internalServerError: null,
      selectedRegion: null,
      serverDomainUpdated: false,
      serverNameUpdated: false,
      serverOptions: {
        region: null,
        settings: {
          name: '',
          domain: '',
          os: {
            id: null
          },
          password: ''
        },
        spec: {
          bandwith: null,
          cpus: null,
          disk: null,
          ram: null
        }
      }
    }
  },
  validations() {
    return {
      serverOptions: {
        region: [validation.required],
        settings: {
          name: [
            validation.serverNameLength,
            validation.serverNameChars,
            validation.serverNameFirstChar
          ],
          domain: [validation.domain],
          os: {
            id: [validation.required]
          },
          password: [validation.serverPassword]
        },
        spec: {
          bandwidth: [validation.required],
          cpus: [validation.required],
          disk: [validation.required],
          ram: [validation.required]
        },
        $autoDirty: true
      }
    }
  },
  computed: {
    ...mapGetters(['balanceSuspend', 'balanceWarning']),
    ...mapState(['account', 'balance', 'session', 'tasks']),
    disableControls() {
      return this.balanceWarning || this.balanceSuspend || this.isRegionDisabled
    },
    hourlyCost() {
      if (!this.selectedRegion) return 0
      const { bandwidth, cpus, disk, ram } = this.selectedRegion.cost
      const hourlyCost = (bandwidth * (this.serverOptions.spec.bandwidth || 10))
        + (cpus * this.serverOptions.spec.cpus)
        + (disk * this.serverOptions.spec.disk)
        + (ram * this.serverOptions.spec.ram)
      return hourlyCost
    },
    canDeploy() {
      return !this.v$.serverOptions.$invalid &&
        !this.isLoading &&
        !this.balanceWarning &&
        !this.balanceSuspend &&
        !this.isRegionDisabled &&
        this.areSpecsValid
    },
    isRegionDisabled() {
      if (!this.selectedRegion) return false
      const capacity = this.selectedRegion.capacity
      const usage = this.selectedRegion.usage || {}
      for (const spec in capacity) {
        if (spec !== 'bandwidth' && usage[spec] >= capacity[spec]) return true
      }
      return !this.selectedRegion.active
    },
    overCapacityError() {
      return this.internalServerError && this.internalServerError.response.body.detail === 'there is no suitable node in cluster'
    }
  },
  methods: {
    async deploy() {
      this.isLoading = true
      this.httpError = null
      this.internalServerError = null
      try {
        const { server, task } = await api.servers.createServer(
          process.env.VUE_APP_ACCOUNT_API_URL,
          this.session._key,
          this.account._key,
          this.serverOptions
        )
        // add task to store and redirect to server page
        this.$store.commit('addTask', task)
        this.$router.push({ name: 'Server', params: { id: server._key }})
        this.isLoading = false
      }
      catch (error) {
        setTimeout(() => {
          if (error.status === 500) this.internalServerError = error
          else this.httpError = error
          this.isLoading = false
        }, 500)
      }
    },
    formatMiB(MiB) {
      if (MiB < 1024) {
        return `${MiB} MiB`
      }
      return `${MiB / 1024} GiB`
    },
    getMaxAvailableSpec(spec) {
      return this.selectedRegion.capacity[spec] - (this.selectedRegion.usage && this.selectedRegion.usage[spec] || 0)
    },
    async getHostname() {
      const { hostname } = await api.servers.getHostname(
        process.env.VUE_APP_ACCOUNT_API_URL,
        this.session._key
      )
      this.hostname = hostname
      this.updateServerName(hostname)
    },
    // toggleBackups () {
    //   this.selectServerProperty({ property: 'enableBackups', value: !this.$store.state.enableBackups })
    // },
    updateDomain(domain) {
      this.serverDomainUpdated = true
      this.serverOptions = {
        ...this.serverOptions,
        settings: {
          ...this.serverOptions.settings,
          domain
        }
      }
    },
    updateServerName(name) {
      this.serverNameUpdated = true
      this.serverOptions = {
        ...this.serverOptions,
        settings: {
          ...this.serverOptions.settings,
          name
        }
      }
    },
    updateOS(os) {
      this.serverOptions = {
        ...this.serverOptions,
        settings: {
          ...this.serverOptions.settings,
          os: {
            id: os
          }
        }
      }
    },
    updatePassword(password) {
      this.serverOptions = {
        ...this.serverOptions,
        settings: {
          ...this.serverOptions.settings,
          password
        }
      }
    },
    updateRegion(region) {
      this.selectedRegion = region
      this.serverOptions = {
        ...this.serverOptions,
        region: region._key
      }
    },
    updateSpec(spec, areValid) {
      this.areSpecsValid = areValid
      this.serverOptions = {
        ...this.serverOptions,
        spec
      }
    }
  },
  mounted() {
    this.getHostname()
  },
  setup() {
    return {
      v$: useVuelidate()
    }
  },
  watch: {
    httpError() {
      this.$refs.networkRegion.updateRegions()
    },
    internalServerError() {
      this.$refs.networkRegion.updateRegions()
    }
  }
}
</script>

<style src="@vueform/toggle/themes/default.css"></style>

<style scoped>
.server__error {
  @apply flex flex-col bg-red text-white p-4 w-full rounded space-y-1;
}

.server__error.over-capacity {
  @apply bg-blue-100 text-black;
}
</style>
