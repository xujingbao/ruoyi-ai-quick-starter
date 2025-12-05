<template>
  <div class="navbar-icon-wrapper">
    <svg-icon icon-class="question" @click="goto" />
  </div>
</template>

<script setup>
const url = ref('http://doc.ruoyi.vip/ruoyi-vue')

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