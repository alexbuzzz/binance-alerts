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
      selectedSound: 'sound2',
      tickersList: 'BTCUSDT,100\nETHUSDT,100',
      commonLogAlerts: [],
      commonAccAlerts: {
        // ADAUSDTFL: [1677500050, 1677500050, 1677500050],
        // BTCUSDTFS: [1677500050, 1677500050, 1677500050, 1677500050],
      },
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

    playSound(state) {
      play(state.selectedSound)
    },
  },
})

export default store
