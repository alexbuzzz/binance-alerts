import { createStore } from 'vuex'
import play from '@/tape-alerts/sound'

const store = createStore({
  state() {
    return {
      logHeight: '100px',
      isDark: false,
      showClickerButtons: true,
      aggTime: 500,
      removeAfter: 5,
      selectedDirection: 'any',
      selectedMarket: 'both',
      playLogAlerts: true,
      selectedLogSound: 'sound2',
      playAccAlerts: true,
      selectedAccSound: 'sound2',
      useAllMarket: true,
      allMarketSize: 100,
      tickersList: 'BTCUSDT,100\nETHUSDT,100',
      exceptions: 'BTCUSDT,100\nETHUSDT,100\nBTCBUSD,100\nETHBUSD,100',
      commonLogAlerts: [],
      commonAccAlerts: {},
    }
  },
  mutations: {
    initialiseStore(state) {
      const savedState = JSON.parse(localStorage.getItem('store'))

      if (savedState) {
        store.replaceState(Object.assign(savedState))
      }
    },

    saveSettings() {
      localStorage.setItem('store', JSON.stringify(this.state))
    },

    playLogSound(state) {
      play(state.selectedLogSound)
    },

    playAccSound(state) {
      play(state.selectedAccSound)
    },
  },
})

export default store
