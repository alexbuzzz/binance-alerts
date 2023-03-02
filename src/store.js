import { createStore } from 'vuex'
import play from '@/tape-alerts/sound'

const store = createStore({
  state() {
    return {
      settings: {
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
      },
      commonLogAlerts: [],
      commonAccAlerts: {},
    }
  },
  mutations: {
    initialiseStore() {
      const savedState = JSON.parse(localStorage.getItem('settings'))

      if (savedState) {
        this.state.settings = savedState
      }
    },

    saveSettings() {
      localStorage.setItem('settings', JSON.stringify(this.state.settings))
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
