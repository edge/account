<template>
  <div>
    <div id="noVNC_status_bar" :class="statusClass">
      <div id="noVNC_status">{{status}}</div>
      <button class="close_button" @click="close(false)">
        <span>Close</span>
        <XIcon class="w-4 h-4 ml-1" />
      </button>
    </div>
    <div id="view" ref="terminal"></div>
  </div>
</template>

<script>
/* global process */

import * as api from '@/account-utils/index'
import RFB from '@novnc/novnc/core/rfb'
import { XIcon } from '@heroicons/vue/outline'
import { mapState } from 'vuex'

export default {
  name: 'VNC',
  props: ['server'],
  components: { XIcon },
  data() {
    return {
      desktopName: '',
      rfb: null,
      status: 'Loading...',
      statusClass: 'noVNC_status_normal'

    }
  },
  computed: {
    ...mapState(['session']),
    serverId() {
      return this.$route.params.id
    }
  },
  methods: {
    close(hasError) {
      this.$emit('close-console', hasError)
    },
    connected() {
      this.statusClass = 'noVNC_status_normal'
      this.status = `Connected to ${this.server.settings.name}`
      this.rfb.focus()
    },
    disconnected() {
      setTimeout(() => {
        this.statusClass = 'noVNC_status_error'
        this.status = `Failed to connect to ${this.server.settings.name}`
        this.close(true)
      }, 1000)
    },
    async launchConsole() {
      const password = await api.servers.getVncPassword(
        process.env.VUE_APP_ACCOUNT_API_URL,
        this.session._key,
        this.serverId
      )

      this.rfb = new RFB(
        this.$refs.terminal,
        `${this.replaceURL(process.env.VUE_APP_ACCOUNT_API_URL)}/servers/${this.serverId}/vnc`,
        {
          credentials: { password }
        }
      )

      this.rfb.addEventListener('connect', this.connected)
      this.rfb.addEventListener('disconnect', this.disconnected)
      this.rfb.addEventListener('desktopname', this.updateDektopName)
    },
    replaceURL(host) {
      return host.replace(/^http(s?:)/, 'ws$1')
    },
    updateDektopName(event) {
      this.desktopName = event.detail.name
    }
  },
  mounted() {
    this.$nextTick(async () => {
      await this.launchConsole()
    })
  },
  unmounted() {
    this.rfb.disconnect()
  }
}
</script>

<style>
#noVNC_status_bar {
  @apply relative w-full flex flex-col justify-center items-center;
  color: #fff;
  padding: 10px 70px;
  font: bold 12px Helvetica;
}

#noVNC_status {
  @apply mx-20;
}
.close_button {
  @apply absolute right-2 top-2 flex items-center;
}

.noVNC_status_normal {
  background: linear-gradient(#b2bdcd 0%,#899cb3 49%,#7e93af 51%,#6e84a3 100%);
}

.noVNC_status_error {
  background: linear-gradient(#cc9696 0%,#b46868 49%,#b46262 51%,#a55454 100%);
}

.noVNC_status_warn {
  background: linear-gradient(#ccc896 0%,#b4ac68 49%,#b4af62 51%,#a5a454 100%);
}
</style>
