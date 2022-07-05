<template>
  <div class="mainContent__inner">
    <h1>Deploy a new server</h1>
    <form class="flex flex-col col-span-12 pb-20 space-y-5">
      <!-- network region -->
      <div class="box">
        <h4>Network region</h4>
        <NetworkRegion @region-changed="region => updateRegion(region)" />
      </div>

      <!-- operating system -->
      <div class="box">
        <h4>Operating System</h4>
        <OperatingSystem @os-changed="osId => updateOS(osId)" />
      </div>

      <!-- server specs - cpu / ram / storage -->
      <div class="box">
        <h4>Server specs</h4>
        <ServerSpecs
          :hourlyCost=hourlyCost
          @specs-changed="(spec) => updateSpec(spec)"
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
        <ServerName @name-changed="serverName => updateServerName(serverName)" :hostname=hostname />
        <div v-if="serverNameUpdated" class="flex flex-col">
          <span
            v-for="error in v$.serverOptions.settings.name.$errors"
            :key="error.$uid"
            class="mt-2 text-red"
          >
            {{ error.$message }}
          </span>
        </div>

        <Domain @domain-changed="domain => updateDomain(domain)" :hostname="hostname" />
        <div v-if="serverDomainUpdated" class="flex flex-col">
          <span
            v-for="error in v$.serverOptions.settings.domain.$errors"
            :key="error.$uid"
            class="mt-2 text-red"
          >
            {{ error.$message }}
          </span>
        </div>
      </div>

      <!-- password -->
      <div class="box">
        <Password @password-changed="password => updatePassword(password)" />
        <div class="flex flex-col">
          <span
            v-for="error in v$.serverOptions.settings.password.$errors"
            :key="error.$uid"
            class="mt-2 text-red"
          >
            {{ error.$message }}
          </span>
        </div>
      </div>

      <!-- deploy button & error message -->
      <div class="flex flex-col w-full space-y-2">
        <button
          @click.prevent="deploy"
          :disabled="!canDeploy"
          class="button button--success w-full md:max-w-xs"
        >
          <div v-if=isLoading class="flex">
            <span>Deploying</span>
            <span class="ml-2"><LoadingSpinner /></span>
          </div>
          <span v-else>Deploy</span>
        </button>

        <HttpError :error=httpError />
        <!-- <div class="server__error">
          <span>Something went wrong</span>
          <span>There was an issue while deplying this server.</span>
        </div> -->

        <div v-if="invalidSpecs.length" class="mt-2 text-red flex flex-col">
          <span v-if="!invalidSpecs.includes('servers')">This region doesn't have capacity for your new server.</span>
          <span v-for="invalidSpec in invalidSpecs" :key="invalidSpec">
            {{ formatRegionLimitError(invalidSpec) }}
          </span>
        </div>
      </div>
    </form>
  </div>
</template>

<script>
/* global process */

import * as utils from '../../account-utils'
import * as validation from '../../utils/validation'
import Domain from '@/components/deploy/Domain'
import HttpError from '@/components/HttpError'
import LoadingSpinner from '@/components/icons/LoadingSpinner'
import NetworkRegion from '@/components/deploy/NetworkRegion'
import OperatingSystem from '@/components/deploy/OperatingSystem'
import Password from '@/components/deploy/Password'
import ServerName from '@/components/deploy/ServerName'
import ServerSpecs from '@/components/deploy/ServerSpecs'
// import Toggle from '@vueform/toggle'
import useVuelidate from '@vuelidate/core'
import { mapGetters, mapState } from 'vuex'


export default {
  name: 'Deploy',
  title() {
    return 'Edge Account Portal » Deploy a new server'
  },
  components: {
    Domain,
    HttpError,
    LoadingSpinner,
    NetworkRegion,
    OperatingSystem,
    Password,
    ServerName,
    ServerSpecs
    // Toggle
  },
  data() {
    return {
      serverDomainUpdated: false,
      serverNameUpdated: false,
      hostname: null,
      httpError: '',
      isLoading: false,
      selectedRegion: null,
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
    ...mapState(['account', 'session', 'tasks']),
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
        !this.invalidSpecs.length
    },
    invalidSpecs() {
      if (!this.selectedRegion) return []
      const capacity = this.selectedRegion.capacity
      const usage = this.selectedRegion.usage
      const newServer = this.serverOptions.spec

      if (usage.servers >= capacity.servers) return ['servers']

      return ['cpus', 'disk', 'ram'].filter(spec => newServer[spec] + usage[spec] > capacity[spec])
    }
  },
  methods: {
    async deploy() {
      this.isLoading = true
      try {
        const response = await utils.servers.createServer(
          process.env.VUE_APP_ACCOUNT_API_URL,
          this.session._key,
          this.account._key,
          this.serverOptions
        )
        // add task to store and redirect to server page
        this.$store.commit('addTask', response.task)
        this.$router.push({ name: 'Server', params: { id: response.server._key }})
        this.isLoading = false
      }
      catch (error) {
        setTimeout(() => {
          this.httpError = error
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
    getAvailableSpec(spec) {
      return this.selectedRegion.capacity[spec] - this.selectedRegion.usage[spec]
    },
    formatRegionLimitError(spec) {
      if (spec === 'servers') return 'No more servers available in this region.'

      const specLookup = {
        'cpus': 'vCPU',
        'disk': 'Disk',
        'ram': 'RAM'
      }

      let requestedAmount = this.serverOptions.spec[spec]
      let availableAmount = this.getAvailableSpec(spec)
      if (availableAmount < 0) availableAmount = 0

      if (spec === 'ram' || spec === 'disk') {
        requestedAmount = this.formatMiB(requestedAmount)
        availableAmount = this.formatMiB(availableAmount)
      }

      return `${specLookup[spec]}: ${requestedAmount} requested · ${availableAmount} available`
    },
    async getHostname() {
      const response = await utils.servers.getHostname(
        process.env.VUE_APP_ACCOUNT_API_URL,
        this.session._key
      )
      this.hostname = response.hostname
      this.updateServerName(response.hostname)
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
    updateSpec(spec) {
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
  }
}
</script>

<style src="@vueform/toggle/themes/default.css"></style>
<style scoped>
.box {
  @apply w-full p-6 bg-white rounded-lg;
}

.server__error {
  @apply bg-red text-white w-full h-20 rounded;
}
</style>
