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
      selectedLogSound: 'sound3',
      playAccAlerts: true,
      selectedAccSound: 'sound4',
      useAllMarket: true,
      sizeMode: 'sizeMode2',
      allMarketSize: 50,
      tickersList: 'BTCUSDT,0\nETHUSDT,0',
      exceptions: 'BTCUSDT\nETHUSDT\nBTCBUSD\nETHBUSD',
      commonLogAlerts: [],
      commonAccAlerts: {},
    }
  },
  mutations: {
    initialiseStore() {
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
