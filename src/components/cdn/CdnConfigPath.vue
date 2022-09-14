<template>
  <div>
    <div class="flex space-x-6 items-center">
      <!-- asset path -->
      <div class="input-group flex-1 path">
        <span class="text-md">{{ path }}</span>

        <!-- <input
          v-model="name"
          class="input input--floating"
          :disabled="isDisabledTBD"
          :class="isDisabledTBD ? 'disabled' : ''"
          placeholder="e.g. /photos/*.jpg"
          type="text"
          required
        /> -->
      </div>
      <!-- cache enabled -->
      <div class="input-group flex-1 cache">
        <span class="text-md"
          :class="cacheEnabledDisplay === 'Auto' ? 'text-gray-500' : ''"
        >
          {{ cacheEnabledDisplay }}
        </span>
        <!-- <Listbox v-model="cacheEnabled">
          <div class="relative w-full mt-1">
            <ListboxButton class="listButton input--floating">
              <span class="block truncate">{{ cacheEnabled ? 'Yes' : 'No' }}</span>
              <span class="listButton__icon">
                <ChevronDownIcon class="w-5 h-5" aria-hidden="true" />
              </span>
            </ListboxButton>
            <transition
              leave-active-class="transition duration-100 ease-in"
              leave-from-class="opacity-100"
              leave-to-class="opacity-0"
            >
              <ListboxOptions class="listOptions">
                <ListboxOption v-slot="{ active, selected }" :value="true" as="template">
                  <li :class="[active ? 'active' : '']" class="listOption">
                    <span :class="['block truncate']">Yes</span>
                    <span v-if="selected" class="checkmark" >
                      <CheckIcon class="w-5 h-5" aria-hidden="true" />
                    </span>
                  </li>
                </ListboxOption>
                <ListboxOption v-slot="{ active, selected }" :value="false" as="template">
                  <li :class="[active ? 'active' : '']" class="listOption">
                    <span :class="['block truncate']">No</span>
                    <span v-if="selected" class="checkmark" >
                      <CheckIcon class="w-5 h-5" aria-hidden="true" />
                    </span>
                  </li>
                </ListboxOption>
              </ListboxOptions>
            </transition>
          </div>
        </Listbox> -->
      </div>
      <!-- ttl -->
      <div class="input-group flex-1 ttl">
        <span class="text-md" :class="options.ttl ? '' : 'text-gray-500'">{{ options.ttl || 'Auto' }}</span>
        <!-- <input
          type="number"
          autocomplete="off"
          class="w-full input input--floating"
          placeholder="Enter TTL"
          required
          v-model="ttl"
          @keypress="createOnEnter"
        />
        <div v-if="ttlError" class="errorMessage">
          <span class="errorMessage__text">{{ ttlError }}</span>
        </div> -->
      </div>
      <!-- add button -->
      <button
        :disabled="true"
        class="w-20 h-full"
      >
        <div v-if="false" class="flex justify-center items-center w-full">
          <span>Adding</span>
          <div><LoadingSpinner class="ml-1 w-4" /></div>
        </div>
        <span v-else class="flex justify-center"><DotsHorizontalIcon class="w-4" /></span>
      </button>
    </div>
  </div>
</template>

<script>
import { DotsHorizontalIcon } from '@heroicons/vue/outline'
import LoadingSpinner from '@/components/icons/LoadingSpinner.vue'

export default {
  name: 'CdnConfigPath',
  components: {
    DotsHorizontalIcon,
    LoadingSpinner
  },
  props: ['options', 'path'],
  data() {
    return {

    }
  },
  computed: {
    cacheEnabledDisplay() {
      if (this.options.enabled === undefined) return 'Auto'
      else return this.options.enabled ? 'True' : 'False'
    },
    isGlobal() {
      return true
    }
  }
}
</script>

<style scoped>
.input-group.path {
  flex-basis: 350px;
}
.input-group.cache {
  flex-basis: 100px;
}
.input-group.ttl {
  flex-basis: 100px;
}
</style>
