<template>
  <div class="flex flex-col w-full lg:space-x-8 lg:items-end lg:flex-row">

    <!-- input -->
    <div class="flex-1 input-group">
      <label class="label">Password</label>
      <div class="relative flex items-center">
        <input type="password" placeholder="Create a password" value="d5lsi!!77bns" class="w-full input input--floating" />
        <EyeIcon class="absolute right-0 w-5 h-5 text-gray-300" />
      </div>
    </div>

    <!-- buttons -->
    <div class="flex mt-5 space-x-2 lg:mt-0">
      <button class="button button--solid">Generate</button>
      <button class="button button--solid">Copy</button>
    </div>

  </div>
</template>

<script>
import { EyeIcon } from "@heroicons/vue/solid"
export default {
  name: 'Password',
  components: {
    EyeIcon
  }
}
</script>

<style scoped>

</style>
