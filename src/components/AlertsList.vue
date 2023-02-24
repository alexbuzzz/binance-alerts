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
  futSocket.close()
  clearInterval(futInterval)
  clearInterval(spotInterval)
  spotSocket.close()
})

onMounted(() => {
  sender = new WebSocket('ws://localhost:22022')
})
</script>

<template>
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
</style>
