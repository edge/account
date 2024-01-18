<template>
  <div class="bg-white p-4 rounded-lg shadow-2xl">
    <div class="flex items-start space-x-4">
      <img :src="icon" :alt="title" class="my-2 w-12 h-12">
      <div class="flex-grow">
        <p class="text-md mt-2 mb-0">{{ title }}</p>
        <p class="text-sm text-gray-600 mt-0 mb-2">{{ description }}</p>
      </div>
      <a :href="link" class="inline-block my-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-2 px-4 rounded">
        {{ buttonText }}
      </a>
    </div>
  </div>
</template>

<script>
export default {
  name: 'GuideCard',
  props: {
    icon: {
      type: String,
      required: true
    },
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    link: {
      type: String,
      required: true
    },
    buttonText: {
      type: String,
      required: true
    }
  }
}
</script>
