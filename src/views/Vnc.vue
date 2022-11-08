<template>
  <div>
    <div id="noVNC_status_bar" :class="statusClass">
      <div id="noVNC_status">{{status}}</div>
      <button class="close_button" @click="close(false)">
        <span>Close</span>
        <XIcon class="w-4 h-4 ml-1" />
      </button>
    </div>
    <div id="noVNC_container" ref="noVNC_container">
      <textarea
        id="noVNC_keyboardinput"
        autocapitalize="off"
        autocomplete="off"
        spellcheck="false"
        tabindex="-1"
      ></textarea>
    </div>
  </div>
</template>

<script>
/* global process */

import * as api from '@/account-utils/index'

import Keyboard from '@novnc/novnc/core/input/keyboard'

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
      statusClass: 'noVNC_status_normal',


      touchKeyboard: null
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
      }, 3000)
    },
    async launchConsole() {
      const { session, password } = await api.servers.getVncSession(
        process.env.VUE_APP_ACCOUNT_API_URL,
        this.session._key,
        this.serverId
      )
      // eslint-disable-next-line max-len
      const url = `${this.replaceURL(process.env.VUE_APP_ACCOUNT_API_URL)}/servers/${this.serverId}/vnc?session=${session}`
      this.rfb = new RFB(
        this.$refs.noVNC_container,
        url,
        {
          credentials: { password }
        }
      )
      this.rfb.addEventListener('connect', this.connected)
      this.rfb.addEventListener('disconnect', this.disconnected)
      this.rfb.addEventListener('desktopname', this.updateDektopName)


      this.touchKeyboard = new Keyboard(document.getElementById('noVNC_keyboardinput'))
      this.touchKeyboard.onkeyevent = this.keyEvent
      this.touchKeyboard.grab()
    },
    replaceURL(host) {
      return host.replace(/^http(s?:)/, 'ws$1')
    },
    updateDektopName(event) {
      this.desktopName = event.detail.name
    },


    keyEvent(keysym, code, down) {
      if (!this.rfb) return
      this.rfb.sendKey(keysym, code, down)
    },
    showVirtualKeyboard() {
      // if (!isTouchDevice) return

      const input = document.getElementById('noVNC_keyboardinput')

      if (document.activeElement == input) return

      input.focus()

      try {
        const l = input.value.length
        // Move the caret to the end
        input.setSelectionRange(l, l)
      }
      catch (err) {
        // setSelectionRange is undefined in Google Chrome
      }
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

<style scoped>
#noVNC_status_bar {
  @apply relative w-full flex flex-col justify-center items-center;
  color: #fff;
  padding: 10px 70px;
  font: bold 12px Helvetica;
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


/* noVNC styles */
.noVNC_only_touch.noVNC_hidden {
  display: none;
}

.noVNC_disabled {
  color: rgb(128, 128, 128);
}

/* ----------------------------------------
 * Main Area
 * ----------------------------------------
 */


/* Main container */
#noVNC_container {
  width: 100%;
  height: 100%;
  background-color: #313131;
  border-bottom-right-radius: 800px 600px;
  /*border-top-left-radius: 800px 600px;*/

  /* If selection isn't disabled, long-pressing stuff in the sidebar
     can accidentally select the container or the canvas. This in turn,
     results in a broken state where the user can't interact with the
     remote */
  user-select: none;
  -webkit-user-select: none;
}

#noVNC_keyboardinput {
  width: 1px;
  height: 1px;
  background-color: #fff;
  color: #fff;
  border: 0;
  position: absolute;
  left: -40px;
  z-index: -1;
  ime-mode: disabled;
}

/*
 * noVNC input element CSS
 */

input, select, textarea {
  /* Respect standard font settings */
  font: inherit;
}

input:not([type]),
input[type=date],
input[type=datetime-local],
input[type=email],
input[type=month],
input[type=number],
input[type=password],
input[type=search],
input[type=tel],
input[type=text],
input[type=time],
input[type=url],
input[type=week],
textarea {
  /* Disable default rendering */
  appearance: none;
  background: none;

  padding: 5px;
  border: 1px solid rgb(192, 192, 192);
  border-radius: 5px;
  color: black;
  background: linear-gradient(to top, rgb(255, 255, 255) 80%, rgb(240, 240, 240));
}

input[type=button],
input[type=color],
input[type=reset],
input[type=submit],
button,
select {
  /* Disable default rendering */
  appearance: none;
  background: none;

  padding: 5px;
  border: 1px solid rgb(192, 192, 192);
  border-bottom-width: 2px;
  border-radius: 5px;
  color: black;
  background: linear-gradient(to top, rgb(255, 255, 255), rgb(240, 240, 240));

  /* This avoids it jumping around when :active */
  vertical-align: middle;
}

input[type=button],
input[type=color],
input[type=reset],
input[type=submit],
button {
  padding-left: 20px;
  padding-right: 20px;
}

option {
  color: black;
  background: white;
}

input:not([type]):focus,
input[type=button]:focus,
input[type=color]:focus,
input[type=date]:focus,
input[type=datetime-local]:focus,
input[type=email]:focus,
input[type=month]:focus,
input[type=number]:focus,
input[type=password]:focus,
input[type=reset]:focus,
input[type=search]:focus,
input[type=submit]:focus,
input[type=tel]:focus,
input[type=text]:focus,
input[type=time]:focus,
input[type=url]:focus,
input[type=week]:focus,
button:focus,
select:focus,
textarea:focus {
  box-shadow: 0px 0px 3px rgba(74, 144, 217, 0.5);
  border-color: rgb(74, 144, 217);
  outline: none;
}

input:not([type]):disabled,
input[type=button]:disabled,
input[type=color]:disabled,
input[type=date]:disabled,
input[type=datetime-local]:disabled,
input[type=email]:disabled,
input[type=month]:disabled,
input[type=number]:disabled,
input[type=password]:disabled,
input[type=reset]:disabled,
input[type=search]:disabled,
input[type=submit]:disabled,
input[type=tel]:disabled,
input[type=text]:disabled,
input[type=time]:disabled,
input[type=url]:disabled,
input[type=week]:disabled,
button:disabled,
select:disabled,
textarea:disabled {
  color: rgb(128, 128, 128);
  background: rgb(240, 240, 240);
}

input[type=button]:active,
input[type=color]:active,
input[type=reset]:active,
input[type=submit]:active,
button:active,
select:active {
  border-bottom-width: 1px;
  margin-top: 1px;
}

:root:not(.noVNC_touch) input[type=button]:hover:not(:disabled),
:root:not(.noVNC_touch) input[type=color]:hover:not(:disabled),
:root:not(.noVNC_touch) input[type=reset]:hover:not(:disabled),
:root:not(.noVNC_touch) input[type=submit]:hover:not(:disabled),
:root:not(.noVNC_touch) button:hover:not(:disabled),
:root:not(.noVNC_touch) select:hover:not(:disabled) {
  background: linear-gradient(to top, rgb(255, 255, 255), rgb(250, 250, 250));
}

</style>
