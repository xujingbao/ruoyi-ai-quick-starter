<template>
  <div class="navbar-icon-wrapper">
    <svg-icon :icon-class="isFullscreen ? 'exit-fullscreen' : 'fullscreen'" @click="toggle" />
  </div>
</template>

<script setup>
import { useFullscreen } from '@vueuse/core'

const { isFullscreen, enter, exit, toggle } = useFullscreen()
</script>

<style lang='scss' scoped>
.navbar-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  cursor: pointer;
  transition: all 0.2s ease;

  :deep(.svg-icon) {
    width: 18px;
    height: 18px;
    transition: transform 0.2s ease;
  }

  &:hover :deep(.svg-icon) {
    transform: scale(1.1);
  }
}
</style>