import { watch, computed } from 'vue'
import axios from 'axios'
import store from '@/store'
import { log, logCalc, logCalcMode2 } from './log'
import { acc, accCalc, accCalcMode2, cleaner } from './acc'

let futSocket = null
let futInterval = null
let spotSocket = null
let spotInterval = null
let cleanerInterval = null
let sender = null
let tickers = {}

const exceptions = ['BTCUSDT', 'ETHUSDT', 'BTCBUSD', 'ETHBUSD']

// All market tickers
const getMarketTickers = async () => {
  try {
    const res = await axios.get('https://fapi.binance.com/fapi/v1/ticker/price')

    if (store.state.useAllMarket) {
      res.data.forEach((element) => {
        if (
          !element.symbol.includes('_') &&
          !element.symbol.includes('DOM') &&
          !exceptions.includes(element.symbol)
        ) {
          tickers[element.symbol] = store.state.allMarketSize
        }
      })
    } else {
      // *
    }
  } catch (error) {
    console.error(error)
  }
}

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
      log(res, 'F')
      acc(res, 'F')
    }
  })

  futInterval = setInterval(() => {
    if (
      store.state.selectedMarket == 'fut' ||
      store.state.selectedMarket == 'both'
    ) {
      if (store.state.sizeMode == 'sizeMode1') {
        logCalc(tickers, 'F')
        accCalc(tickers, 'F')
      }
      if (store.state.sizeMode == 'sizeMode2') {
        logCalcMode2(tickers, 'F')
        accCalcMode2(tickers, 'F')
      }
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
      log(res, 'S')
      acc(res, 'S')
    }
  })

  spotInterval = setInterval(() => {
    if (
      store.state.selectedMarket == 'spot' ||
      store.state.selectedMarket == 'both'
    ) {
      if (store.state.sizeMode == 'sizeMode1') {
        logCalc(tickers, 'S')
        accCalc(tickers, 'S')
      }
      if (store.state.sizeMode == 'sizeMode2') {
        logCalcMode2(tickers, 'S')
        accCalcMode2(tickers, 'S')
      }
    }
  }, store.state.aggTime)
}

// Stop FUT stream
const stoptFut = () => {
  futSocket.close()
  clearInterval(futInterval)
  clearInterval(cleanerInterval)
}

// Stop SPOT stream
const stoptSpot = () => {
  spotSocket.close()
  clearInterval(spotInterval)
  clearInterval(cleanerInterval)
}

// Start Sender stream
const startSender = () => {
  sender = new WebSocket('ws://localhost:22022')
}

// Stop Sender stream
const stopSender = () => {
  sender.close()
}

// Cleaner
cleanerInterval = setInterval(() => {
  cleaner()
}, store.state.aggTime)

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
  getMarketTickers,
  startFut,
  startSpot,
  stoptFut,
  stoptSpot,
  startSender,
  stopSender,
  openDom,
}
