<template>
  <div class="terminal_wrapper" :class="fullscreen ? 'fullscreen' : ''">
    <!-- Status bar -->
    <div id="noVNC_status_bar" :class="statusClass">
      <div id="noVNC_status">{{status}}</div>
      <button class="openMenu__button" @click.prevent="toggleMenu">
        <DotsHorizontalIcon class="w-4 h-4 ml-1" />
      </button>
    </div>

    <!-- Extra keys (e.g. shift, alt, ctrl) -->
    <div v-if="showExtraKeys" id="extra_keys">
      <button @click="toggleshowMoreKeys" class="text-white hover:text-green text-xl absolute right-5 top-10">
        <span v-if="showMoreKeys">-</span>
        <span v-else>+</span>
      </button>
      <div class="flex space-x-2 justify-center">
        <button @click.prevent="toggleShift"
          class="extra_keys--button"
          :class="shift ? 'selected' : ''"
        >
          <span>Shift</span>
        </button>
        <button @click.prevent="toggleCtrl"
          class="extra_keys--button"
          :class="ctrl ? 'selected' : ''"
        >
          <span>Ctrl</span>
        </button>
        <button @click.prevent="toggleAlt"
          class="extra_keys--button"
          :class="alt ? 'selected' : ''"
        >
          <span>Alt</span>
        </button>
      </div>
      <div v-if="showMoreKeys" class="flex space-x-2 justify-center mt-2">
        <button @click.prevent="sendTab"
          class="extra_keys--button"
        >
          <span>Tab</span>
        </button>
        <button @click.prevent="sendEsc"
          class="extra_keys--button"
        >
          <span>Esc</span>
        </button>
        <button @click.prevent="sendCtrlAltDel"
          class="extra_keys--button ctrlAltDel"
        >
          <span>Ctrl+Alt+Del</span>
        </button>
      </div>
    </div>

    <!-- Menu -->
    <div class="menu" :class="showMenu ? 'show' : ''">
      <button @click.prevent="toggleFullscreen"
        class="menu__button maximise"
        :class="fullscreen ? 'selected' : ''"
      >
        <span>Fullscreen</span>
        <ArrowsExpandIcon class="w-4 h-4" />
      </button>
      <button v-if="isTouchDevice" @click.prevent="toggleVirtualKeyboard"
        class="menu__button"
        :class="showKeyboard ? 'selected' : ''"
      >
        <span>Keyboard</span>
        <KeyboardIcon class="w-4 h-4" />
      </button>
      <button @click.prevent="toggleExtraKeys"
        class="menu__button"
        :class="showExtraKeys ? 'selected' : ''"
      >
        <span>Extra Keys</span>
        <ShiftIcon class="w-4 h-4" :class="showExtraKeys && 'text-green'" />
      </button>
      <button class="menu__button" @click.prevent="close(false)">
        <span>Disconnect</span>
        <LogoutIcon class="w-4 h-4" />
      </button>
    </div>

    <!-- Terminal mounted here -->
    <div id="noVNC_container" ref="noVNC_container">
      <!-- hidden text area for virtual keyboard to focus on -->
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

/**
 * This component uses a combination of noVNCs core api https://github.com/novnc/noVNC/blob/master/docs/API.md
 * and snippets of code from their user aplication https://github.com/novnc/noVNC/blob/master/app/ui.js.
 * The user application snippets are primarily around the use of virtual keyboards for access the console from
 * touch screen devices.
 */

import * as api from '@/account-utils/index'
import KeyTable from '@novnc/novnc/core/input/keysym'
import Keyboard from '@novnc/novnc/core/input/keyboard'
import KeyboardIcon from '@/components/icons/KeyboardIcon'
import RFB from '@novnc/novnc/core/rfb'
import ShiftIcon from '@/components/icons/ShiftIcon'
import keysyms from '@novnc/novnc/core/input/keysymdef'
import { mapState } from 'vuex'
import {
  ArrowsExpandIcon,
  DotsHorizontalIcon,
  LogoutIcon
} from '@heroicons/vue/outline'


