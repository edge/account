<template>
  <img
    class="grayscale"
    :class=className
    :src=filePath
    alt="distro icon"
  >
</template>

<script>
const osLookup = {
  'centos': 'centos_purple',
  'debian': 'debian',
  'ubuntu': 'ubuntu'
}

export default {
  name: 'DistroIcon',
  props: ['className', 'os'],
  computed: {
    filePath() {
      return `/assets/images/distro_icons/512_${osLookup[this.os]}.png`
    }
  }
}
</script>

<style scoped>
.grayscale {
  filter: grayscale()
}
</style>
