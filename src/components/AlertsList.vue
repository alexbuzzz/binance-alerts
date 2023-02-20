<script setup>
import {
  ref,
  watch,
  onBeforeUnmount,
  onBeforeMount,
  onMounted,
  reactive,
} from 'vue'
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

const openDom = (symbol, domNumber) => {
  try {
    sender.send(
      JSON.stringify({
        ticker: symbol.replace('USDT', ''),
        btn: 'dom' + domNumber,
      })
    )
  } catch (error) {
    console.log('Send msg error. Check connection to autoclicker.')
  }
}

// MAIN ===============================================
let futSocket = null
let spotSocket = null
let futInterval = null
let spotInterval = null
const isRunning = ref(false)
const isDark = ref(false)
const buttonText = ref('Start')
const selectedDirection = ref('any')
const selectedMarket = ref('both')
const logLimit = ref(20)
const aggTime = ref(1000)
const alerts = ref([])
const showClickerButtons = ref(false)
const tickersList = ref('BTCUSDT,100\nETHUSDT,100')

// Convert textarea to object
const tickers = {}

function createTickersObject() {
  tickersList.value.split('\n').forEach((pair) => {
    const [key, value] = pair.split(',')
    tickers[key] = Number(value)
  })
}

watch(tickersList, () => {
  createTickersObject()
})

