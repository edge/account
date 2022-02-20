<template>
  <div class="flex flex-col items-start space-y-5">

    <div v-if="this.server.state !== 'creating'" class="buttonGroup">
      <button class="buttonGroup__button active">Today</button>
      <button class="buttonGroup__button">This week</button>
      <button class="buttonGroup__button">This month</button>
      <button class="border-none buttonGroup__button">This year</button>
    </div>

    <!-- if metrics don't exist -->
    <div v-if="this.server.state === 'creating'" class="box box--tall">
      <div class="flex flex-col items-center justify-center text-center">
        <div class="flex items-center justify-center w-16 h-16 p-4 border-2 border-green-100 rounded-full border-opacity-10 animate-pulse bg-green-50">
          <svg class="w-full h-full text-green-300" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M38.1805 71.4802C37.7743 71.4802 37.3758 71.32 37.0789 71.027L27.6961 61.7067C27.286 61.3005 27.1336 60.6989 27.3016 60.1442C29.5672 52.6715 32.5086 45.2062 36.0438 37.9642C39.575 30.7025 43.9657 21.6592 49.8838 15.3662L49.8877 15.3623C63.1577 1.38534 84.4657 0.776336 95.9857 1.65934C96.7592 1.71793 97.3724 2.33512 97.4271 3.10854C98.2318 14.6245 97.517 35.8975 83.7001 48.9755C77.4853 54.8778 68.3091 59.2375 60.9421 62.7375C53.6609 66.2453 46.1531 69.1672 38.6301 71.4172C38.4817 71.4602 38.3293 71.4797 38.1809 71.4797L38.1805 71.4802ZM30.5711 60.1562L38.6219 68.1562C45.6922 65.9921 52.7429 63.2226 59.5949 59.9218C67.1457 56.332 75.6969 52.2695 81.5519 46.7108C93.9229 34.9998 95.0049 15.8988 94.3959 4.68776C83.1769 4.00026 64.0439 4.99635 52.1579 17.5118C46.5681 23.461 42.2907 32.2618 38.8529 39.3318C35.5326 46.1404 32.7474 53.1408 30.5717 60.1558L30.5711 60.1562Z" fill="currentColor"/>
          <path d="M66.3925 41.164C64.162 41.164 61.9316 40.3202 60.2363 38.6328C58.5879 36.9961 57.6816 34.8164 57.6816 32.5C57.6816 30.1836 58.5879 28.0039 60.2363 26.3672C63.6347 22.9922 69.1582 22.9922 72.5523 26.3672C74.2007 28.0039 75.107 30.1836 75.107 32.5C75.107 34.8164 74.2008 36.9961 72.5523 38.6328C70.8531 40.3242 68.6226 41.164 66.3921 41.164H66.3925ZM66.3925 26.961C64.9589 26.961 63.5292 27.504 62.4355 28.586C61.3808 29.6329 60.8027 31.0235 60.8027 32.5001C60.8027 33.9806 61.3809 35.3673 62.4355 36.4142C64.6152 38.5822 68.166 38.5822 70.3457 36.4142C71.4004 35.3673 71.9785 33.9767 71.9785 32.5001C71.9785 31.0196 71.3965 29.629 70.3457 28.586C69.2559 27.504 67.8262 26.961 66.3926 26.961H66.3925Z" fill="currentColor"/>
          <path d="M32.1856 51.1252C32.1426 51.1252 32.1036 51.1252 32.0606 51.1213L16.4086 49.8752C15.9359 49.8361 15.5063 49.5861 15.2367 49.1916C14.9711 48.7971 14.8969 48.3049 15.0414 47.8518C15.5648 46.176 20.8422 31.2498 45.0454 21.4998C45.6587 21.2498 46.3657 21.4178 46.8032 21.9178C47.2407 22.4139 47.3149 23.1366 46.9907 23.7147C46.7915 24.0702 46.4751 24.3162 46.1157 24.4373C27.3697 32.0154 20.7757 42.5703 18.7637 46.9213L32.3107 47.9994C33.1701 48.0698 33.8107 48.8198 33.7443 49.683C33.6779 50.5034 32.9943 51.1244 32.1857 51.1244L32.1856 51.1252Z" fill="currentColor"/>
          <path d="M50.6303 83.7503C50.3217 83.7503 50.017 83.6605 49.7553 83.4808C49.3647 83.2152 49.1147 82.7855 49.0756 82.3128L47.8217 66.7658C47.7514 65.9064 48.392 65.1525 49.2514 65.0822C50.1147 65.008 50.8647 65.6525 50.935 66.5158L52.0209 79.9688C56.3842 77.9844 67.0009 71.4571 74.6379 52.8748C74.7355 52.5272 74.9504 52.2068 75.2785 51.992C75.3332 51.9568 75.4035 51.9139 75.4621 51.8865C76.0441 51.5975 76.7473 51.6951 77.2238 52.1365C77.7003 52.5779 77.8527 53.2693 77.6066 53.8748C67.7941 77.9218 52.7746 83.1638 51.0946 83.6838C50.9384 83.7268 50.7821 83.7502 50.6298 83.7502L50.6303 83.7503Z" fill="currentColor"/>
          <path d="M93.3416 31.3553C92.9432 31.3553 92.5447 31.203 92.24 30.9022L68.021 6.84323C67.4077 6.23385 67.4038 5.24553 68.0132 4.63233C68.6226 4.01905 69.6109 4.01905 70.2241 4.62452L94.4431 28.6865C95.0564 29.2959 95.0603 30.2842 94.4509 30.8974C94.1423 31.2021 93.74 31.3544 93.3415 31.3544L93.3416 31.3553Z" fill="currentColor"/>
          <path d="M4.84785 97.66C4.45723 97.66 4.0666 97.5155 3.76195 97.2225C3.14086 96.6249 3.12523 95.6327 3.72288 95.0116L25.1179 72.8596C25.7194 72.2385 26.7077 72.2229 27.3288 72.8205C27.9499 73.4182 27.9655 74.4103 27.3678 75.0314L5.97285 97.1834C5.66426 97.4999 5.25801 97.66 4.84785 97.66V97.66Z" fill="currentColor"/>
          <path d="M19.9031 98.594C19.532 98.594 19.1649 98.4651 18.8679 98.1995C18.2234 97.6252 18.1648 96.637 18.739 95.9925L32.606 80.3875C33.1802 79.7429 34.1646 79.6843 34.813 80.2586C35.4576 80.8328 35.5161 81.8211 34.9419 82.4656L21.0749 98.0706C20.7624 98.4182 20.3327 98.594 19.903 98.594H19.9031Z" fill="currentColor"/>
          <path d="M3.90704 83.637C3.53595 83.637 3.16876 83.5081 2.87184 83.2424C2.22731 82.6682 2.16872 81.6799 2.74293 81.0354L16.6099 65.4304C17.1842 64.7859 18.1685 64.7273 18.8169 65.3015C19.4615 65.8757 19.5201 66.864 18.9458 67.5085L5.07884 83.1135C4.76634 83.4612 4.33665 83.637 3.90694 83.637H3.90704Z" fill="currentColor"/>
          </svg>
        </div>
        <h4 class="mt-4">Deploying your new server</h4>
        <p class="mt-2 mb-0 text-gray-500">Server metrics and other information will be displayed here once deployment is complete.</p>
      </div>
    </div>

    <!-- if metrics exist -->
    <div v-else class="grid w-full grid-cols-1 gap-5">

      <div class="box">
        <h4 :class="this.metrics.cpu_load && this.metrics.cpu_load[0] ? 'mb-8' : ''">CPU load</h4>
        <Line
          v-if="this.metrics.cpu_load[0]"
          :data='removeEmptyPoints(this.metrics.cpu_load[0].datapoints)'
          :minScale='0'
          :maxScale='100'
          :postpendValue="'%'"
        />
        <p v-else class="mt-3 mb-0 text-gray-500">CPU loaad statistics will appear here as they become available.</p>
      </div>

      <div class="box">
        <h4 :class="this.metrics.cpu_load && this.metrics.cpu_load[0] ? 'mb-8' : ''">Memory usage</h4>
        <Line
          v-if="this.metrics.mem_usage[0]"
          :data='formatDatapoints(removeEmptyPoints(this.metrics.mem_usage[0].datapoints))'
          :maxScale="this.server.ram_mib"
          postpendValue="MB"
        />
        <p v-else class="mt-3 mb-0 text-gray-500">Memory usage statistics will appear here as they become available.</p>
      </div>

      <div class="box">
        <h4 :class="this.metrics['df.root.used'] ? 'mb-8' : ''">Disk usage</h4>
        <Line
          v-if="this.metrics['df.root.used'][0]"
          :data='formatDatapoints(removeEmptyPoints(this.metrics["df.root.used"][0].datapoints), "GB")'
          :maxScale="this.server.disk_mib/1024"
          postpendValue="GB"
        />
        <p v-else class="mt-3 mb-0 text-gray-500">Disk usage statistics will appear here as they become available.</p>
      </div>

      <div class="box">
        <h4 class="mb-8">Disk I/O</h4>
        <Line
          v-if="this.metrics['iops'][0]"
          :data='removeEmptyPoints(this.metrics["iops"][0].datapoints)'
        />
      </div>

      <div class="box">
        <h4 class="mb-8">Net RX</h4>
        <Line
          v-if="this.metrics['net_rx'][0]"
          :data='removeEmptyPoints(this.metrics["net_rx"][0].datapoints)'
        />
      </div>

      <div class="box">
        <h4 class="mb-8">Net TX</h4>
        <Line
          v-if="this.metrics['net_tx'][0]"
          :data='removeEmptyPoints(this.metrics["net_tx"][0].datapoints)'
        />
      </div>
    </div>
    
  </div>
