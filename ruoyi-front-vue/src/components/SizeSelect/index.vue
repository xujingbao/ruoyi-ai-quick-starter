<template>
  <div>
    <el-dropdown trigger="click" @command="handleSetSize">
      <div class="size-icon--style">
        <el-icon class="size-icon"><Operation /></el-icon>
      </div>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item v-for="item of sizeOptions" :key="item.value" :disabled="size === item.value" :command="item.value">
            {{ item.label }}
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </div>
</template>

<script setup>
import useAppStore from "@/store/modules/app"
import { Operation } from '@element-plus/icons-vue'

const appStore = useAppStore()
const size = computed(() => appStore.size)
const route = useRoute()
const router = useRouter()
const { proxy } = getCurrentInstance()
const sizeOptions = ref([
  { label: "较大", value: "large" },
  { label: "默认", value: "default" },
  { label: "稍小", value: "small" },
])

function handleSetSize(size) {
  proxy.$modal.loading("正在设置布局大小，请稍候...")
  appStore.setSize(size)
  setTimeout("window.location.reload()", 1000)
}
</script>

<style lang='scss' scoped>
.size-icon--style {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  cursor: pointer;
  transition: all 0.2s ease;

  .size-icon {
    font-size: 18px;
    transition: transform 0.2s ease;
  }

  &:hover .size-icon {
    transform: scale(1.1);
  }
}
</style>