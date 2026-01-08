<template>
  <div class="navbar-icon-wrapper">
    <el-icon @click="goto"><Link /></el-icon>
  </div>
</template>

<script setup>
import { Link } from '@element-plus/icons-vue'

const url = ref('https://gitee.com/xujingbao/ruoyi-ai-quick-starter')

function goto() {
  window.open(url.value)
}
</script>

<style scoped lang="scss">
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
