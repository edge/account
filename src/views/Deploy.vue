<template>
  <div class="flex w-full">
    <SideNavigation />
    <main class="mainContent">
      <TopNavigation />
      <div class="mainContent__inner">
        <h1>Deploy a new server</h1>

        <div class="grid items-start grid-cols-12 mt-5 space-x-10 lg:mt-5">
          <form class="flex flex-col col-span-12 pb-20 space-y-5">
            
            <!-- network region -->
            <div class="box">
              <h4>Network region</h4>
              <NetworkRegion />
            </div>

            <!-- size -->
            <div class="box">
              <h4>Server specs</h4>
              <ServerSpecs />
            </div>

            <!-- automated backups -->
            <div class="box">
              <div @click="toggleBackups" class="flex items-center justify-between w-full cursor-pointer">
                <h4>Automated Backups</h4>
                <Toggle
                  v-model="enableBackups"
                  @click="toggleBackups"
                  :classes="{
                    toggleOn: 'bg-green border-green'
                  }"
                />
              </div>
            </div>

            <!-- operating system -->
            <div class="box box--error">
              <h4>Operating System</h4>
              <OperatingSystem />
            </div>

            <!-- host name / server name -->
            <div class="box">
              <ServerName />
            </div>

            <!-- password -->
            <div class="box">
              <Password />
            </div>

            <!-- submit & error message -->
            <div class="flex flex-col w-full md:space-x-5 md:items-center md:flex-row">
              <button class="order-2 w-full mt-3 md:max-w-xs md:mt-0 button button--success md:order-1">Deploy</button>
              <span class="flex-1 order-1 text-red md:order-2">Please select an operating system</span>
            </div>

            <div>
              <h4>Selected:</h4>
              <ul>
                <li>Region: {{ serverRegion }}</li>
                <li>OS: {{ os }} {{ osVersion }}</li>
                <li>Backups enabled: {{ enableBackups }}</li>
              </ul>
            </div>
          </form>

          <!-- <div class="sticky hidden col-span-3 top-32 lg:block">
            <Summary/>
          </div> -->
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import Vue from 'vue'
import NetworkRegion from '@/components/deploy/NetworkRegion'
import OperatingSystem from '@/components/deploy/OperatingSystem'
import Password from '@/components/deploy/Password'
import ServerSpecs from '@/components/deploy/ServerSpecs'
import ServerName from '@/components/deploy/ServerName'
import SideNavigation from "@/components/SideNavigation"
import Summary from "@/components/Summary"
import Toggle from '@vueform/toggle'
import TopNavigation from "@/components/TopNavigation"
import { mapMutations, mapState } from 'vuex'

export default {
  name: 'Deploy',
  title() {
    return 'Edge Account Portal » Deploy a new server'
  },
  components: {
    NetworkRegion,
    OperatingSystem,
    Password,
    ServerName,
    ServerSpecs,
    SideNavigation,
    Summary,
    Toggle,
    TopNavigation,
  },
  computed: {
    ...mapState(['count', 'enableBackups', 'os', 'osVersion', 'serverRegion'])
  },
  methods: {
    ...mapMutations([
      'selectServerProperty'
    ]),
    toggleBackups () {
      this.selectServerProperty({ property: 'enableBackups', value: !this.$store.state.enableBackups })
    }
  }
}
</script>
<style src="@vueform/toggle/themes/default.css"></style>
<style scoped>
  .mainContent {
    @apply relative flex-1;
  }
  .mainContent__inner {
    @apply p-3 md:p-5 lg:p-8 mt-7;
  }
  .box {
    @apply w-full p-6 bg-white rounded-lg;
  }
  .box--error {
    @apply ring-2 ring-red ring-opacity-50;
  }
  .box__grid {
    @apply mt-6 w-full grid grid-cols-1 gap-4;
    @apply sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3;
  }
</style>
