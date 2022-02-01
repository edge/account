<!-- This example requires Tailwind CSS v2.0+ -->
<template>
  <TransitionRoot as="template" :show="open">
    <Dialog as="div" class="fixed inset-0 z-10 overflow-y-auto" @close="open = false">
      <div class="flex items-end justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <TransitionChild as="template" enter="ease-out duration-300" enter-from="opacity-0" enter-to="opacity-100" leave="ease-in duration-200" leave-from="opacity-100" leave-to="opacity-0">
          <DialogOverlay class="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" />
        </TransitionChild>

        <!-- This element is to trick the browser into centering the modal contents. -->
        <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        <TransitionChild
          as="template" enter="ease-out duration-300"
          enter-from="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          enter-to="opacity-100 translate-y-0 sm:scale-100"
          leave="ease-in duration-200"
          leave-from="opacity-100 translate-y-0 sm:scale-100"
          leave-to="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
        >
          <div class="panel">
            <div class="sm:flex sm:items-start">
              <div class="icon">
                <ExclamationIcon class="w-6 h-6" aria-hidden="true" />
              </div>
              <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <DialogTitle as="h4" class="">
                  Power down server?
                </DialogTitle>
                <div class="mt-2">
                  <p class="text-sm text-gray-500">
                    You will still be billed for a powered down server. To end billing, destroy the server instead.
                  </p>
                </div>
              </div>
            </div>
            <div class="mt-5 sm:mt-2 sm:ml-10 sm:pl-4 sm:flex">
              <button type="button" class="w-full button button--small button--error sm:w-auto" @click="open = false">
                Continue
              </button>
              <button type="button" class="w-full mt-3 button button--small button--outline sm:mt-0 sm:w-auto sm:ml-3" @click="open = false" ref="cancelButtonRef">
                Cancel
              </button>
            </div>
          </div>
        </TransitionChild>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script>
import { ref } from 'vue'
import { Dialog, DialogOverlay, DialogTitle, TransitionChild, TransitionRoot } from '@headlessui/vue'
import { ExclamationIcon } from '@heroicons/vue/outline'

export default {
  components: {
    Dialog,
    DialogOverlay,
    DialogTitle,
    TransitionChild,
    TransitionRoot,
    ExclamationIcon,
  },
  setup() {
    const open = ref(true)

    return {
      open,
    }
  },
}
</script>

<style scoped>
  .panel {
    @apply inline-block px-4 pt-5 pb-4 overflow-hidden text-left align-bottom transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6;
  }
  .icon {
    @apply flex items-center justify-center flex-shrink-0 w-12 h-12 mx-auto bg-red-100 text-red rounded-full sm:mx-0 sm:h-10 sm:w-10;
  }
</style>