const createStreams = () => {
  let tempFutData = {}
  let tempSpotData = {}

  // FUT stream
  let futUrl = 'wss://fstream.binance.com/stream?streams='

  Object.keys(tickers).forEach((key) => {
    futUrl += `${key.toLowerCase()}@aggTrade/`
  })

  futSocket = new WebSocket(futUrl)
  futSocket.addEventListener('message', (event) => {
    if (selectedMarket.value == 'fut' || selectedMarket.value == 'both') {
      // *
      const res = JSON.parse(event.data).data
      const symbol = res.s
      const price = res.p
      const size = res.q
      let quoteSize = Math.round((size * price) / 1000)

      // Format long/short
      if (res.m === true) {
        quoteSize = quoteSize * -1
      }

      // Fill up an object
      if (tempFutData[symbol]) {
        tempFutData[symbol].push({ size: quoteSize, price: price })
      } else {
        tempFutData[symbol] = [{ size: quoteSize, price: price }]
      }
    }
  })

  // *
  if (selectedMarket.value == 'fut' || selectedMarket.value == 'both') {
    futInterval = setInterval(() => {
      const directions = {}

      // Define directions
      Object.keys(tempFutData).forEach((key) => {
        if (
          tempFutData[key][0].price <=
          tempFutData[key][tempFutData[key].length - 1].price
        ) {
          directions[key] = 'long'
        } else {
          directions[key] = 'short'
        }
      })

      // Take and summ trades with specific direction
      Object.keys(tempFutData).forEach((key) => {
        if (
          directions[key] == 'long' &&
          (selectedDirection.value == 'long' ||
            selectedDirection.value == 'any')
        ) {
          const sum = tempFutData[key].reduce((acc, val) => {
            if (val.size > 0) {
              return acc + val.size
            } else {
              return acc
            }
          }, 0)

          if (sum >= tickers[key]) {
            const date = new Date()
            let h = date.getHours()
            let m = date.getMinutes()
            let s = date.getSeconds()

            playSound()

            alerts.value.unshift({
              symbol: key,
              size: sum,
              direction: 'L',
              market: 'F',
              time: `${(h = h < 10 ? '0' + h : h)}:${(m =
                m < 10 ? '0' + m : m)}:${(s = s < 10 ? '0' + s : s)}`,
            })
          }
        }

        if (
          directions[key] == 'short' &&
          (selectedDirection.value == 'short' ||
            selectedDirection.value == 'any')
        ) {
          const sum = Math.abs(
            tempFutData[key].reduce((acc, val) => {
              if (val.size <= 0) {
                return acc - val.size
              } else {
                return acc
              }
            }, 0)
          )
          if (sum >= tickers[key]) {
            const date = new Date()
            let h = date.getHours()
            let m = date.getMinutes()
            let s = date.getSeconds()

            playSound()

            alerts.value.unshift({
              symbol: key,
              size: sum,
              direction: 'S',
              market: 'F',
              time: `${(h = h < 10 ? '0' + h : h)}:${(m =
                m < 10 ? '0' + m : m)}:${(s = s < 10 ? '0' + s : s)}`,
            })

            if (alerts.value.length > logLimit.value) {
              alerts.value = alerts.value.slice(0, logLimit.value)
            }
          }
        }
      })

      tempFutData = {}
    }, aggTime.value)
  }

  // SPOT stream
  let spotUrl = 'wss://stream.binance.com:9443/stream?streams='

  Object.keys(tickers.replace('1000', '').replace('2', '')).forEach((key) => {
    spotUrl += `${key.toLowerCase()}@aggTrade/`
  })
  spotUrl = spotUrl.slice(0, -1)

  spotSocket = new WebSocket(spotUrl)
  spotSocket.addEventListener('message', (event) => {
    if (selectedMarket.value == 'spot' || selectedMarket.value == 'both') {
      // *
      const res = JSON.parse(event.data).data
      const symbol = res.s
      const price = res.p
      const size = res.q
      let quoteSize = Math.round((size * price) / 1000)

      // Format long/short
      if (res.m === true) {
        quoteSize = quoteSize * -1
      }

      // Fill up an object
      if (tempSpotData[symbol]) {
        tempSpotData[symbol].push({ size: quoteSize, price: price })
      } else {
        tempSpotData[symbol] = [{ size: quoteSize, price: price }]
      }
    }
  })

  // *
  if (selectedMarket.value == 'spot' || selectedMarket.value == 'both') {
    spotInterval = setInterval(() => {
      const directions = {}

      // Define directions
      Object.keys(tempSpotData).forEach((key) => {
        if (
          tempSpotData[key][0].price <=
          tempSpotData[key][tempSpotData[key].length - 1].price
        ) {
          directions[key] = 'long'
        } else {
          directions[key] = 'short'
        }
      })

      // Take and summ trades with specific direction
      Object.keys(tempSpotData).forEach((key) => {
        if (
          directions[key] == 'long' &&
          (selectedDirection.value == 'long' ||
            selectedDirection.value == 'any')
        ) {
          const sum = tempSpotData[key].reduce((acc, val) => {
            if (val.size > 0) {
              return acc + val.size
            } else {
              return acc
            }
          }, 0)

          if (sum >= tickers[key]) {
            const date = new Date()
            let h = date.getHours()
            let m = date.getMinutes()
            let s = date.getSeconds()

            playSound()

            alerts.value.unshift({
              symbol: key,
              size: sum,
              direction: 'L',
              market: '',
              time: `${(h = h < 10 ? '0' + h : h)}:${(m =
                m < 10 ? '0' + m : m)}:${(s = s < 10 ? '0' + s : s)}`,
            })
          }
        }

        if (
          directions[key] == 'short' &&
          (selectedDirection.value == 'short' ||
            selectedDirection.value == 'any')
        ) {
          const sum = Math.abs(
            tempSpotData[key].reduce((acc, val) => {
              if (val.size <= 0) {
                return acc - val.size
              } else {
                return acc
              }
            }, 0)
          )
          if (sum >= tickers[key]) {
            const date = new Date()
            let h = date.getHours()
            let m = date.getMinutes()
            let s = date.getSeconds()

            playSound()

            alerts.value.unshift({
              symbol: key,
              size: sum,
              direction: 'S',
              market: '',
              time: `${(h = h < 10 ? '0' + h : h)}:${(m =
                m < 10 ? '0' + m : m)}:${(s = s < 10 ? '0' + s : s)}`,
            })

            if (alerts.value.length > logLimit.value) {
              alerts.value = alerts.value.slice(0, logLimit.value)
            }
          }
        }
      })

      tempSpotData = {}
    }, aggTime.value)
  }
}

function onLogLimitChange() {
  localStorage.setItem('logLimit', logLimit.value)
}

function onAggTimeChange() {
  localStorage.setItem('aggTime', aggTime.value)
}

function onDirectionSelect() {
  localStorage.setItem('selectedDirection', selectedDirection.value)
}

function onMarketSelect() {
  localStorage.setItem('selectedMarket', selectedMarket.value)
}

function onTickersList() {
  localStorage.setItem('tickersList', tickersList.value)
}

