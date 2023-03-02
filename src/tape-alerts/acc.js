import store from '@/store'

let commonAccAlerts = store.state.commonAccAlerts

let tempData = {
  F: {},
  S: {},
}

const acc = (res, market) => {
  const symbol = res.s
  const price = res.p
  const size = res.q
  let quoteSize = Math.round((size * price) / 1000)

  // Format long/short
  if (res.m === true) {
    quoteSize = quoteSize * -1
  }
  // Fill up an object
  if (tempData[market][symbol]) {
    tempData[market][symbol].push({ size: quoteSize, price: price })
  } else {
    tempData[market][symbol] = [{ size: quoteSize, price: price }]
  }
}

const accCalc = (tickers, market) => {
  const directions = {}

  // Define directions
  Object.keys(tempData[market]).forEach((key) => {
    if (
      tempData[market][key][0].price <=
      tempData[market][key][tempData[market][key].length - 1].price
    ) {
      directions[key] = 'long'
    } else {
      directions[key] = 'short'
    }
  })

  // Take and summ trades with specific direction
  Object.keys(tempData[market]).forEach((key) => {
    if (
      directions[key] == 'long' &&
      (store.state.settings.selectedDirection == 'long' ||
        store.state.settings.selectedDirection == 'any')
    ) {
      const sum = tempData[market][key].reduce((acc, val) => {
        if (val.size > 0) {
          return acc + val.size
        } else {
          return acc
        }
      }, 0)

      if (sum >= tickers[key]) {
        const date = new Date()
        let t = date.getTime()

        // Fill up an object
        if (commonAccAlerts[key + market + 'L']) {
          commonAccAlerts[key + market + 'L'].push(t)
        } else {
          commonAccAlerts[key + market + 'L'] = [t]
        }
      }
    }

    if (
      directions[key] == 'short' &&
      (store.state.settings.selectedDirection == 'short' ||
        store.state.settings.selectedDirection == 'any')
    ) {
      const sum = Math.abs(
        tempData[market][key].reduce((acc, val) => {
          if (val.size < 0) {
            return acc - val.size
          } else {
            return acc
          }
        }, 0)
      )

      if (sum >= tickers[key]) {
        const date = new Date()
        let t = date.getTime()

        // Fill up an object
        if (commonAccAlerts[key + market + 'S']) {
          commonAccAlerts[key + market + 'S'].push(t)
        } else {
          commonAccAlerts[key + market + 'S'] = [t]
        }
      }
    }
  })

  tempData[market] = {}
}

const accCalcMode2 = (tickers, market) => {
  Object.keys(tempData[market]).forEach((key) => {
    if (
      store.state.settings.selectedDirection == 'long' ||
      store.state.settings.selectedDirection == 'any'
    ) {
      const sum = tempData[market][key].reduce((acc, val) => {
        if (val.size > 0) {
          return acc + val.size
        } else {
          return acc
        }
      }, 0)

      if (sum >= tickers[key]) {
        const date = new Date()
        let t = date.getTime()

        // Fill up an object
        if (commonAccAlerts[key + market + 'L']) {
          commonAccAlerts[key + market + 'L'].push(t)
        } else {
          commonAccAlerts[key + market + 'L'] = [t]
        }
      }
    }

    if (
      store.state.settings.selectedDirection == 'short' ||
      store.state.settings.selectedDirection == 'any'
    ) {
      const sum = Math.abs(
        tempData[market][key].reduce((acc, val) => {
          if (val.size < 0) {
            return acc - val.size
          } else {
            return acc
          }
        }, 0)
      )

      if (sum >= tickers[key]) {
        const date = new Date()
        let t = date.getTime()

        // Fill up an object
        if (commonAccAlerts[key + market + 'S']) {
          commonAccAlerts[key + market + 'S'].push(t)
        } else {
          commonAccAlerts[key + market + 'S'] = [t]
        }
      }
    }
  })

  tempData[market] = {}
}

// Cleaner
const cleaner = () => {
  const date = new Date()
  const currTime = date.getTime()

  Object.keys(commonAccAlerts).forEach((key) => {
    const len = commonAccAlerts[key].length
    if (
      currTime - commonAccAlerts[key][len - 1] >=
      store.state.settings.removeAfter * 1000
    ) {
      commonAccAlerts[key].length = 0
    }
  })
}

export { acc, accCalc, accCalcMode2, cleaner }
