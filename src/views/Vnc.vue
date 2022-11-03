<template>
  <div>
    <div id="noVNC_status_bar" class="noVNC_status_normal">
      <div id="noVNC_status">{{status}}</div>
    </div>
    <div id="view" ref="terminal"></div>
  </div>
</template>

<script>
/* global process */

import * as api from '@/account-utils/index'
import RFB from '@novnc/novnc/core/rfb'
import { mapState } from 'vuex'

export default {
  name: 'VNC',
  title() {
    return 'VNC'
  },
  data() {
    return {
      desktopName: '',
      rfb: null,
      server: null,
      status: 'Loading...'
    }
  },
  computed: {
    ...mapState(['session']),
    serverId() {
      return this.$route.params.id
    }
  },
  methods: {
    connected() {
      this.status = `Connected to ${this.desktopName}`
      this.rfb.focus()
    },
    disconnected() {
      this.status = `Disconnected from ${this.desktopName}`
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
    })
  },
  unmounted() {
    this.rfb.disconnect()
  }
}
</script>

<style>
#noVNC_status_bar {
  width: 100%;
  display:flex;
  justify-content: space-between;
  padding: 5px;
}

#noVNC_status {
  color: #fff;
  font: bold 12px Helvetica;
  margin: auto;
}

.noVNC_status_normal {
  background: linear-gradient(#b2bdcd 0%,#899cb3 49%,#7e93af 51%,#6e84a3 100%);
}

.noVNC_status_error {
  background: linear-gradient(#c83737 0%,#899cb3 49%,#7e93af 51%,#6e84a3 100%);
}

.noVNC_status_warn {
  background: linear-gradient(#b4b41e 0%,#899cb3 49%,#7e93af 51%,#6e84a3 100%);
}
</style>
