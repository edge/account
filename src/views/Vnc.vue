<template>
  <div>
    <div id="noVNC_status_bar" class="noVNC_status_normal">
      <div id="noVNC_status">{{status}}</div>
    </div>
    <div id="view"></div>  
  </div>
</template>

<script>
import RFB from '@novnc/novnc/core/rfb'
import { mapGetters } from 'vuex'

export default {
  name: 'VNC',
  title() {
    return 'VNC'
  },
  computed: {
    ...mapGetters({
      vncSettings: 'StateVncSettings'
    })
  },
  data() {
    return {
      desktopName: '',
      rfb: null,
      server: null,
      status: 'Loading...'
    }
  },
  methods: {
    connected() {
      this.status = `Connected to ${this.desktopName}`
      this.rfb.focus()
    },
    updateDektopName(event) {
      this.desktopName = event.detail.name
    }
  },
  mounted() {
    this.$nextTick(() => {

      const settings = this.vncSettings

      console.log('server', settings)
      const url = `wss://api.vm.edge.network/gosockify/ws?token=${settings.server}%3A${settings.port}`
      this.rfb = new RFB(this.$el, url, { credentials: { password: settings.password } })
      
      this.rfb.addEventListener('connect', this.connected)
      this.rfb.addEventListener('desktopname', this.updateDektopName)
    })
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