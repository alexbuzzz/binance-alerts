<script setup>
import { ref, onMounted, onBeforeUnmount, onBeforeMount } from 'vue'
import IconMenu from './icons/IconMenu.vue'
import IconClose from './icons/IconClose.vue'
import { onClickOutside } from '@vueuse/core'

// SOUNDS ===============================================
import sound1 from '@/assets/sound/1.mp3'
import sound2 from '@/assets/sound/2.mp3'
import sound3 from '@/assets/sound/3.mp3'
import sound4 from '@/assets/sound/4.mp3'
import sound5 from '@/assets/sound/5.mp3'
import sound6 from '@/assets/sound/6.mp3'
import sound7 from '@/assets/sound/7.mp3'
import sound8 from '@/assets/sound/8.mp3'
import sound9 from '@/assets/sound/9.mp3'
import sound10 from '@/assets/sound/10.mp3'

// Preload sounds
const audio1 = new Audio(sound1)
audio1.load()
const audio2 = new Audio(sound2)
audio2.load()
const audio3 = new Audio(sound3)
audio3.load()
const audio4 = new Audio(sound4)
audio4.load()
const audio5 = new Audio(sound5)
audio5.load()
const audio6 = new Audio(sound6)
audio6.load()
const audio7 = new Audio(sound7)
audio7.load()
const audio8 = new Audio(sound8)
audio8.load()
const audio9 = new Audio(sound9)
audio9.load()
const audio10 = new Audio(sound10)
audio10.load()

const selectedSound = ref('sound2')

function playSound() {
  let soundFile

  switch (selectedSound.value) {
    case 'sound1':
      soundFile = sound1
      break
    case 'sound2':
      soundFile = sound2
      break
    case 'sound3':
      soundFile = sound3
      break
    case 'sound4':
      soundFile = sound4
      break
    case 'sound5':
      soundFile = sound5
      break
    case 'sound6':
      soundFile = sound6
      break
    case 'sound7':
      soundFile = sound7
      break
    case 'sound8':
      soundFile = sound8
      break
    case 'sound9':
      soundFile = sound9
      break
    case 'sound10':
      soundFile = sound10
      break
    default:
      console.error('Invalid sound selection:', selectedSound.value)
      return
  }

  const audio = new Audio(soundFile)
  audio.play()
}

function onSoundSelect() {
  playSound()
  localStorage.setItem('selectedSound', selectedSound.value)
}

// MENU ===============================================
const menu = ref(null)

let isMobileMenuOpen = ref(false)

onClickOutside(menu, () => (isMobileMenuOpen.value = false))

let sender = null
let socket = null
const isRunning = ref(false)
const buttonText = ref('Start')

const tickers = ['FXSUSDT']
const alerts = ref([])

const openDom = (symbol, domNumber) => {
  try {
    sender.send(JSON.stringify({ ticker: symbol, btn: 'dom' + domNumber }))
  } catch (error) {
    console.log('Send msg error. Check connection to autoclicker.')
  }
}

// MAIN ===============================================
const isDark = ref(false)
const selectedDirection = ref('long')
const logLimit = ref(20)
const tickersList = ref('BTCUSDT,100\nETHUSDT,100')

const createStreams = () => {
  let url = 'wss://fstream.binance.com/stream?streams='

  tickers.forEach((element) => {
    url += `${element.toLowerCase()}@aggTrade/`
  })
  socket = new WebSocket(url)
  socket.addEventListener('message', (event) => {
    const res = JSON.parse(event.data).data

    const date = new Date(res.T)
    let h = date.getHours()
    let m = date.getMinutes()
    let s = date.getSeconds()

    const quoteSize = (res.q * res.p).toFixed()

    if (quoteSize >= 100) {
      playSound()
      alerts.value.unshift({
        symbol: res.s,
        size: quoteSize,
        time: `${(h = h < 10 ? '0' + h : h)}:${(m =
          m < 10 ? '0' + m : m)}:${(s = s < 10 ? '0' + s : s)}`,
      })
    }
    if (alerts.value.length > 20) {
      alerts.value.pop()
    }
  })
}

