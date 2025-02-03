<script setup>
import * as validation from '@/utils/validation'
import SpeedSlider from './SpeedSlider.vue'
import { reactive } from 'vue'
import useVuelidate from '@vuelidate/core'

const formState = reactive({
  speed: 'fast'
})

const v$ = useVuelidate({
  speed: [validation.oneOf(['fast', 'faster', 'fastest'])]
}, formState)
</script>

<template>
  <div>
    <div class="box">
      <h4>Resize your VPN</h4>

      <SpeedSlider v-model="v$.speed.$model" />
      <
    </div>
    <!-- balance warning -->
    <div class="box mt-4 flex space-x-2" v-if="haveSpecsIncreased && (balanceSuspend || balanceWarning)">
        <div><ExclamationIcon class="w-5 text-red" /></div>
        <span class="text-red">You are unable to increase this VPN's specs while your available balance is below ${{ balance.threshold.warning.usd }}. Please add funds or set up Pay by Credit Card to enable this service.</span>
    </div>
    <!-- resize button and errors -->
    <div class="flex flex-col relative my-4 space-y-2">
      <button
        @click="toggleConfirmationModal"
        :disabled=!canSubmitResize
        class="button button--success md:self-end w-full md:max-w-xs"
      >
        <span v-if="isLoading">Resizing</span>
        <span v-else>Resize</span>
        <span v-if="isLoading" class="ml-2">
          <LoadingSpinner />
        </span>
      </button>
      <div class="flex md:justify-end mt-2"><HttpError :error=httpError /></div>
      <div v-if=internalServerError class="vpn__error" :class="overCapacityError && 'over-capacity'">
        <span class="font-bold">{{
          overCapacityError
          ? "We're over capacity"
          : "Something went wrong"
        }}</span>
        <span>
          {{
            overCapacityError
            ? "It appears that we are at capacity in this region. We're working hard to increase this. Please check back soon."
            : "There was an issue while deploying this VPN. Please try again, or contact support@edge.network if the issue persists."
          }}
        </span>
      </div>
    </div>
    <!-- resize confirmation modal -->
    <ResizeServerConfirmation
      v-if=showConfirmationModal
      @modal-confirm=resizeServer
      @modal-close=toggleConfirmationModal
      :currentCost=currentHourlyCost
      :currentSpec=currentSpec
      :lastResizeTask="lastResizeTask"
      :newCost=newHourlyCost
      :newSpec=newSpec
      :serverName="vpn.name"
    />
  </div>
</template>

<style scoped>
.vpn__error {
  @apply flex flex-col bg-red text-white p-4 w-full rounded space-y-1;
}

.vpn__error.over-capacity {
  @apply bg-blue-100 text-black;
}
</style>
