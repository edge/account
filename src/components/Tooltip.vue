<template>
  <div class="tooltip-box">
    <slot />
    <div
      class="tooltip"
      :class="[
        theme || 'light',
        position || 'top',
        wide ? 'wide' : ''
      ]"
    >
      <span class="text">{{ text }}</span>
    </div>
  </div>
</template>

<script>

export default {
  name: 'Tooltip',
  props: {
    text: {
      type: String,
      required: true
    },
    theme: {
      type: String,
      required: false
    },
    position: {
      type: String,
      required: false
    },
    wide: {
      type: Boolean,
      required: false
    }
  }
}
</script>

<style scoped>
  .tooltip-box {
    @apply relative inline-block cursor-pointer;
  }

  /* visible states */
  .tooltip-box:hover .tooltip {
    @apply opacity-100 visible;
  }
  .tooltip-box:hover .tooltip.top {
    @apply -translate-y-2;
  }

  .tooltip-box:hover .tooltip.bottom {
    @apply translate-y-8;
  }

  .tooltip-box:hover .tooltip.right {
    @apply translate-x-2;
  }

  .tooltip-box:hover .tooltip.left {
    @apply -translate-x-2;
  }

  /* tooltip position */
  .tooltip {
    max-width: 200px;
    @apply w-max invisible p-4 text-xs absolute transform transition duration-200 text-white text-left shadow rounded opacity-0 z-10 bg-green font-normal normal-case;
  }

  .tooltip.wide {
    max-width: 300px;
  }

  .tooltip.top {
    @apply bottom-full left-1/2 -translate-x-1/2;
  }

  .tooltip.bottom {
    @apply top-full left-1/2 -translate-x-1/2;
  }

  .tooltip.right {
    @apply left-full translate-x-0 top-1/2 -translate-y-1/2;
  }

  .tooltip.left {
    @apply right-full translate-x-0 top-1/2 -translate-y-1/2;
  }

  /* theme */
  .tooltip.dark {
    @apply bg-black-100 border border-green !important;
  }
  .tooltip.error {
    @apply bg-red
  }
  .tooltip.white {
    @apply bg-white border border-gray-300 text-gray-500;
  }

  /* the notch */
  .tooltip .text::after {
    content: " ";
    @apply absolute transform;
    border-width: 5px;
    border-style: solid;
  }
  .tooltip.top .text::after {
    @apply top-full left-1/2 transform -translate-x-1/2;
    border-color: #0ecc5f transparent transparent transparent;
  }

  .tooltip.right .text::after {
    @apply top-1/2 left-0 transform -translate-y-1/2 -translate-x-2;
    border-color: transparent #0ecc5f transparent transparent;
  }

  .tooltip.bottom .text::after {
    @apply bottom-full left-1/2 transform -translate-x-1/2;
    border-color: transparent transparent #0ecc5f transparent;
  }

  .tooltip.left .text::after {
    @apply top-1/2 right-0 transform -translate-y-1/2 translate-x-2;
    border-color: transparent transparent transparent #0ecc5f;
  }

  .tooltip.error.top .text::after {
    border-color: #cd5f4e transparent transparent transparent
  }
  .tooltip.error.right .text::after {
    border-color: transparent #cd5f4e transparent transparent
  }
  .tooltip.error.bottom .text::after {
    border-color: transparent transparent #cd5f4e transparent
  }
  .tooltip.error.left .text::after {
    border-color: transparent transparent transparent #cd5f4e
  }

  .tooltip.white.top .text::after {
    border-color: #fff transparent transparent transparent
  }
  .tooltip.white.right .text::after {
    border-color: transparent #fff transparent transparent
  }
  .tooltip.white.bottom .text::after {
    border-color: transparent transparent #fff transparent
  }
  .tooltip.white.left .text::after {
    border-color: transparent transparent transparent #fff
  }
</style>