function onLogLimitChange() {
  localStorage.setItem('logLimit', logLimit.value)
}

function onDirectionSelect() {
  localStorage.setItem('selectedDirection', selectedDirection.value)
}

function onTickersList() {
  localStorage.setItem('tickersList', tickersList.value)
}

const startStop = () => {
  if (!isRunning.value) {
    sender = new WebSocket('ws://localhost:22022')
    createStreams()
    isRunning.value = true
    buttonText.value = 'Stop'
  } else {
    socket.close()
    isRunning.value = false
    buttonText.value = 'Start'
  }
}

const switchToDark = () => {
  isDark.value
    ? document.documentElement.setAttribute('data-theme', 'light')
    : document.documentElement.setAttribute('data-theme', 'dark')

  isDark.value = !isDark.value
  localStorage.setItem('is-dark', isDark.value.toString())
}

onMounted(() => {
  const storedTheme = localStorage.getItem('is-dark')
  if (storedTheme) {
    if (storedTheme === 'true') {
      document.documentElement.setAttribute('data-theme', 'dark')
      isDark.value = true
    }
  }

  const storedSound = localStorage.getItem('selectedSound')
  if (storedSound) {
    selectedSound.value = storedSound
  }

  const storedDirection = localStorage.getItem('selectedDirection')
  if (storedDirection) {
    selectedDirection.value = storedDirection
  }

  const storedLogLimit = localStorage.getItem('logLimit')
  if (storedLogLimit) {
    logLimit.value = storedLogLimit
  }

  const storedTickersList = localStorage.getItem('tickersList')
  if (storedTickersList) {
    tickersList.value = storedTickersList
  }
})

onBeforeUnmount(() => {
  sender.close()
  socket.close()
})
</script>

<template>
  <!-- Show menu button -->
  <button
    v-if="!isMobileMenuOpen"
    @click="isMobileMenuOpen = true"
    class="menu-btn"
  >
    <IconMenu />
  </button>
  <!-- Hide menu button -->
  <button
    v-if="isMobileMenuOpen"
    @click="isMobileMenuOpen = false"
    class="menu-btn"
  >
    <IconClose />
  </button>
  <!-- Mobile menu -->
  <div class="menu-bg" :class="{ 'show-bg': isMobileMenuOpen }"></div>
  <div class="mobile-menu" :class="{ 'is-open': isMobileMenuOpen }" ref="menu">
    <span><button @click="switchToDark">Switch theme</button></span>
    <span>
      Log limit
      <input type="text" v-model="logLimit" @change="onLogLimitChange" />
    </span>
    <span>
      <select v-model="selectedDirection" @change="onDirectionSelect">
        <option value="long">Long</option>
        <option value="short">Short</option>
        <option value="any">Any</option>
      </select>
    </span>
    <span>
      <select v-model="selectedSound" @change="onSoundSelect">
        <option value="sound1">Sound 1</option>
        <option value="sound2">Sound 2</option>
        <option value="sound3">Sound 3</option>
        <option value="sound4">Sound 4</option>
        <option value="sound5">Sound 5</option>
        <option value="sound6">Sound 6</option>
        <option value="sound7">Sound 7</option>
        <option value="sound8">Sound 8</option>
        <option value="sound9">Sound 9</option>
        <option value="sound10">Sound 10</option>
      </select>
    </span>
    <span>
      <textarea v-model="tickersList" @change="onTickersList"></textarea>
    </span>
  </div>

  <div class="header">
    <button @click="startStop">{{ buttonText }}</button>
  </div>

  <div class="alerts-log">
    <ul>
      <li v-for="alert in alerts" :key="alert">
        <div class="list-item">
          <div class="readings">
            <span class="name">{{ alert.symbol }}</span>
            <span class="size">{{ alert.size }}</span>
            <span class="time">{{ alert.time }}</span>
          </div>
          <div class="buttons">
            <div class="dom-btn" @click="openDom(alert.symbol, 1)">1</div>
            <div class="dom-btn" @click="openDom(alert.symbol, 2)">2</div>
            <div class="dom-btn" @click="openDom(alert.symbol, 3)">3</div>
            <div class="dom-btn" @click="openDom(alert.symbol, 4)">4</div>
          </div>
        </div>
      </li>
    </ul>
  </div>
