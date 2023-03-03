<script setup>
import AlertsLog from './components/AlertsLog.vue'
import AlertsAccumulator from './components/AlertsAccumulator.vue'
import TwoVerticalSpaces from './components/TwoVerticalSpaces.vue'
import TwoHorizontalSpaces from './components/TwoHorizontalSpaces.vue'
import Header from './components/Header.vue'
import Menu from './components/Menu.vue'
import store from '@/store'
import { onMounted, onBeforeUnmount, ref, onBeforeMount } from 'vue'
import streams from '@/tape-alerts'

const loggedIn = ref(true)
const password = ref('')
const storedPassword = '2064'

const checkPassword = () => {
  if (password.value === storedPassword) {
    loggedIn.value = true
  }
}

onBeforeMount(() => {
  checkPassword()

  // Get all saved data from local storage
  store.commit('initialiseStore')

  // Set theme from storage
  const storedTheme = store.state.settings.isDark
  if (storedTheme) {
    if (storedTheme == true) {
      document.documentElement.setAttribute('data-theme', 'dark')
      store.state.settings.isDark = true
    }
  }

  // Start sender
  streams.startSender()
})

onBeforeUnmount(() => {
  // Stop sender
  streams.stopSender()
})
</script>

<template>
  <div class="password-overlay" v-if="!loggedIn">
    <input
      type="password"
      placeholder="PASSWORD"
      v-model="password"
      @input="checkPassword"
    />
  </div>
  <Header v-if="loggedIn" />
  <Menu v-if="loggedIn" />

  <TwoVerticalSpaces name="mainVertical">
    <template v-slot:topSection>
      <TwoHorizontalSpaces name="horizontal">
        <template v-slot:leftSection>
          <TwoVerticalSpaces name="leftVertical">
            <template v-slot:topSection>
              <AlertsLog />
            </template>
            <template v-slot:bottomSection>
              <AlertsAccumulator />
            </template>
          </TwoVerticalSpaces>
        </template>
        <template v-slot:rightSection>Right</template>
      </TwoHorizontalSpaces>
    </template>

    <template v-slot:bottomSection>Bottom</template>
  </TwoVerticalSpaces>
</template>

<style lang="scss" scoped>
.password-overlay {
  display: flex;
  height: 100vh;
  width: 100vw;
  justify-content: center;
  align-items: center;

  input {
    width: 80%;
    max-width: 200px;
    height: 40px;
    background: none;
    text-align: center;
    color: var(--text-color);
    font-size: 16px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    outline: none;
    border-top-style: hidden;
    border-right-style: hidden;
    border-left-style: hidden;
    border-bottom-style: hidden;
    border: 1px solid var(--border-color);
    border-radius: 4px;
  }
}
</style>
