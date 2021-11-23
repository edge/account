<template>
  <div>
    <h5 class="loose">
      SUMMARY
    </h5>
    <div class="relative pt-5 mt-5">
      <div class="timeline__line" />
      <div class="timeline__gradient timeline__gradient--top" />
      <div class="timeline__gradient timeline__gradient--bottom" />
      <div class="flex flex-col space-y-10">
        <template
          v-for="event in events"
          :key="event.event"
        >
          <div class="timeline__item">
            <div class="timeline__item__circle" />
            <div class="flex flex-col">
              <span class="timeline__item__date">{{ event.date }}</span>
              <span class="timeline__item__event">{{ event.event }}</span>
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
  
  /* timeline left border */
  .timeline__line {
    @apply absolute top-0 w-px h-full bg-gray-300 left-2;
  }

  /* subtle gradients to fade in/out the line */
  .timeline__gradient {
    @apply absolute left-0 w-4 h-4;
  }
  .timeline__gradient.timeline__gradient--bottom {
    @apply bottom-0 left-0 bg-gradient-to-t from-gray-200;
  }
  .timeline__gradient.timeline__gradient--top {
    @apply top-0 left-0 bg-gradient-to-b from-gray-200;
  }

  /* timeline item */
  .timeline__item {
    @apply flex items-center space-x-5;
  }
  .timeline__item__circle {
    @apply w-4 h-4 bg-gray-300 rounded-full
  }
  .timeline__item__date {
    @apply text-xs text-gray-500;
  }
  .timeline__item__event {
    @apply text-base;
  }
</style>
