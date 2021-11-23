<template>
  <div>
    <h5 class="loose">
      SUMMARY
    </h5>
    <div class="relative pt-5 mt-5">
      <div class="absolute top-0 w-px h-full bg-gray-300 left-2" />
      <div class="absolute bottom-0 left-0 w-4 h-4 bg-gradient-to-t from-gray-200" />
      <div class="absolute top-0 left-0 w-4 h-4 bg-gradient-to-b from-gray-200" />
      <div class="flex flex-col space-y-10">
        <template
          v-for="event in events"
          :key="event.event"
        >
          <div class="flex items-center space-x-5">
            <div class="w-4 h-4 bg-gray-300 rounded-full" />
            <div class="flex flex-col">
              <span class="text-xs text-gray-500">{{ event.date }}</span>
              <span class="text-base">{{ event.event }}</span>
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script>

const events = [
  {
    event: 'Server started',
    date: '20 May 2021 03:44'
  },
  {
    event: 'Server started',
    date: '20 May 2021 03:44'
  },
  {
    event: 'Server deployed',
    date: '20 May 2021 03:44'
  }
]

export default {
  name: 'Summary',
    setup() {
    return { events }
  }
}
</script>

<style scoped>

</style>
