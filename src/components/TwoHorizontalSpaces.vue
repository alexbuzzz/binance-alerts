<script setup>
import { onMounted, ref } from 'vue'

const props = defineProps({
  name: String,
})

const leftSectionRef = ref(null)
const handlerRef = ref(null)

onMounted(() => {
  let prevX
  const leftSection = leftSectionRef.value
  const handler = handlerRef.value

  leftSection.style.width = JSON.parse(
    localStorage.getItem(props.name + 'Width')
  )

  const mousemove = (e) => {
    const block = leftSection.getBoundingClientRect()
    leftSection.style.width = block.width - (prevX - e.clientX) + 'px'
    prevX = e.clientX
  }

  const mouseup = () => {
    localStorage.setItem(
      props.name + 'Width',
      JSON.stringify(leftSection.style.width)
    )
    window.removeEventListener('mousemove', mousemove)
    window.removeEventListener('mouseup', mouseup)
  }

  const mousedown = (e) => {
    prevX = e.clientX
    window.addEventListener('mousemove', mousemove)
    window.addEventListener('mouseup', mouseup)
  }
  handler.addEventListener('mousedown', mousedown)
})
</script>

<template>
  <div class="container">
    <div id="left" ref="leftSectionRef">
      <slot name="leftSection"></slot>
      <div id="resize-handler" ref="handlerRef"></div>
    </div>
    <div id="right">
      <slot name="rightSection"></slot>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.container {
  display: flex;
  height: 100%;
  min-width: 150px;
  width: 100%;

  #left {
    width: 50%;
    position: relative;
    background: var(--body-bg);

    #resize-handler {
      position: absolute;
      top: 0;
      right: 0;
      height: 100%;
      cursor: col-resize;
      width: 5px;
      background: var(--divider-color);
    }
  }

  #right {
    background: var(--body-bg);
    flex: 1;
  }
}
</style>
