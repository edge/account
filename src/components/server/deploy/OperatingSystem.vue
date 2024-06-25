<template>
  <RadioGroup v-model="selectedOS">
    <RadioGroupLabel class="sr-only">OperatingSystem</RadioGroupLabel>

    <!-- <div v-if="osList === undefined">Loading...</div> -->

    <div class="box__grid">
      <RadioGroupOption
        as="template"
        v-for="(versions, os) in osList"
        :disabled=disableControls
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
              <h4 class="capitalize">{{ formatOsName(os) }}</h4>
            </RadioGroupLabel>
            <div class="w-full mt-2">
              <OperatingSystemOptions
                :disableControls=disableControls
                :disabled=disableControls
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

import * as utils from '@edge/account-utils'
import OperatingSystemOptions from '@/components/server/deploy/OperatingSystemOptions'
import { mapState } from 'vuex'
import {
  RadioGroup,
  RadioGroupLabel,
  RadioGroupOption
} from '@headlessui/vue'

export default {
  name: 'OperatingSystem',
  props: ['disableControls'],
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
    ...mapState(['session'])
  },
  methods: {
    formatOsName(os) {
      return os === 'centos' ? 'CentOS' : os
    },
    async updateOS() {
      try {
        const { results } = await utils.getOperatingSystems(process.env.VUE_APP_ACCOUNT_API_URL, this.session._key)
        this.osVersionList = results
        this.osList = results.reduce((o, d) => {
          if (!d.active) return
          if (!o[d.group]) {
            o[d.group] = []
            this.selectedVersion[d.group] = null
          }
          // set default selected version (last of each group)
          this.selectedVersion[d.group] = d.id
          o[d.group].unshift(d)
          return o
        }, {})
        this.selectedOS = results[0].group
      }
      catch (error) {
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
    @apply sm:grid-cols-1 lg:grid-cols-3;
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
