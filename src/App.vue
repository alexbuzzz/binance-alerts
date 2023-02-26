<script setup>
import AlertsLog from './components/AlertsLog.vue'
import AlertsAccumulator from './components/AlertsAccumulator.vue'
import Header from './components/Header.vue'
import Menu from './components/Menu.vue'
import store from './store'
import { onMounted, onBeforeUnmount } from 'vue'
import streams from '@/tape-alerts'

onMounted(() => {
  // Get all saved data fron locastorage
  store.commit('initialiseStore')

  // Set theme from storage
  const storedTheme = store.state.isDark
  if (storedTheme) {
    if (storedTheme == true) {
      document.documentElement.setAttribute('data-theme', 'dark')
      store.state.isDark = true
    }
  }

  // Resize windows
  let prevY
  const logSection = document.querySelector('#log')
  const handler = document.querySelector('#resize-handler')

  logSection.style.height = store.state.logHeight

  const mousemove = (e) => {
    const block = logSection?.getBoundingClientRect()
    logSection.style.height = block.height - (prevY - e.clientY) + 'px'
    prevY = e.clientY
  }

  const mouseup = () => {
    store.state.logHeight = logSection.style.height
    store.commit('saveSettings')
    window.removeEventListener('mousemove', mousemove)
    window.removeEventListener('mouseup', mouseup)
  }

  const mousedown = (e) => {
    prevY = e.clientY
    window.addEventListener('mousemove', mousemove)
    window.addEventListener('mouseup', mouseup)
  }
  handler.addEventListener('mousedown', mousedown)

  // Start sender
  streams.startSender()
})

onBeforeUnmount(() => {
  // Stop sender
  streams.stopSender()
})
</script>

<template>
  <Header />
  <Menu />

  <div class="container">
    <div id="log">
      <AlertsLog />
      <div id="resize-handler"></div>
    </div>
    <div id="accumulator">
      <AlertsAccumulator />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.container {
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - 50px);
  min-width: 100vw;

  #log {
    height: 5px;
    position: relative;
    background: var(--body-bg);
    // overflow: scroll;

    #resize-handler {
      position: absolute;
      bottom: 0;
      height: 5px;
      cursor: row-resize;
      width: 100%;
      background: var(--divider-color);
    }
  }

  #accumulator {
    background: var(--body-bg);
    flex: 1;
    // overflow: scroll;
  }
}
</style>
