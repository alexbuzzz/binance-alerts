import { watch, computed } from 'vue'
import store from '@/store'
import { futLog, futLogCalc } from './futLog'
import { spotLog, spotLogCalc } from './spotLog'

let futSocket = null
let futInterval = null
let spotSocket = null
let spotInterval = null
let sender = null

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

// Start FUT stream
const startFut = () => {
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

// Start SPOT stream
const startSpot = () => {
  let spotUrl = 'wss://stream.binance.com:9443/stream?streams='

  Object.keys(tickers).forEach((key) => {
    spotUrl += `${key
      .replace('1000', '')
      .replace('2', '')
      .toLowerCase()}@aggTrade/`
  })
  spotUrl = spotUrl.slice(0, -1)

  spotSocket = new WebSocket(spotUrl)

  spotSocket.addEventListener('message', (event) => {
    if (
      store.state.selectedMarket == 'spot' ||
      store.state.selectedMarket == 'both'
    ) {
      const res = JSON.parse(event.data).data
      spotLog(res)
    }
  })

  spotInterval = setInterval(() => {
    if (
      store.state.selectedMarket == 'spot' ||
      store.state.selectedMarket == 'both'
    ) {
      spotLogCalc(tickers)
    }
  }, store.state.aggTime)
}

// Stop FUT stream
const stoptFut = () => {
  futSocket.close()
  clearInterval(futInterval)
}

// Stop SPOT stream
const stoptSpot = () => {
  spotSocket.close()
  clearInterval(spotInterval)
}

// Start Sender stream
const startSender = () => {
  sender = new WebSocket('ws://localhost:22022')
}

// Stop Sender stream
const stopSender = () => {
  sender.close()
}

// Sender
const openDom = (symbol, domNumber) => {
  try {
    sender.send(
      JSON.stringify({
        ticker: symbol.replace('USDT', ''),
        btn: 'dom' + domNumber,
      })
    )
  } catch (error) {
    console.log('Send msg error. Check connection with autoclicker.')
  }
}

export default {
  startFut,
  startSpot,
  stoptFut,
  stoptSpot,
  startSender,
  stopSender,
  openDom,
}