const startStop = () => {
  if (!isRunning.value) {
    createStreams()
    isRunning.value = true
    buttonText.value = 'Stop'
  } else {
    futSocket.close()
    spotSocket.close()
    clearInterval(futInterval)
    clearInterval(spotInterval)
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

const showButtons = () => {
  localStorage.setItem('showClickerButtons', showClickerButtons.value)
}

onBeforeMount(() => {
  const storedTheme = localStorage.getItem('is-dark')
  if (storedTheme) {
    if (storedTheme === 'true') {
      document.documentElement.setAttribute('data-theme', 'dark')
      isDark.value = true
    }
  }

  const storedCheckbox = localStorage.getItem('showClickerButtons')
  if (storedCheckbox) {
    if (storedCheckbox === 'true') {
      showClickerButtons.value = storedCheckbox
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

  const storedMarket = localStorage.getItem('selectedMarket')
  if (storedMarket) {
    selectedMarket.value = storedMarket
  }

  const storedLogLimit = localStorage.getItem('logLimit')
  if (storedLogLimit) {
    logLimit.value = storedLogLimit
  }

  const storedAggTime = localStorage.getItem('aggTime')
  if (storedAggTime) {
    aggTime.value = storedAggTime
  }

  const storedTickersList = localStorage.getItem('tickersList')
  if (storedTickersList) {
    tickersList.value = storedTickersList
  }
})

onBeforeUnmount(() => {
  sender.close()
  futSocket.close()
  clearInterval(futInterval)
  clearInterval(spotInterval)
  spotSocket.close()
})

onMounted(() => {
  sender = new WebSocket('ws://localhost:22022')
})

const copyToClipboard = (symbol) => {
  const dummy = document.createElement('textarea')
  document.body.appendChild(dummy)
  dummy.value = symbol
  dummy.select()
  document.execCommand('copy')
  document.body.removeChild(dummy)
}
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
      Show buttons
      <input
        type="checkbox"
        v-model="showClickerButtons"
        @change="showButtons"
      />
    </span>
    <span>
      Log limit
      <input type="text" v-model="logLimit" @input="onLogLimitChange" />
    </span>
    <span>
      Agg time
      <input type="text" v-model="aggTime" @input="onAggTimeChange" />
    </span>
    <span>
      <select v-model="selectedDirection" @change="onDirectionSelect">
        <option value="long">Long</option>
        <option value="short">Short</option>
        <option value="any">Any</option>
      </select>
    </span>
    <span>
      <select v-model="selectedMarket" @change="onMarketSelect">
        <option value="fut">FUT</option>
        <option value="spot">SPOT</option>
        <option value="both">BOTH</option>
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
      <textarea v-model="tickersList" @input="onTickersList"></textarea>
    </span>
  </div>

  <div class="header">
    <button @click="startStop">{{ buttonText }}</button>
  </div>

  <div class="alerts-log">
    <ul>
      <li v-for="alert in alerts" :key="alert">
        <div class="list-item" @click="copyToClipboard(alert.symbol)">
          <div class="readings">
            <span class="name">{{ alert.symbol }} {{ alert.market }}</span>
            <span class="size">{{ alert.size }}K</span>
            <span
              class="direction"
              v-if="alert.direction === 'L'"
              style="color: green"
              >{{ alert.direction }}</span
            >
            <span class="direction" v-else style="color: red">{{
              alert.direction
            }}</span>
            <span class="time">{{ alert.time }}</span>
          </div>
          <div class="buttons" v-if="showClickerButtons">
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

input[type='checkbox'] {
  transform: scale(1.4);
  vertical-align: middle;
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
  cursor: pointer;

  &:hover {
    background: var(--content-bg-hover);
  }

  .readings {
    display: flex;
    justify-content: space-between;
    padding: 8px 0;
    gap: 8px;
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
      background: var(--button-bg);
      border-radius: 5px;

      &:hover {
        background: var(--button-bg-hover);
      }
    }

    .copy-btn {
      width: 100%;
      height: 35px;
      text-align: center;
      vertical-align: middle;
      line-height: 35px;
      background: var(--button-bg);
      border-radius: 5px;

      &:hover {
        background: var(--button-bg-hover);
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
