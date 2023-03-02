<script setup>
import { onMounted, ref } from 'vue'
import store from '@/store'
import AlertsLog from './AlertsLog.vue'
import AlertsAccumulator from './AlertsAccumulator.vue'

const props = defineProps({
  name: String,
})

const logSectionRef = ref(null)
const handlerRef = ref(null)

onMounted(() => {
  // Resize windows
  let prevY
  const logSection = logSectionRef.value
  const handler = handlerRef.value

  logSection.style.height = JSON.parse(localStorage.getItem(props.name))

  const mousemove = (e) => {
    const block = logSection?.getBoundingClientRect()
    logSection.style.height = block.height - (prevY - e.clientY) + 'px'
    prevY = e.clientY
  }

  const mouseup = () => {
    localStorage.setItem(props.name, JSON.stringify(logSection.style.height))
    window.removeEventListener('mousemove', mousemove)
    window.removeEventListener('mouseup', mouseup)
  }

  const mousedown = (e) => {
    prevY = e.clientY
    window.addEventListener('mousemove', mousemove)
    window.addEventListener('mouseup', mouseup)
  }
  handler.addEventListener('mousedown', mousedown)
})
</script>

<template>
  <div class="container">
    <div id="log" ref="logSectionRef">
      <slot name="topSection"></slot>
      <div id="resize-handler" ref="handlerRef"></div>
    </div>
    <div id="accumulator">
      <slot name="bottomSection"></slot>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.container {
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - 50px);
  // min-width: 100%;

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
