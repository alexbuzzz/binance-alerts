<script setup>
import store from '@/store'
import { computed, watch } from 'vue'
import streams from '@/tape-alerts'
import playSound from '../tape-alerts/sound'

const storeAlerts = store.state.commonAccAlerts

// Sort object
const sortedAlerts = computed(() => {
  const alerts = Object.entries(storeAlerts).map(([key, val]) => ({
    key,
    val,
  }))

  alerts.sort((a, b) => b.val.length - a.val.length)

  const sortedObject = {}
  alerts.forEach(({ key, val }) => {
    sortedObject[key] = val
  })

  return sortedObject
})

// Play sound
watch(
  () => {
    const arrLengths = Object.values(storeAlerts).map((val) => {
      return Array.isArray(val) && val.length > 0 ? val.length : undefined
    })
    return arrLengths
  },
  (newLengths, oldLengths) => {
    newLengths.forEach((newLength, index) => {
      if (newLength && newLength > oldLengths[index]) {
        playSound(store.state.selectedAccSound)
      }
    })
  }
)

const copyToClipboard = (symbol) => {
  const dummy = document.createElement('textarea')
  document.body.appendChild(dummy)
  dummy.value = symbol
  dummy.select()
  document.execCommand('copy')
  document.body.removeChild(dummy)
}
</script>
<template>
  <div class="log-wrapper">
    <ul>
      <li v-for="(val, key, index) in sortedAlerts" :key="index">
        <div
          class="list-item"
          v-if="val.length > 1"
          @click="copyToClipboard(key.slice(0, -2))"
        >
          <div class="readings">
            <span
              class="count"
              v-if="key.slice(-1) === 'L'"
              style="background: #459a45"
              >{{ val.length }}</span
            >
            <span class="count" v-else style="background: #ff5454">
              {{ val.length }}</span
            >
            <span class="name">{{ key.slice(0, -2) }}</span>

            <span class="market">{{ key.slice(-2, -1) }}</span>
          </div>
          <div class="buttons" v-if="store.state.showClickerButtons">
            <div class="dom-btn" @click="streams.openDom(key.slice(0, -2), 1)">
              1
            </div>
            <div class="dom-btn" @click="streams.openDom(key.slice(0, -2), 2)">
              2
            </div>
            <div class="dom-btn" @click="streams.openDom(key.slice(0, -2), 3)">
              3
            </div>
            <div class="dom-btn" @click="streams.openDom(key.slice(0, -2), 4)">
              4
            </div>
          </div>
        </div>
      </li>
    </ul>
  </div>
</template>
<style lang="scss" scoped>
.log-wrapper {
  height: 100%;
  overflow: scroll;

  ul {
    list-style-type: none;
    margin: 0;
    padding: 0;
  }

  .list-item {
    display: flex;
    flex-direction: column;
    padding: 8px;
    border-bottom: 1px solid var(--border-color);
    cursor: pointer;

    &:hover {
      background: var(--content-bg-hover);
    }

    .readings {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      gap: 8px;

      .count {
        padding: 4px 12px;
        border-radius: 4px;
        margin-top: -5px;
        color: white;
        font-size: 16px;
      }
    }

    .buttons {
      display: flex;
      gap: 5px;
      margin: 8px 0;

      .dom-btn {
        width: 25%;
        height: 35px;
        text-align: center;
        vertical-align: middle;
        line-height: 35px;
        background: var(--button-bg);
        border-radius: 5px;

        &:hover {
          background: var(--button-bg-hover);
        }
      }

      .copy-btn {
        width: 100%;
        height: 35px;
        text-align: center;
        vertical-align: middle;
        line-height: 35px;
        background: var(--button-bg);
        border-radius: 5px;

        &:hover {
          background: var(--button-bg-hover);
        }
      }
    }
  }
}
</style>
