<template>
  <div class="navbar-icon-wrapper">
    <el-icon @click="toggle">
      <FullScreen v-if="!isFullscreen" />
      <Aim v-else />
    </el-icon>
  </div>
</template>

<script setup>
import { useFullscreen } from '@vueuse/core'
import { FullScreen, Aim } from '@element-plus/icons-vue'

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

  :deep(.el-icon) {
    font-size: 18px;
    transition: transform 0.2s ease;
  }

  &:hover :deep(.el-icon) {
    transform: scale(1.1);
  }
}
</style>