</template>

<script>
import Line from "@/components/charts/Line"

export default {
  name: 'ServerOverview',
  props: {
    metrics: Object,
    server: Object
  },
  components: {
    Line
  },
  methods: {
    formatDatapoints(data, sizeType = 'MB') {
      const divisor = sizeType === 'MB' ? 1048576 : 1073741824
      
      data.forEach(datapoint => {
        if (datapoint[0]) {
          datapoint[0] = datapoint[0]/divisor
        }
      })

      return data
    },
    removeEmptyPoints(data) {
      return data.filter(dp => dp[0])
    }
  },
  watch: {
    $route(to, from) {
      // clearInterval(this.polling)
      // this.polling = null
    }
  }
}
</script>
<style scoped>
  .box {
    @apply p-4 md:p-6 bg-white rounded-lg w-full;
  }
  .box.box--tall {
    @apply py-20 !important;
  }
  .buttonGroup {
    @apply flex border border-gray-300 rounded-md overflow-hidden bg-white;
  }
  .buttonGroup__button {
    @apply px-3 md:px-4 py-2 md:py-3 border-r border-gray-300 bg-white focus:outline-none text-sm text-gray-500;
    @apply hover:bg-gray-100;
  }
  .buttonGroup__button.active {
    @apply bg-green bg-opacity-10 text-green;
  }
</style>