export default {
  name: 'VNC',
  props: ['server'],
  components: {
    ArrowsExpandIcon,
    DotsHorizontalIcon,
    KeyboardIcon,
    LogoutIcon,
    ShiftIcon
  },
  data() {
    return {
      connected: false,
      fullscreen: false,
      rfb: null,
      showMenu: false,
      status: 'Loading...',
      statusClass: 'noVNC_status_normal',

      // virtual keyboard properties
      touchKeyboard: null,
      lastKeyboardinput: null,
      defaultKeyboardinputLen: 100,
      showKeyboard: false,

      // extra keys (ctrl/alt/etc) properties
      showExtraKeys: false,
      showMoreKeys: false,
      alt: false,
      ctrl: false,
      shift: false
    }
  },
  computed: {
    ...mapState(['session']),
    isTouchDevice() {
      return 'ontouchstart' in document.documentElement
    },
    serverId() {
      return this.$route.params.id
    }
  },
  methods: {
    close(withError) {
      this.$emit('close-console', withError)
    },
    async launchConsole() {
      // get VNC session details from API
      const { session, password } = await api.servers.getVncSession(
        process.env.VUE_APP_ACCOUNT_API_URL,
        this.session._key,
        this.serverId
      )
      // eslint-disable-next-line max-len
      const url = `${this.replaceURL(process.env.VUE_APP_ACCOUNT_API_URL)}/servers/${this.serverId}/vnc?session=${session}`
      // initiate RFB
      this.rfb = new RFB(
        this.$refs.noVNC_container,
        url,
        { credentials: { password } }
      )

      // add standard rfb event listeners
      this.rfb.addEventListener('connect', this.onConnect)
      this.rfb.addEventListener('disconnect', this.onDisconnect)

      // setup virtual keyboard for mobile (touch) devices
      this.touchKeyboard = new Keyboard(document.getElementById('noVNC_keyboardinput'))
      this.touchKeyboard.onkeyevent = this.keyEvent
      this.touchKeyboard.grab()
      document.getElementById('noVNC_keyboardinput').addEventListener('input', this.keyInput)
      document.getElementById('noVNC_keyboardinput').addEventListener('focus', this.onfocusVirtualKeyboard)
      document.getElementById('noVNC_keyboardinput').addEventListener('blur', this.onblurVirtualKeyboard)
      document.getElementById('noVNC_keyboardinput').addEventListener('submit', () => false)
      this.keyboardinputReset()
      document.documentElement.addEventListener('mousedown', this.keepVirtualKeyboard, true)
    },
    onConnect() {
      this.statusClass = 'noVNC_status_normal'
      this.status = `Connected to ${this.server.settings.name}`
      this.connected = true

      // allow drag scrolling of console on mobile devices
      this.rfb.clipViewport = true
      this.rfb.dragViewport = true

      // for touch devices, open virtual keyboard as standard
      // for non-touch devices, focus on the rfb
      if (this.isTouchDevice) this.showVirtualKeyboard()
      else this.rfb.focus()
    },
    onDisconnect() {
      // allow for a 3 second timeout before displaying error messages so user is aware a connection was attempted
      setTimeout(() => {
        this.statusClass = 'noVNC_status_error'
        this.status = `Failed to connect to ${this.server.settings.name}`
        this.connected = false
        this.close(true)
      }, 3000)
    },
    replaceURL(host) {
      return host.replace(/^http(s?:)/, 'ws$1')
    },
    setFocus() {
      // for mobile devices, focus needs to be on the hidden text box to open virtual keyboard
      if (this.isTouchDevice) document.getElementById('noVNC_keyboardinput').focus()
      // on non-touch devices, focus on the rfb element
      else this.rfb.focus()
    },
    toggleFullscreen() {
      this.fullscreen = !this.fullscreen
      this.showMenu = false
    },
    toggleMenu() {
      this.showMenu = !this.showMenu
    },

    /**
     * Virtual keyboard methods. Most of these methods come form https://github.com/novnc/noVNC/blob/master/app/ui.js
     */
    keepVirtualKeyboard(event) {
      const input = document.getElementById('noVNC_keyboardinput')
      // Only prevent focus change if the virtual keyboard is active
      if (document.activeElement != input) return
      // Only allow focus to move to other elements that need
      // focus to function properly
      if (event.target.form !== undefined) {
        switch (event.target.type) {
        case 'text':
        case 'email':
        case 'search':
        case 'password':
        case 'tel':
        case 'url':
        case 'textarea':
        case 'select-one':
        case 'select-multiple':
          return
        }
      }
      event.preventDefault()
    },
    keyboardinputReset() {
      const kbi = document.getElementById('noVNC_keyboardinput')
      kbi.value = new Array(this.defaultKeyboardinputLen).join('_')
      this.lastKeyboardinput = kbi.value
    },
    // When normal keyboard events are left uncaught, use the input events from the keyboardinput element instead and
    // generate the corresponding key events.
    // This code is required since some browsers on Android are inconsistent in sending keyCodes in the normal keyboard
    // events when using on screen keyboards.
    keyInput(event) {
      if (!this.rfb) return

      const newValue = event.target.value

      if (!this.lastKeyboardinput) {
        this.keyboardinputReset()
      }
      const oldValue = this.lastKeyboardinput

      let newLen
      try {
        // Try to check caret position since whitespace at the end
        // will not be considered by value.length in some browsers
        newLen = Math.max(event.target.selectionStart, newValue.length)
      }
      catch (err) {
        // selectionStart is undefined in Google Chrome
        newLen = newValue.length
      }
      const oldLen = oldValue.length

      let inputs = newLen - oldLen
      let backspaces = inputs < 0 ? -inputs : 0

      // Compare the old string with the new to account for
      // text-corrections or other input that modify existing text
      for (let i = 0; i < Math.min(oldLen, newLen); i++) {
        if (newValue.charAt(i) != oldValue.charAt(i)) {
          inputs = newLen - i
          backspaces = oldLen - i
          break
        }
      }

      // Send the key events
      for (let i = 0; i < backspaces; i++) {
        this.rfb.sendKey(KeyTable.XK_BackSpace, 'Backspace')
      }
      for (let i = newLen - inputs; i < newLen; i++) {
        this.rfb.sendKey(keysyms.lookup(newValue.charCodeAt(i)))
      }

      // Control the text content length in the keyboardinput element
      if (newLen > 2 * this.defaultKeyboardinputLen) {
        this.keyboardinputReset()
      }
      else if (newLen < 1) {
        // There always have to be some text in the keyboardinput
        // element with which backspace can interact.
        this.keyboardinputReset()
        // This sometimes causes the keyboard to disappear for a second
        // but it is required for the android keyboard to recognize that
        // text has been added to the field
        event.target.blur()
        // This has to be ran outside of the input handler in order to work
        setTimeout(event.target.focus.bind(event.target), 0)
      }
      else {
        this.lastKeyboardinput = newValue
      }
    },
    keyEvent(keysym, code, down) {
      if (!this.rfb) return
      this.rfb.sendKey(keysym, code, down)
    },
    hideVirtualKeyboard() {
      if (!this.isTouchDevice || !this.showKeyboard) return
      document.getElementById('noVNC_keyboardinput').blur()
    },
    onblurVirtualKeyboard() {
      if (this.rfb) this.rfb.focusOnClick = true
      this.showKeyboard = false
    },
    onfocusVirtualKeyboard() {
      if (this.rfb) this.rfb.focusOnClick = false
      this.showKeyboard = true
    },
    showVirtualKeyboard() {
      if (!this.isTouchDevice || this.showKeyboard) return
      const keyboardInput = document.getElementById('noVNC_keyboardinput')
      keyboardInput.focus()
      try {
        const l = keyboardInput.value.length
        // Move the caret to the end
        keyboardInput.setSelectionRange(l, l)
      }
      catch (err) {
        // setSelectionRange is undefined in Google Chrome
      }
    },
    toggleVirtualKeyboard() {
      if (this.showKeyboard) this.hideVirtualKeyboard()
      else this.showVirtualKeyboard()
      this.showMenu = false
    },
    sendKey(keysym, code, down) {
      this.rfb.sendKey(keysym, code, down)
      this.setFocus()
      // close menu to highlight that the focus has been moved to the screen
      this.showMenu = false
    },

    /**
     * Extra keys ( Ctrl/Alt/etc) methods
     */
    sendCtrlAltDel() {
      this.rfb.sendCtrlAltDel()
      this.setFocus()
    },
    sendEsc() {
      this.sendKey(KeyTable.XK_Escape, 'Escape')
    },
    sendTab() {
      this.sendKey(KeyTable.XK_Tab, 'Tab')
    },
    toggleExtraKeys() {
      this.showExtraKeys = !this.showExtraKeys
      this.showMenu = false
    },
    toggleshowMoreKeys() {
      this.showMoreKeys = !this.showMoreKeys
      this.showMenu = false
    },
    toggleAlt() {
      if (this.alt) {
        this.sendKey(KeyTable.XK_Alt_L, 'AltLeft', false)
        this.alt = false
      }
      else {
        this.sendKey(KeyTable.XK_Alt_L, 'AltLeft', true)
        this.alt = true
      }
    },
    toggleCtrl() {
      if (this.ctrl) {
        this.sendKey(KeyTable.XK_Control_L, 'ControlLeft', false)
        this.ctrl = false
      }
      else {
        this.sendKey(KeyTable.XK_Control_L, 'ControlLeft', true)
        this.ctrl = true
      }
    },
    toggleShift() {
      if (this.shift) {
        this.sendKey(KeyTable.XK_Shift_Left, 'ShiftLeft', false)
        this.shift = false
      }
      else {
        this.sendKey(KeyTable.XK_Shift_Left, 'ShiftLeft', true)
        this.shift = true
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
    this.rfb = null
  },
  watch: {
    showMenu() {
      this.setFocus()
    }
  }
}
</script>

<style scoped>
/* terminal is full screen on small devices, or when manually set to full screen */
.terminal_wrapper {
  @apply fixed top-0 left-0 h-screen w-screen;
  z-index: 10000000000;
}
.terminal_wrapper.fullscreen {
  @apply fixed top-0 left-0 h-screen w-screen;
  z-index: 10000000000;
}
@screen sm {
  /* on screens above sm breakpoint, default is no longer fullscreen */
  .terminal_wrapper {
    @apply relative w-full;
    height: max-content;
    z-index: inherit;
  }
}

/* menu */
.openMenu__button {
  @apply absolute left-2 top-2 flex items-center;
}
.menu {
  @apply absolute left-2 top-8 hidden flex-col mt-2 bg-white rounded;
}
.menu.show {
  @apply flex;
}
.menu__button {
  @apply flex items-center justify-between space-x-1 p-2 rounded hover:bg-gray-300;
}
.menu__button.icon {
  @apply p-0;
}
.menu__button.maximise {
  @apply hidden sm:flex
}
.menu__button.selected {
  @apply text-green;
}

/* extra keys menu */
#extra_keys {
  @apply flex flex-col justify-center p-2;
  background-color: rgb(40, 40, 40);
}
.extra_keys--button {
  @apply w-16 p-1 bg-white rounded hover:bg-gray-300 focus:text-green;
}
.extra_keys--button.ctrlAltDel {
  @apply w-max;
}
.extra_keys--button.selected {
  @apply text-green;
}

/* status bar */
#noVNC_status_bar {
  @apply relative w-full flex flex-col justify-center items-center py-2 px-10 text-white;
  font: bold 12px Helvetica;
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

/* Main console container */
#noVNC_container {
  width: 100%;
  height: 100%;
  min-height: 600px;
  background-color: rgb(40, 40, 40);
}

/* hidden textarea for virtual keyboard */
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
</style>
