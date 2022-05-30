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
        <p class="mt-3 text-gray-500">Cras justo odio, dapibus ac facilisis in, egestas eget quam.</p>
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

      <!-- host name / server name -->
      <div class="box">
        <ServerName @name-changed="hostname => updateHostname(hostname)" />
        <div v-if="hostnameUpdated" class="flex flex-col">
          <span
            v-for="error in v$.serverOptions.settings.hostname.$errors"
            :key="error.$uid"
            class="mt-2 text-red"
          >
            - {{ error.$message }}
          </span>
        </div>

        <Domain :hostname="serverOptions.settings.hostname" />
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
            - {{ error.$message }}
          </span>
        </div>
      </div>

      <!-- deploy button & error message -->
      <div class="flex flex-col w-full space-y-2">
        <button
          @click.prevent="deploy"
          :disabled="!canDeploy"
          class="w-full mt-3 md:max-w-xs md:mt-0 button button--success"
        >
          <div v-if=isSaving class="flex">
            <span>Deploying</span>
            <span><LoadingSpinner /></span>
          </div>
          <span v-else>Deploy</span>
        </button>
        <!-- http error -->
        <div v-if="serverError" class="flex items-center">
          <ExclamationIcon class="w-5 mr-2 text-red" />
          <span class="text-red">{{ serverError }}</span>
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
import { ExclamationIcon } from '@heroicons/vue/outline'
import LoadingSpinner from '@/components/icons/LoadingSpinner'
import NetworkRegion from '@/components/deploy/NetworkRegion'
import OperatingSystem from '@/components/deploy/OperatingSystem'
import Password from '@/components/deploy/Password'
import ServerName from '@/components/deploy/ServerName'
import ServerSpecs from '@/components/deploy/ServerSpecs'
// import Toggle from '@vueform/toggle'
import { mapState } from 'vuex'
import useVuelidate from '@vuelidate/core'

export default {
  name: 'Deploy',
  title() {
    return 'Edge Account Portal » Deploy a new server'
  },
  props: ['region'],
  components: {
    Domain,
    ExclamationIcon,
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
      hostnameUpdated: false,
      isSaving: false,
      selectedRegion: null,
      serverError: '',
      serverOptions: {
        region: null,
        settings: {
          hostname: '',
          domain: '',
          os: {
            id: null
          },
          password: ''
        },
        spec: {
          bandwith: 10,
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
          hostname: [
            validation.hostnameLength,
            validation.hostnameChars,
            validation.hostnameFirstChar
          ],
          os: {
            id: [validation.required]
          },
          password: [validation.serverPassword]
        },
        spec: {
          cpus: [validation.required],
          disk: [validation.required],
          ram: [validation.required]
        },
        $autoDirty: true
      }
    }
  },
  computed: {
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
      return !this.v$.serverOptions.$invalid || this.isSaving || this.deploying
    },
    deploying() {
      return this.tasks.some(task => task.action === 'create')
    }
  },
  methods: {
    async deploy() {
      this.isSaving = true
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
        this.isSaving = false
      }
      catch (error) {
        setTimeout(() => {
          this.serverError = this.formatHttpError(error)
          this.isSaving = false
        }, 500)
      }
    },
    formatHttpError(error) {
      const body = error.response.body
      let field = ''
      let message = ''
      if (body.param) {
        if (body.param === 'region') field = 'Region'
        if (body.param === 'spec.cpus') field = 'vCPU'
        if (body.param === 'spec.disk') field = 'Disk'
        if (body.param === 'spec.ram') field = 'RAM'
        if (body.param === 'settings.os') field = 'Operating System'
        if (body.param === 'settings.hostname') field = 'Hostname'
        if (body.param === 'settings.domain') field = 'Domain'
      }
      if (['Disk', 'RAM'].includes(field)) message = this.formatMiBInError(body.reason)
      else message = body.reason || body.message
      return `${field ? `${field}: ` : ''}${message}`
    },
    formatMiBInError(errorMessage) {
      const MiB = errorMessage.replace(/^\D+/g, '')
      const GB =  MiB ? `${MiB / 1024} GB` : ''
      return errorMessage.replace(MiB, GB)
    },
    // toggleBackups () {
    //   this.selectServerProperty({ property: 'enableBackups', value: !this.$store.state.enableBackups })
    // },
    updateHostname(hostname) {
      this.hostnameUpdated = true
      this.serverOptions = {
        ...this.serverOptions,
        settings: {
          ...this.serverOptions.settings,
          hostname,
          domain: `${hostname}.edge.network`
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
</style>
