<template>
  <div class="flex w-full">
    <SideNavigation />
    <main class="mainContent">
      <TopNavigation />
      <div class="mainContent__inner">
        <h1>Deploy a new server</h1>

        <div class="grid items-start grid-cols-12 mt-5 space-x-10 lg:mt-5">
          <form class="flex flex-col col-span-12 pb-20 space-y-5">
            
            <!-- network region -->
            <div class="box">
              <h4>Network region</h4>
              <NetworkRegion @region-changed="value => storeSelection('cluster', value)" />
            </div>

            <!-- operating system -->
            <div class="box">
              <h4>Operating System</h4>
              <OperatingSystem @os-changed="value => storeSelection('os', value)" />
            </div>

            <!-- size -->
            <div class="box">
              <h4>Server specs</h4>
              <p class="mt-3 text-gray-500">Cras justo odio, dapibus ac facilisis in, egestas eget quam.</p>
              <ServerSpecs :calculatedCost=calculatedCost @specs-changed="value => storeSelection('specs', value)" />
              <span class="flex-1 order-1 text-red md:order-2" v-if="serverErrors.preset">{{serverErrors.preset}}</span>
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

            <!-- host name / server name -->
            <div class="box">
              <ServerName @name-changed="value => storeSelection('hostname', value)" />
              <span class="flex-1 order-1 text-red md:order-2" v-if="serverErrors.hostname">{{serverErrors.hostname}}</span>

              <Domain :hostname="serverSettings.hostname" @name-changed="value => storeSelection('domain', value)" />
              <span class="flex-1 order-1 text-red md:order-2" v-if="serverErrors.domain">{{serverErrors.domain}}</span>
            </div>

            <!-- password -->
            <div class="box">
              <Password @password-changed="value => storeSelection('password', value)" />
              <span class="flex-1 order-1 text-red md:order-2" v-if="serverErrors.password">{{serverErrors.password}}</span>
            </div>

            <!-- submit & error message -->
            <div class="flex flex-col w-full md:space-x-5 md:items-center md:flex-row">
              <button
                @click.prevent="deploy"
                :disabled="!isFormSubmittable()"
                class="order-2 w-full mt-3 md:max-w-xs md:mt-0 button button--success md:order-1"
              >
                <span v-if="isSaving">Deploying</span>
                <span v-else>Deploy</span>
                <span v-if="isSaving">
                  <svg class="w-4 ml-2 animate-spin" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                    <line x1="12" y1="6" x2="12" y2="3" />
                    <line x1="16.25" y1="7.75" x2="18.4" y2="5.6" />
                    <line x1="18" y1="12" x2="21" y2="12" />
                    <line x1="16.25" y1="16.25" x2="18.4" y2="18.4" />
                    <line x1="12" y1="18" x2="12" y2="21" />
                    <line x1="7.75" y1="16.25" x2="5.6" y2="18.4" />
                    <line x1="6" y1="12" x2="3" y2="12" />
                    <line x1="7.75" y1="7.75" x2="5.6" y2="5.6" />
                  </svg>
                </span>
              </button>
            </div>
          </form>

        </div>
      </div>
    </main>
  </div>
</template>

<script>
import Domain from '@/components/deploy/Domain'
import NetworkRegion from '@/components/deploy/NetworkRegion'
import OperatingSystem from '@/components/deploy/OperatingSystem'
import Password from '@/components/deploy/Password'
import ServerSpecs from '@/components/deploy/ServerSpecs'
import ServerName from '@/components/deploy/ServerName'
import SideNavigation from "@/components/SideNavigation"
import Toggle from '@vueform/toggle'
import TopNavigation from "@/components/TopNavigation"
import { mapGetters, mapActions } from 'vuex'
import { createHost } from '../utils/api'

export default {
  name: 'Deploy',
  title() {
    return 'Edge Account Portal » Deploy a new server'
  },
  components: {
    Domain,
    NetworkRegion,
    OperatingSystem,
    Password,
    ServerName,
    ServerSpecs,
    SideNavigation,
    Toggle,
    TopNavigation,
  },
  data() {
    return {
      isSaving: false,
      required: [
        'cluster',
        'hostname',
        'domain',
        'password',
        'cpu',
        'ram',
        'ssd',
        'os',
      ],
      calculatedCost: 0,
      selectedRegion: null,
      validationRules: {
        domain: /^.{6,255}$/,
        password: /^.{6,35}$/,
        hostname: /^[a-zA-Z0-9]{1}[a-zA-Z0-9-_\.]{1,48}$/
      },
      validationMessages: {
        domain: 'Maximum length is 255 characters',
        password: 'Password must be between 6 and 35 characters',
        hostname: 'Hostname must contain only alphanumeric characters, underscores, and hyphens. The first character must be alphanumeric. Maximum length is 49.'
      }
    }
  },
  computed: {
    ...mapGetters({
      serverErrors: 'StateErrors',
      serverSettings: 'StateSettings',
      user: 'auth/StateUser'
    })
  },
  methods: {
    ...mapActions(['clear', 'setServerError', 'setServerProperty']),
    calculateCost() {
      if (this.selectedRegion) {
        const { ramCostPerGb, ssdCostPerGb, cpuCostPer } = this.selectedRegion

        this.calculatedCost = 
          (ramCostPerGb * this.serverSettings.ram / 1024) +
          (ssdCostPerGb * this.serverSettings.ssd / 1024) +
          (cpuCostPer * this.serverSettings.cpu)
      }
    },
    async deploy() {
      this.isSaving = true

      const newHost = await createHost(this.user, this.serverSettings)

      // Redirect to the new server page.
      const { serverId } = newHost
      this.$router.push({ name: 'Server', params: { id: serverId } })
    },
    isFormSubmittable() {
      return !this.isSaving && this.required.every(key => {
        return this.serverSettings[key] !== null
      })
    },
    toggleBackups () {
      // this.selectServerProperty({ property: 'enableBackups', value: !this.$store.state.enableBackups })
    },
    storeSelection(inputType, value) {
      if (this.validate(inputType, value)) {
        if (inputType === 'cluster') {
          this.selectedRegion = value
          value = value.clusterId
        }

        if (inputType === 'specs') {
          inputType = value.spec
          value = parseInt(value.value)
        }

        this.setServerProperty({ property: inputType, value: value.id || value })
        this.setServerError({ property: inputType, value: '' })

        this.calculateCost()
      } else {
        this.setServerError({ property: inputType, value: this.validationMessages[inputType] })
      }
    },
    validate(inputType, value) {
      const regex = this.validationRules[inputType]

      if (!regex) {        
        return true
      } else {      
        return regex.test(value)

      }
    }
  },
  mounted() {
    // Clear the server settings.
    this.clear()
  }
}
</script>
<style src="@vueform/toggle/themes/default.css"></style>
<style scoped>
  .mainContent {
    @apply relative flex-1;
  }
  .mainContent__inner {
    @apply p-3 md:p-5 lg:p-8 mt-7;
  }
  .box {
    @apply w-full p-6 bg-white rounded-lg;
  }
  .box--error {
    @apply ring-2 ring-red ring-opacity-50;
  }
  .box__grid {
    @apply mt-6 w-full grid grid-cols-1 gap-4;
    @apply sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3;
  }
</style>
