<!-- This example requires Tailwind CSS v2.0+ -->
<template>
  <div class="meter">
    <span :class="red ? 'bg-red' : 'bg-green'" style="width: 100%"></span>
  </div>
</template>

<script>

export default {
  name: 'ProgressBar',
  props: ['red']
}
</script>

<style scoped>
.meter {
  @apply w-80 h-6 max-w-full;
  box-sizing: content-box;
  border-radius: 25px;
}
.meter > span {
  @apply h-full block relative overflow-hidden rounded-md;
}
.meter > span:after,
.animate > span > span {
  @apply absolute top-0 left-0 right-0 bottom-0;
  content: "";
  background-image: linear-gradient(
    -45deg,
    rgba(255, 255, 255, 0.2) 25%,
    transparent 25%,
    transparent 50%,
    rgba(255, 255, 255, 0.2) 50%,
    rgba(255, 255, 255, 0.2) 75%,
    transparent 75%,
    transparent
  );
  background-size: 50px 50px;
  animation: move 2s linear infinite;
}

@keyframes move {
  0% {
    background-position: 0 0;
  }
  100% {
    background-position: 50px 50px;
  }
}
</style>
