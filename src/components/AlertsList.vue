<script setup>
import {
  ref,
  watch,
  onBeforeUnmount,
  onBeforeMount,
  onMounted,
  reactive,
} from 'vue'

// SOUNDS ===============================================

// MAIN ===============================================

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

const createStreams = () => {
  let tempSpotData = {}

  // SPOT stream
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

onBeforeUnmount(() => {
  sender.close()

  clearInterval(spotInterval)
  spotSocket.close()
})

onMounted(() => {
  sender = new WebSocket('ws://localhost:22022')
})
</script>

<template>
  <div class="alerts-log"></div>
</template>

<style lang="scss" scoped></style>
