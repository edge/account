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
              <NetworkRegion @region-changed="value => validate('cluster', value)" />
            </div>

            <!-- operating system -->
            <div class="box">
              <h4>Operating System</h4>
              <OperatingSystem @os-changed="value => validate('os', value)" />
            </div>

            <!-- size -->
            <div class="box">
              <h4>Server specs</h4>
              <ServerSpecs @specs-changed="value => validate('preset', value)" />
              <span class="flex-1 order-1 text-red md:order-2" v-if="errors.preset">{{errors.preset}}</span>
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
              <ServerName @name-changed="value => validate('hostname', value)" />
              <span class="flex-1 order-1 text-red md:order-2" v-if="errors.hostname">{{errors.hostname}}</span>

              <Domain @name-changed="value => validate('domain', value)" />
              <span class="flex-1 order-1 text-red md:order-2" v-if="errors.domain">{{errors.domain}}</span>
            </div>

            <!-- password -->
            <div class="box">
              <Password @password-changed="value => validate('password', value)" />
              <span class="flex-1 order-1 text-red md:order-2" v-if="errors.password">{{errors.password}}</span>
            </div>

            <!-- submit & error message -->
            <div class="flex flex-col w-full md:space-x-5 md:items-center md:flex-row">
              <button
                @click.prevent="deploy"
                :disabled="!settingsComplete || isSaving"
                class="order-2 w-full mt-3 md:mt-0 button button--success md:order-1"
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
      errors: {},
      required: [
        'cluster',
        'hostname',
        'password',
        'preset',
        'os',
      ],
      settings: {},
      settingsComplete: false,
      isSaving: false
    }
  },
  methods: {
    async deploy () {
      this.isSaving = true

      const newHost = await createHost(this.settings)

      // Redirect to the new server page.
      const { id } = newHost      
      this.$router.push({ name: 'Server', params: { slug: id } })
    },
    toggleBackups () {
      // this.selectServerProperty({ property: 'enableBackups', value: !this.$store.state.enableBackups })
    },
    validate(inputType, value) {
      const validationRules = {
        domain: /^.{6,35}$/,
        password: /^.{6,35}$/,
        hostname: /^[a-zA-Z0-9]{1}[a-zA-Z0-9-_\.]{1,48}$/
      }
     
      const validationMessages = {
        domain: 'Domain name',
        password: 'Password must be between 6 and 35 characters',
        hostname: 'Hostname must contain only alphanumeric characters, underscores, and hyphens. The first character must be alphanumeric. Maximum length is 49.'
      }

      const regex = validationRules[inputType]

      if (!regex) {
        this.settings[inputType] = value
        this.errors[inputType] = ''
      } else {      
        if (regex.test(value)) {
          this.settings[inputType] = value
          this.errors[inputType] = ''
        } else {
          this.errors[inputType] = validationMessages[inputType]
        }
      }

      this.enableIfValid()
    },
    enableIfValid() {
      this.settingsComplete = this.required.every(key => {
        return this.settings[key] !== undefined
      })
    }
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
