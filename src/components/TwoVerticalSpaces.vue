<script setup>
import { onMounted, ref } from 'vue'

const props = defineProps({
  name: String,
})

const topSectionRef = ref(null)
const handlerRef = ref(null)

onMounted(() => {
  // Resize windows
  let prevY
  const topSection = topSectionRef.value
  const handler = handlerRef.value

  topSection.style.height = JSON.parse(
    localStorage.getItem(props.name + 'Height')
  )

  const mousemove = (e) => {
    const block = topSection.getBoundingClientRect()
    topSection.style.height = block.height - (prevY - e.clientY) + 'px'
    prevY = e.clientY
  }

  const mouseup = () => {
    localStorage.setItem(
      props.name + 'Height',
      JSON.stringify(topSection.style.height)
    )
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
    <div id="top" ref="topSectionRef">
      <slot name="topSection"></slot>
      <div id="resize-handler" ref="handlerRef"></div>
    </div>
    <div id="bottom">
      <slot name="bottomSection"></slot>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.container {
  display: flex;
  flex-direction: column;
  min-width: 150px;

  #top {
    height: 150px;
    position: relative;
    background: var(--body-bg);
    overflow: scroll;

    #resize-handler {
      position: absolute;
      bottom: 0;
      height: 5px;
      cursor: row-resize;
      width: 100%;
      background: var(--divider-color);
    }
  }

  #bottom {
    background: var(--body-bg);
    flex: 1;
    overflow: scroll;
  }
}
</style>
