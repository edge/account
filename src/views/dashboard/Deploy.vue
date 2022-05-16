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
          :calculatedCost=calculatedCost
          @specs-changed="(spec) => updateSpec(spec)"
        />
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
        <ServerName @name-changed="hostname => updateHostname(hostname)" />
        <span class="flex-1 order-1 text-red md:order-2" v-if="serverErrors.hostname">{{ serverErrors.hostname }}</span>
        <div class="flex flex-col">
          <span
            v-for="error in v$.serverOptions.settings.hostname.$errors"
            :key="error.$uid"
            class="flex-1 order-1 text-red md:order-2"
          >
            - {{ error.$message }}
          </span>
        </div>

        <Domain :hostname="serverOptions.settings.hostname" />
        <span class="flex-1 order-1 text-red md:order-2" v-if="serverErrors.domain">{{ serverErrors.domain }}</span>
      </div>

      <!-- password -->
      <div class="box">
        <Password @password-changed="password => updatePassword(password)" />
        <span class="flex-1 order-1 text-red md:order-2" v-if="serverErrors.password">{{ serverErrors.password }}</span>
        <div class="flex flex-col">
          <span
            v-for="error in v$.serverOptions.settings.password.$errors"
            :key="error.$uid"
            class="mt-2 flex-1 order-1 text-red md:order-2"
          >
            - {{ error.$message }}
          </span>
        </div>
      </div>

      <!-- deploy button & error message -->
      <div class="flex flex-col w-full md:space-x-5 md:items-center md:flex-row">
        <button
          @click.prevent="deploy"
          :disabled="!canDeploy"
          class="order-2 w-full mt-3 md:max-w-xs md:mt-0 button button--success md:order-1"
        >
          <span v-if="isSaving">Deploying</span>
          <span v-else>Deploy</span>
          <span v-if="isSaving"><LoadingSpinner /></span>
        </button>
      </div>
    </form>
  </div>
</template>

<script>
/* global process */

import * as utils from '../../account-utils'
import * as validation from '../../utils/validation'
import Domain from '@/components/deploy/Domain'
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
  components: {
    Domain,
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
      isSaving: false,
      selectedRegion: null,
      serverErrors: {},
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
    ...mapState(['account', 'session']),
    calculatedCost() {
      if (!this.selectedRegion) return 0
      const { ram, disk, cpus } = this.selectedRegion.cost
      const calculatedCost =
      (ram * this.serverOptions.spec.ram / 1024) +
      (disk * this.serverOptions.spec.disk / 1024) +
      (cpus * this.serverOptions.spec.cpus)
      return calculatedCost
    },
    canDeploy() {
      return !this.v$.serverOptions.$invalid || this.isSaving
    }
  },
  methods: {
    async deploy() {
      this.isSaving = true
      try {
        const server = await utils.servers.createServer(
          process.env.VUE_APP_ACCOUNT_API_URL,
          this.session._key,
          this.account._key,
          this.serverOptions
        )
        this.isSaving = false
        // Redirect to the new server page.
        this.$router.push({ name: 'Server', params: { id: server._key }})
      }
      catch (error) {
        console.error(error)
        console.log(error.response)
        this.isSaving = false
      }
    },
    toggleBackups () {
      // this.selectServerProperty({ property: 'enableBackups', value: !this.$store.state.enableBackups })
    },
    updateHostname(hostname) {
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
    },
    validate(inputType, value) {
      const regex = this.validationRules[inputType]

      if (!regex) {
        return true
      }
      else {
        return regex.test(value)

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
  .box--error {
    @apply ring-2 ring-red ring-opacity-50;
  }
  .box__grid {
    @apply mt-6 w-full grid grid-cols-1 gap-4;
    @apply sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3;
  }
</style>
