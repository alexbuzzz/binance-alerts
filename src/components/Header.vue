<script setup>
import { RouterLink } from 'vue-router'
</script>

<template>
  <div class="header">
    <nav>
      <RouterLink to="/">Alerts</RouterLink>
      <RouterLink to="/settings">Settings</RouterLink>
    </nav>
  </div>
</template>

<style lang="scss" scoped>
.header {
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;

  nav {
    display: flex;
    gap: 8px;
  }
}
</style>
