<template>
  <RadioGroup v-model="selectedOS">
    <RadioGroupLabel class="sr-only">OperatingSystem</RadioGroupLabel>

    <!-- <div v-if="osList === undefined">Loading...</div> -->

    <div class="box__grid">
      <RadioGroupOption
        as="template"
        v-for="(versions, os) in osList"
        :key="os"
        :value="os"
        v-slot="{ active, checked, disabled }"
      >
        <div
          :class="[
            active ? 'active' : '',
            checked ? 'checked' : '',
            disabled ? 'disabled' : ''
          ]"
          class="radioOption"
        >
          <div class="flex flex-col items-center w-full">
            <RadioGroupLabel
              as="div"
              class="optionTitle"
              :class="[
                active ? 'active' : '',
                checked ? 'checked' : '',
                disabled ? 'disabled' : ''
              ]"
            >
              <h4>{{ formatOsName(os) }}</h4>
            </RadioGroupLabel>
            <div class="w-full mt-2">
              <OperatingSystemOptions
                :versions=versions
                @os-changed="emitSelectedOsVersion"
              />
            </div>
          </div>
        </div>
      </RadioGroupOption>
    </div>
  </RadioGroup>
</template>

<script>
/* global process */

import * as utils from '../../account-utils/index'
import OperatingSystemOptions from '@/components/deploy/OperatingSystemOptions'
import { mapState } from 'vuex'
import {
  RadioGroup,
  RadioGroupLabel,
  RadioGroupOption
} from '@headlessui/vue'

export default {
  name: 'OperatingSystem',
  components: {
    RadioGroup,
    RadioGroupLabel,
    RadioGroupOption,
    OperatingSystemOptions
  },
  data() {
    return {
      os: null,
      osVersionList: [],
      osList: {},
      selectedOS: null,
      selectedVersion: {}
    }
  },
  computed: {
    ...mapState(['session']),
    ubuntuList() {
      return this.osList.filter(os => os.group === 'ubuntu')
    },
    centosList() {
      return this.osList.filter(os => os.group === 'centos')
    }
  },
  methods: {
    formatOsName(os) {
      return os.slice(0,1).toUpperCase() + os.slice(1)
    },
    async updateOS() {
      try {
        const os = await utils.os.getOS(
          process.env.VUE_APP_ACCOUNT_API_URL,
          this.session._key
        )
        this.osVersionList = os.results
        this.osList = os.results.reduce((o, d) => {
          if (!o[d.group]) {
            o[d.group] = []
            this.selectedVersion[d.group] = null
          }
          if (!this.selectedVersion[d.group]) this.selectedVersion[d.group] = d.id
          o[d.group].push(d)
          return o
        }, {})
        this.selectedOS = 'centos'
      }
      catch (error) {
        // TODO - handle error
        console.error(error)
      }
    },
    emitSelectedOsVersion(versionId) {
      this.selectedVersion[this.selectedOS] = versionId
      this.$emit('os-changed', versionId)
    }
  },
  mounted() {
    this.updateOS()
  },
  watch: {
    selectedOS(os) {
      this.$emit('os-changed', this.selectedVersion[os])
    }
  }
}
</script>

<style scoped>
  .box__grid {
    @apply mt-6 w-full grid grid-cols-1 gap-4;
    @apply sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3;
  }

  /* radio option */
  .radioOption {
    @apply relative flex space-x-3 items-start p-5 border border-gray-300 rounded-md cursor-pointer;
    @apply hover:bg-gray-100 hover:bg-opacity-50;
    @apply focus:outline-none;
  }
  .radioOption.active {
    @apply border-green border-opacity-40;
  }
  .radioOption.checked {
    @apply bg-gray-100 border-green bg-opacity-75;
    @apply ring-4 ring-green ring-opacity-10;
  }
  .radioOption.disabled {
    @apply cursor-not-allowed opacity-50;
  }

  /* option title */
  .optionTitle {
    @apply text-center w-full;
  }
  .optionTitle.active {

  }
  .optionTitle.checked {

  }

  /* option specs */
  .optionSpecs {
    @apply flex flex-col items-center w-full mt-4 text-sm text-gray-500;
  }
</style>
