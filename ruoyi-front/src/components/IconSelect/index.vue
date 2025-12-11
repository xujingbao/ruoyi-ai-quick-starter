<template>
  <div class="icon-body">
    <el-input
      v-model="iconName"
      class="icon-search"
      clearable
      placeholder="请输入图标名称搜索"
      @clear="filterIcons"
      @input="filterIcons"
    >
      <template #suffix><el-icon class="el-input__icon"><Search /></el-icon></template>
    </el-input>
    <div class="icon-list">
      <el-scrollbar height="300px">
        <div class="list-container">
          <div v-for="(item, index) in iconList" class="icon-item-wrapper" :key="index" @click="selectedIcon(item.name)">
            <div :class="['icon-item', { active: isActive(item.name) }]">
              <el-icon class="icon">
                <component :is="item.component" />
              </el-icon>
              <div class="icon-text">
                <span class="icon-name">{{ item.name }}</span>
                <span class="icon-original-name" v-if="item.originalName !== item.name">{{ item.originalName }}</span>
              </div>
            </div>
          </div>
        </div>
      </el-scrollbar>
    </div>
  </div>
</template>

<script setup>
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import { Search } from '@element-plus/icons-vue'

const props = defineProps({
  activeIcon: {
    type: String
  }
})

const iconName = ref('')
const emit = defineEmits(['selected'])

// 将 PascalCase 转换为 kebab-case
function toKebabCase(str) {
  return str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()
}

// 获取所有 Element Plus 图标
const allIcons = computed(() => {
  const icons = []
  for (const key in ElementPlusIconsVue) {
    if (key !== 'default' && typeof ElementPlusIconsVue[key] !== 'string') {
      const component = ElementPlusIconsVue[key]
      const originalName = key
      const kebabName = toKebabCase(key)
      icons.push({
        name: kebabName, // 使用 kebab-case 作为显示名称（与数据库存储格式一致）
        originalName: originalName, // 保留原始名称用于显示
        component: component
      })
    }
  }
  // 按名称排序
  return icons.sort((a, b) => a.name.localeCompare(b.name))
})

const iconList = ref(allIcons.value)

function filterIcons() {
  if (!iconName.value) {
    iconList.value = allIcons.value
    return
  }
  
  const searchText = iconName.value.toLowerCase()
  iconList.value = allIcons.value.filter(item => 
    item.name.toLowerCase().includes(searchText) || 
    item.originalName.toLowerCase().includes(searchText)
  )
}

function selectedIcon(name) {
  emit('selected', name)
  document.body.click()
}

// 检查图标是否激活（支持 kebab-case 和原始名称匹配）
function isActive(iconName) {
  if (!props.activeIcon) return false
  // 直接匹配
  if (props.activeIcon === iconName) return true
  // 如果 activeIcon 是 PascalCase，转换为 kebab-case 后匹配
  const activeKebab = toKebabCase(props.activeIcon)
  return activeKebab === iconName
}

function reset() {
  iconName.value = ''
  iconList.value = allIcons.value
}

defineExpose({
  reset
})
</script>

<style lang='scss' scoped>
.icon-body {
  width: 100%;
  min-width: 560px;
  padding: 10px;
  
  .icon-search {
    position: relative;
    margin-bottom: 10px;
  }
  
  .icon-list {
    .list-container {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
      gap: 8px;
      
      .icon-item-wrapper {
        cursor: pointer;
        
        .icon-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          border: 1px solid var(--el-border-color-light);
          border-radius: 4px;
          transition: all 0.2s;
          
          &:hover {
            background: var(--el-fill-color-light);
            border-color: var(--el-color-primary);
            transform: translateY(-2px);
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          }
          
          .icon {
            font-size: 18px;
            color: var(--el-color-primary);
            flex-shrink: 0;
          }
          
          .icon-text {
            flex: 1;
            display: flex;
            flex-direction: column;
            min-width: 0;
            
            .icon-name {
              font-size: 13px;
              color: var(--el-text-color-primary);
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
              line-height: 1.4;
            }
            
            .icon-original-name {
              font-size: 11px;
              color: var(--el-text-color-secondary);
              opacity: 0.7;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
              line-height: 1.2;
            }
          }
        }
        
        .icon-item.active {
          background: var(--el-color-primary-light-9);
          border-color: var(--el-color-primary);
          
          .icon {
            color: var(--el-color-primary);
          }
          
          .icon-name {
            color: var(--el-color-primary);
            font-weight: 500;
          }
        }
      }
    }
  }
}

// 暗色模式适配
html.dark {
  .icon-body {
    .icon-item-wrapper {
      .icon-item {
        border-color: var(--el-border-color);
        
        &:hover {
          background: var(--el-fill-color-dark);
        }
        
        &.active {
          background: var(--el-color-primary-dark-2);
        }
      }
    }
  }
}
</style>