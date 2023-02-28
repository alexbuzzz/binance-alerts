<script setup>
import { ref, onBeforeUnmount } from 'vue'
import streams from '@/tape-alerts'

const isRunning = ref(false)
const buttonText = ref('Start')

const startStop = async () => {
  if (!isRunning.value) {
    await streams.getMarketTickers()
    streams.startFut()
    streams.startSpot()
    isRunning.value = true
    buttonText.value = 'Stop'
  } else {
    streams.stoptFut()
    streams.stoptSpot()
    isRunning.value = false
    buttonText.value = 'Start'
  }
}

onBeforeUnmount(() => {
  streams.stoptFut()
  streams.stoptSpot()
})
</script>

<template>
  <div class="header">
    <button @click="startStop">{{ buttonText }}</button>
  </div>
</template>

<style lang="scss" scoped>
.header {
  button {
    padding: 8px 16px;
  }
}
</style>