</template>

<style lang="scss" scoped>
button {
  margin: 8px;
  padding: 4px 8px;
  background: none;
  color: var(--text-color);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    background: var(--button-bg-hover);
  }
}

select {
  margin: 5px 0 0 5px;
  z-index: 10;
  color: var(--text-color);
  background: transparent;
  border: none;
  outline: none;

  option {
    color: var(--select-options-text-color);

    &:hover {
      background: var(--content-bg);
    }
  }
}

ul {
  list-style-type: none;
  margin: 0;
  padding: 0;
}

.header {
  display: flex;
  justify-content: space-between;

  button {
    padding: 8px 16px;
  }
}

.list-item {
  display: flex;
  flex-direction: column;
  padding: 8px;
  border-bottom: 1px solid var(--border-color);

  &:hover {
    background: var(--content-bg-hover);
  }

  .readings {
    display: flex;
    justify-content: space-between;
    padding: 8px 0;
    // margin-bottom: 8px;
  }

  .buttons {
    display: flex;
    gap: 5px;
    margin: 8px 0;

    .dom-btn {
      width: 25%;
      height: 35px;
      text-align: center;
      vertical-align: middle;
      line-height: 35px;
      // border: 1px solid var(--border-color);
      background: var(--button-bg);
      cursor: pointer;
      border-radius: 5px;

      &:hover {
        background: var(--button-bg-hover);
        border: 1px solid var(--border-color);
      }
    }
  }
}

.menu-btn {
  color: var(--text-color);
  position: absolute;
  right: 0;
  border: none;
  background: none;
  z-index: 40;
  cursor: pointer;
  padding-top: 3px;
}

.menu-bg {
  position: fixed;
  top: 0;
  left: 0;
  opacity: 0;
  transition: 0.25s;
  width: 100vw;
  height: 100vh;
  z-index: 0;
  background-color: var(--color-popup-overlay);
  display: flex;
  justify-content: center;
}
.mobile-menu {
  position: fixed;
  top: 0;
  right: 0;
  width: 200px;
  height: 100%;
  z-index: 30;
  background-color: var(--body-bg);
  padding-top: 3rem;
  opacity: 0;
  transform: translateX(100%);
  transition: 0.25s;

  span {
    display: block;
    padding: 0.5rem;
    color: var(--text-color);
    text-decoration: none;
    text-align: center;
    transition: 0.25s;
    cursor: pointer;

    &:hover {
      background-color: var(--button-bg-hover);
      transition: 0.25s;
    }

    input {
      width: 40px;
      text-align: center;
      background: var(--body-bg);
      outline: none;
      color: var(--text-color);
      border-top-style: hidden;
      border-right-style: hidden;
      border-left-style: hidden;
      border-bottom-style: hidden;
      border: 1px solid var(--border-color);
      border-radius: 4px;
      margin-left: 8px;
      padding: 4px;
    }

    textarea {
      width: 160px;
      height: 250px;
      background: var(--body-bg);
      outline: none;
      color: var(--text-color);
      border: 1px solid var(--border-color);
      border-radius: 4px;
      box-sizing: border-box;
      padding: 8px;
      text-align: center;
    }
  }
}

.is-open {
  opacity: 1;
  transform: translateY(0);
}

.show-bg {
  transition: 0.25s;
  opacity: 1;
  z-index: 25;
}
</style>
