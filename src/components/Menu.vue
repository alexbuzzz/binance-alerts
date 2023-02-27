<script setup>
import { ref } from 'vue'
import IconMenu from './icons/IconMenu.vue'
import IconClose from './icons/IconClose.vue'
import { onClickOutside } from '@vueuse/core'
import store from '@/store'

const menu = ref(null)
let isMobileMenuOpen = ref(false)

onClickOutside(menu, () => (isMobileMenuOpen.value = false))

const switchToDark = () => {
  let isDark = store.state.isDark
  isDark
    ? document.documentElement.setAttribute('data-theme', 'light')
    : document.documentElement.setAttribute('data-theme', 'dark')

  store.state.isDark = !isDark
  store.commit('saveSettings')
}

const onLogSoundSelect = () => {
  store.commit('saveSettings')
  store.commit('playLogSound')
}

const onAccSoundSelect = () => {
  store.commit('saveSettings')
  store.commit('playAccSound')
}
</script>
<template>
  <!-- Show menu button -->
  <button
    v-if="!isMobileMenuOpen"
    @click="isMobileMenuOpen = true"
    class="menu-btn"
  >
    <IconMenu />
  </button>
  <!-- Hide menu button -->
  <button
    v-if="isMobileMenuOpen"
    @click="isMobileMenuOpen = false"
    class="menu-btn"
  >
    <IconClose />
  </button>
  <!-- Mobile menu -->
  <div class="mobile-menu" :class="{ 'is-open': isMobileMenuOpen }" ref="menu">
    <span><button @click="switchToDark">Switch theme</button></span>
    <span>
      Show buttons
      <input
        type="checkbox"
        v-model="store.state.showClickerButtons"
        @change="store.commit('saveSettings')"
      />
    </span>
    <span>
      Play log alerts
      <input
        type="checkbox"
        v-model="store.state.playLogAlerts"
        @change="store.commit('saveSettings')"
      />
    </span>
    <span>
      <select v-model="store.state.selectedLogSound" @change="onLogSoundSelect">
        <option value="sound1">Sound 1</option>
        <option value="sound2">Sound 2</option>
        <option value="sound3">Sound 3</option>
        <option value="sound4">Sound 4</option>
        <option value="sound5">Sound 5</option>
        <option value="sound6">Sound 6</option>
        <option value="sound7">Sound 7</option>
        <option value="sound8">Sound 8</option>
        <option value="sound9">Sound 9</option>
        <option value="sound10">Sound 10</option>
      </select>
    </span>
    <span>
      Play acc alerts
      <input
        type="checkbox"
        v-model="store.state.playAccAlerts"
        @change="store.commit('saveSettings')"
      />
    </span>
    <span>
      <select v-model="store.state.selectedAccSound" @change="onAccSoundSelect">
        <option value="sound1">Sound 1</option>
        <option value="sound2">Sound 2</option>
        <option value="sound3">Sound 3</option>
        <option value="sound4">Sound 4</option>
        <option value="sound5">Sound 5</option>
        <option value="sound6">Sound 6</option>
        <option value="sound7">Sound 7</option>
        <option value="sound8">Sound 8</option>
        <option value="sound9">Sound 9</option>
        <option value="sound10">Sound 10</option>
      </select>
    </span>
    <span>
      Agg time (ms)
      <input
        type="text"
        v-model="store.state.aggTime"
        @input="store.commit('saveSettings')"
      />
    </span>
    <span>
      Remove after (s)
      <input
        type="text"
        v-model="store.state.removeAfter"
        @input="store.commit('saveSettings')"
      />
    </span>
    <span>
      <select
        v-model="store.state.selectedDirection"
        @change="store.commit('saveSettings')"
      >
        <option value="long">Long</option>
        <option value="short">Short</option>
        <option value="any">Any</option>
      </select>
    </span>
    <span>
      <select
        v-model="store.state.selectedMarket"
        @change="store.commit('saveSettings')"
      >
        <option value="fut">FUT</option>
        <option value="spot">SPOT</option>
        <option value="both">BOTH</option>
      </select>
    </span>
    <span>
      Use all market
      <input
        type="checkbox"
        v-model="store.state.useAllMarket"
        @change="store.commit('saveSettings')"
      />
    </span>
    <span>
      All market size
      <input
        type="text"
        v-model="store.state.allMarketSize"
        @input="store.commit('saveSettings')"
      />
    </span>
    <span>
      Exceptions
      <textarea
        class="exceptions"
        v-model="store.state.exceptions"
        @input="store.commit('saveSettings')"
      ></textarea>
    </span>
    <span>
      Own tickers list
      <textarea
        class="tickers-list"
        v-model="store.state.tickersList"
        @input="store.commit('saveSettings')"
      ></textarea>
    </span>
  </div>
</template>
<style lang="scss" scoped>
select {
  margin: 5px 0 0 5px;
  z-index: 10;
  color: var(--text-color);
  background: transparent;
  border: none;
  outline: none;

  option {
    color: var(--select-options-text-color);

    &:hover {
      background: var(--content-bg);
    }
  }
}

.menu-btn {
  color: var(--text-color);
  position: absolute;
  right: 0;
  border: none;
  background: none;
  padding-top: 3px;
  z-index: 4;
}

.mobile-menu {
  position: fixed;
  top: 0;
  right: 0;
  width: 200px;
  height: 100%;
  overflow: scroll;
  background-color: var(--menu-background);
  padding-top: 3rem;
  opacity: 0;
  transform: translateX(100%);
  transition: 0.25s;
  z-index: 3;

  span {
    display: block;
    padding: 0.5rem;
    color: var(--text-color);
    text-decoration: none;
    text-align: center;
    transition: 0.25s;
    cursor: pointer;

    &:hover {
      background-color: var(--menu-background-hover);
      transition: 0.25s;
    }

    input {
      width: 40px;
      text-align: center;
      background: var(--menu-background);
      outline: none;
      color: var(--text-color);
      border-top-style: hidden;
      border-right-style: hidden;
      border-left-style: hidden;
      border-bottom-style: hidden;
      border: 1px solid var(--border-color);
      border-radius: 4px;
      margin-left: 8px;
      padding: 4px;
    }

    textarea {
      width: 160px;
      background: var(--menu-background);
      outline: none;
      color: var(--text-color);
      border: 1px solid var(--border-color);
      border-radius: 4px;
      box-sizing: border-box;
      padding: 8px;
      text-align: center;
      margin-top: 4px;
    }
    .exceptions {
      height: 100px;
    }
    .tickers-list {
      height: 250px;
    }
  }
}

.is-open {
  opacity: 1;
  transform: translateY(0);
}
</style>
