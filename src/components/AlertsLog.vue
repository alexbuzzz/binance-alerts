<script setup>
import store from '@/store'
import { computed } from 'vue'
const alerts = store.state.commonLogAlerts
</script>
<template>
  <div class="log-wrapper">
    <ul>
      <li v-for="alert in alerts" :key="alert">
        <div class="list-item" @click="copyToClipboard(alert.symbol)">
          <div class="readings">
            <span class="name">{{ alert.symbol }} {{ alert.market }}</span>
            <span
              class="size"
              v-if="alert.direction === 'L'"
              style="color: green"
              >{{ alert.size }}K</span
            >
            <span class="size" v-else style="color: red">
              {{ alert.size }}K</span
            >

            <span class="time">{{ alert.time }}</span>
          </div>
          <div class="buttons" v-if="store.state.showClickerButtons">
            <div class="dom-btn" @click="openDom(alert.symbol, 1)">1</div>
            <div class="dom-btn" @click="openDom(alert.symbol, 2)">2</div>
            <div class="dom-btn" @click="openDom(alert.symbol, 3)">3</div>
            <div class="dom-btn" @click="openDom(alert.symbol, 4)">4</div>
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
  button {
    margin: 8px;
    padding: 4px 8px;
    background: none;
    color: var(--text-color);
    border: 1px solid var(--border-color);
    border-radius: 4px;
    cursor: pointer;

    &:hover {
      background: var(--button-bg-hover);
    }
  }

  input[type='checkbox'] {
    transform: scale(1.4);
    vertical-align: middle;
  }

  ul {
    list-style-type: none;
    margin: 0;
    padding: 0;
  }

  .header {
    display: flex;
    justify-content: space-between;

    button {
      padding: 8px 16px;
    }
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
