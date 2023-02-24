import { createStore } from 'vuex'
import play from '@/tape-alerts/sound'

const store = createStore({
  state() {
    return {
      logHeight: '100px',
      isDark: false,
      showClickerButtons: true,
      logLimit: 20,
      aggTime: 500,
      selectedDirection: 'any',
      selectedMarket: 'both',
      selectedSound: 'sound2',
      tickersList: 'BTCUSDT,100\nETHUSDT,100',
      alertLogList: [],
      alertAccList: [],
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

    copyToClipboard(symbol) {
      const dummy = document.createElement('textarea')
      document.body.appendChild(dummy)
      dummy.value = symbol
      dummy.select()
      document.execCommand('copy')
      document.body.removeChild(dummy)
    },
  },
})

export default store
