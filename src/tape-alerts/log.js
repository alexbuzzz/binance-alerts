import store from '@/store'
import playSound from './sound'

let commonLogAlerts = store.state.commonLogAlerts

let tempData = {}

const log = (res) => {
  const symbol = res.s
  const price = res.p
  const size = res.q
  let quoteSize = Math.round((size * price) / 1000)

  // Format long/short
  if (res.m === true) {
    quoteSize = quoteSize * -1
  }
  // Fill up an object
  if (tempData[symbol]) {
    tempData[symbol].push({ size: quoteSize, price: price })
  } else {
    tempData[symbol] = [{ size: quoteSize, price: price }]
  }
}

const logCalc = (tickers, market) => {
  const directions = {}

  // Define directions
  Object.keys(tempData).forEach((key) => {
    if (
      tempData[key][0].price <= tempData[key][tempData[key].length - 1].price
    ) {
      directions[key] = 'long'
    } else {
      directions[key] = 'short'
    }
  })

  // Take and summ trades with specific direction
  Object.keys(tempData).forEach((key) => {
    if (
      directions[key] == 'long' &&
      (store.state.selectedDirection == 'long' ||
        store.state.selectedDirection == 'any')
    ) {
      const sum = tempData[key].reduce((acc, val) => {
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

        playSound(store.state.selectedLogSound)

        commonLogAlerts.unshift({
          symbol: key,
          size: sum,
          direction: 'L',
          market: market,
          time: `${(h = h < 10 ? '0' + h : h)}:${(m =
            m < 10 ? '0' + m : m)}:${(s = s < 10 ? '0' + s : s)}`,
        })
      }
    }

    if (
      directions[key] == 'short' &&
      (store.state.selectedDirection == 'short' ||
        store.state.selectedDirection == 'any')
    ) {
      const sum = Math.abs(
        tempData[key].reduce((acc, val) => {
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

        playSound(store.state.selectedLogSound)

        commonLogAlerts.unshift({
          symbol: key,
          size: sum,
          direction: 'S',
          market: market,
          time: `${(h = h < 10 ? '0' + h : h)}:${(m =
            m < 10 ? '0' + m : m)}:${(s = s < 10 ? '0' + s : s)}`,
        })

        if (commonLogAlerts.length > store.state.logLimit) {
          commonLogAlerts.splice(100)
        }
      }
    }
  })

  tempData = {}
}

export { log, logCalc }
