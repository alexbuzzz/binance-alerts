import { watch, computed } from 'vue'
import store from '@/store'
import { futLog, futLogCalc } from './futLog'

let futSocket = null
let futInterval = null
let spotSocket = null
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

  let futUrl = 'wss://fstream.binance.com/stream?streams='

  Object.keys(tickers).forEach((key) => {
    futUrl += `${key.toLowerCase()}@aggTrade/`
  })

  futSocket = new WebSocket(futUrl)

  futSocket.addEventListener('message', (event) => {
    if (
      store.state.selectedMarket == 'fut' ||
      store.state.selectedMarket == 'both'
    ) {
      const res = JSON.parse(event.data).data
      futLog(res)
    }
  })

  futInterval = setInterval(() => {
    if (
      store.state.selectedMarket == 'fut' ||
      store.state.selectedMarket == 'both'
    ) {
      futLogCalc(tickers)
    }
  }, store.state.aggTime)
}

const startSpot = () => {
  console.log('startSpot')
}

const stoptFut = () => {
  console.log('stoptFut')
  futSocket.close()
  clearInterval(futInterval)
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
