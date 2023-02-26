import { createStore } from 'vuex'
import play from '@/tape-alerts/sound'

const store = createStore({
  state() {
    return {
      logHeight: '100px',
      isDark: false,
      showClickerButtons: true,
      aggTime: 500,
      selectedDirection: 'any',
      selectedMarket: 'both',
      selectedSound: 'sound2',
      tickersList: 'BTCUSDT,100\nETHUSDT,100',
      commonLogAlerts: [],
      commonAccAlerts: [
        {
          symbol: 'ADAUSDT',
          time: '00000000',
          market: 'F',
          direction: 'L',
          count: 2,
        },
      ],
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
