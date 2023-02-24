import { watch, computed } from 'vue'
import store from '@/store'

let futSocket = null
let spotSocket = null
let futInterval = null
let spotInterval = null

// Convert textarea to object
const tickersList = computed(() => store.state.tickersList)
const tickers = {}

const createTickersObject = (val) => {
  val.split('\n').forEach((pair) => {
    const [key, value] = pair.split(',')
    tickers[key] = Number(value)
  })
}

watch(tickersList, (newVal) => {
  createTickersObject(newVal)
})

// Streams
const startFut = () => {
  console.log('startFut')
  // console.log(store.state)
}

const startSpot = () => {
  console.log('startSpot')
}

const stoptFut = () => {
  console.log('stoptFut')
}

const stoptSpot = () => {
  console.log('stoptSpot')
}

// Sender
const startSender = () => {
  console.log('startSender')
}

const stopSender = () => {
  console.log('stopSender')
}

export default {
  startFut,
  startSpot,
  stoptFut,
  stoptSpot,
  startSender,
  stopSender,
}
