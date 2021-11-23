<template>
  <div class="flex w-full">
    <SideNavigation />
    <main class="mainContent">
      <UserNav />
      <div class="mt-24">
        <h1>Deploy a new server</h1>

        <div class="grid grid-cols-12 mt-10 space-x-10">
          <form class="flex flex-col col-span-12 pb-20 space-y-5 lg:col-span-9">
            
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
              <div @click="value=!value" class="flex items-center justify-between w-full cursor-pointer">
                <h4>Automated Backups</h4>
                <Toggle
                  v-model="value"
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
          </form>

          <div class="hidden col-span-3 lg:block">
            <Summary/>
          </div>
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
import UserNav from "@/components/UserNav"
import Toggle from '@vueform/toggle'

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
    UserNav
  },
  data() {
    return {
      value: false
    }
  }
}
</script>
<style src="@vueform/toggle/themes/default.css"></style>
<style scoped>
  .mainContent {
    @apply relative flex-1 p-3 md:p-5 lg:p-8;
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
