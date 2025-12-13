<template>
  <div class="app-container home">
    <el-row :gutter="16" class="intro-row">
      <el-col :sm="24" :lg="12">
        <h2>RuoYi AI Quick Starter</h2>
        <p>
          RuoYi AI Quick Starter 是基于 RuoYi 的 <strong>AI 快速开发框架</strong>，AI 友好设计，前后端工程统一在同一仓库，便于 AI 理解完整业务上下文，实现全栈开发。可快速生成模块完整代码（数据库表、后端接口、前端页面、API 对接）。
        </p>
        <p>
          保留前后端分离架构，确保代码可维护性和团队协作灵活性。内置用户权限管理、系统监控、定时任务、操作日志等企业级功能模块，开箱即用，助力高效开发。
        </p>
        <p>
          <b>当前版本:</b> <span>v{{ version }}</span>
        </p>
      </el-col>

      <el-col :sm="24" :lg="12">
        <el-row>
          <el-col :span="12">
            <h2>技术选型</h2>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <h4>后端技术</h4>
            <ul>
              <li>Spring Boot 3.x</li>
              <li>MyBatis</li>
              <li>Redis</li>
              <li>MySQL 8.0+</li>
            </ul>
          </el-col>
          <el-col :span="12">
            <h4>客户端技术</h4>
            <ul>
              <li>Vue 3</li>
              <li>Element Plus</li>
              <li>Vite</li>
              <li>uni-app</li>
              <li>pnpm</li>
            </ul>
          </el-col>
        </el-row>
      </el-col>
    </el-row>
    <el-divider style="margin: 16px 0;" />
    <!-- 统计卡片 -->
    <el-row :gutter="16" class="stats-row">
      <el-col :xs="12" :sm="6" :md="6" :lg="6">
        <el-card class="stat-card stat-card-primary" shadow="hover">
          <div class="stat-content-compact">
            <div class="stat-icon-compact">
              <img src="/tech/user.svg" alt="总用户数" class="stat-icon-img" />
            </div>
            <div class="stat-info-compact">
              <div class="stat-label-compact">总用户数</div>
              <div class="stat-value-compact">{{ stats.totalUsers }}</div>
            </div>
            <div class="stat-trend-compact up">
              <el-icon :size="12" style="margin-right: 3px;"><ArrowUp /></el-icon> 12.5%
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="6" :md="6" :lg="6">
        <el-card class="stat-card stat-card-success" shadow="hover">
          <div class="stat-content-compact">
            <div class="stat-icon-compact">
              <img src="/tech/user-online.svg" alt="在线用户" class="stat-icon-img" />
            </div>
            <div class="stat-info-compact">
              <div class="stat-label-compact">在线用户</div>
              <div class="stat-value-compact">{{ stats.onlineUsers }}</div>
            </div>
            <div class="stat-trend-compact up">
              <el-icon :size="12" style="margin-right: 3px;"><ArrowUp /></el-icon> 8.2%
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="6" :md="6" :lg="6">
        <el-card class="stat-card stat-card-warning" shadow="hover">
          <div class="stat-content-compact">
            <div class="stat-icon-compact">
              <img src="/tech/view.svg" alt="今日访问" class="stat-icon-img" />
            </div>
            <div class="stat-info-compact">
              <div class="stat-label-compact">今日访问</div>
              <div class="stat-value-compact">{{ stats.todayVisits }}</div>
            </div>
            <div class="stat-trend-compact up">
              <el-icon :size="12" style="margin-right: 3px;"><ArrowUp /></el-icon> 15.3%
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="6" :md="6" :lg="6">
        <el-card class="stat-card stat-card-danger" shadow="hover">
          <div class="stat-content-compact">
            <div class="stat-icon-compact">
              <img src="/tech/bell.svg" alt="系统消息" class="stat-icon-img" />
            </div>
            <div class="stat-info-compact">
              <div class="stat-label-compact">系统消息</div>
              <div class="stat-value-compact">{{ stats.systemMessages }}</div>
            </div>
            <div class="stat-trend-compact down">
              <el-icon :size="12" style="margin-right: 3px;"><ArrowDown /></el-icon> 5.1%
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    <el-divider style="margin: 16px 0;" />
    <!-- 趋势图表 -->
    <el-row :gutter="16" class="chart-row">
      <el-col :xs="24" :sm="24" :md="8" :lg="8">
        <el-card class="chart-card" shadow="hover">
          <template v-slot:header>
            <div class="chart-header">
              <span class="chart-title">用户增长趋势</span>
              <span class="chart-subtitle">最近6个月</span>
            </div>
          </template>
          <div ref="userChart" class="chart-container"></div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="24" :md="8" :lg="8">
        <el-card class="chart-card" shadow="hover">
          <template v-slot:header>
            <div class="chart-header">
              <span class="chart-title">操作类型分布</span>
              <span class="chart-subtitle">实时统计</span>
            </div>
          </template>
          <div ref="operationChart" class="chart-container"></div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="24" :md="8" :lg="8">
        <el-card class="chart-card" shadow="hover">
          <template v-slot:header>
            <div class="chart-header">
              <span class="chart-title">系统性能监控</span>
              <span class="chart-subtitle">24小时</span>
            </div>
          </template>
          <div ref="performanceChart" class="chart-container"></div>
        </el-card>
      </el-col>
    </el-row>
    <el-divider style="margin: 16px 0;" />
    <el-row :gutter="16">
      <el-col :xs="24" :sm="24" :md="12" :lg="8">
        <el-card class="ai-test-card" shadow="hover">
          <template v-slot:header>
            <div class="card-header">
              <span class="card-title">🤖 AI 聊天测试</span>
            </div>
          </template>
          <div class="body">
            <p>测试 Spring AI 集成的 DeepSeek 聊天功能</p>
            <el-button type="primary" @click="openAiChatDialog" style="width: 100%; margin-top: 12px;">
              <el-icon style="margin-right: 5px;"><ChatDotRound /></el-icon>
              开始聊天
            </el-button>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="24" :md="12" :lg="8">
        <el-card>
          <template v-slot:header>
            <div class="card-header">
              <span class="card-title">核心特性</span>
            </div>
          </template>
          <div class="body">
            <ul>
              <li>✅ 企业级功能模块（用户权限、系统监控、定时任务等）</li>
              <li>✅ AI 辅助开发基础，规范化项目结构</li>
              <li>✅ 前后端统一仓库，便于 AI 理解业务上下文</li>
              <li>✅ 支持 Web 和移动端多端开发</li>
              <li>✅ 完善的开发规范文档</li>
              <li>✅ 预配置调试启动项，支持断点调试</li>
            </ul>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="24" :md="12" :lg="8">
        <el-card>
          <template v-slot:header>
            <div class="card-header">
              <span class="card-title">快速开始</span>
            </div>
          </template>
          <div class="body">
            <ol>
              <li>环境准备：JDK 17+、Maven 3.6+、Node.js 20.19+ 或 22.12+、pnpm 8+、MySQL 8.0+、Redis 6.0+</li>
              <li>初始化数据库：执行 <code>sql/ry_20250522.sql</code></li>
              <li>启动服务：在 Cursor 中按 <kbd>F5</kbd>，选择 "RuoYi Backend" 或 "RuoYi Frontend"</li>
              <li>访问系统：前端 <a href="http://localhost" target="_blank">http://localhost</a>，API 文档 <a href="http://localhost:8080/swagger-ui.html" target="_blank">http://localhost:8080/swagger-ui.html</a></li>
            </ol>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="24" :md="12" :lg="8">
        <el-card>
          <template v-slot:header>
            <div class="card-header">
              <span class="card-title">开发指南</span>
            </div>
          </template>
          <div class="body">
            <p>
              本项目已针对 <strong>Cursor AI</strong> 进行优化配置，推荐使用 Cursor 编辑器进行开发。
            </p>
            <p>
              <strong>使用 Cursor AI 开发工作流：</strong>
            </p>
            <ul>
              <li>代码生成：使用 @ 符号引用文件或代码</li>
              <li>代码重构：选中代码后，使用 Cmd/Ctrl + K 进行 AI 重构</li>
              <li>问题修复：选中错误代码，使用 AI 自动修复</li>
              <li>功能开发：描述需求，AI 自动生成代码</li>
            </ul>
            <p>
              更多信息请查看项目 <a href="README.md" target="_blank">README.md</a> 文档。
            </p>
          </div>
        </el-card>
      </el-col>
    </el-row>
    
    <!-- AI 聊天对话框 -->
    <el-dialog
      v-model="aiChatDialogVisible"
      title="🤖 AI 聊天测试"
      width="600px"
      :close-on-click-modal="false"
    >
      <div class="ai-chat-container">
        <el-input
          v-model="aiChatMessage"
          type="textarea"
          :rows="3"
          placeholder="请输入您的问题..."
          @keydown.ctrl.enter="sendAiMessage"
        />
        <div style="margin-top: 12px; text-align: right;">
          <el-button @click="aiChatDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="sendAiMessage" :loading="aiChatLoading">
            发送
          </el-button>
        </div>
        <div class="ai-response" style="margin-top: 20px; padding: 12px; background: #f5f7fa; border-radius: 4px; min-height: 100px;">
          <div style="font-weight: 600; margin-bottom: 8px; color: #409eff;">AI 回复：</div>
          <div style="line-height: 1.6;">
            <MarkdownRender 
              custom-id="ai-chat-response"
              :content="aiChatContent" 
            />
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup name="Index">
import * as echarts from 'echarts'
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { ChatDotRound, Loading } from '@element-plus/icons-vue'
import useSettingsStore from '@/store/modules/settings'
import { streamChat } from '@/api/ai/chat'

const version = ref('1.0.0')
const settingsStore = useSettingsStore()

// AI 聊天对话框
const aiChatDialogVisible = ref(false)
const aiChatMessage = ref('')
const aiChatContent = ref('')
const aiChatLoading = ref(false)
let abortStream = null

// 打开 AI 聊天对话框
function openAiChatDialog() {
  aiChatDialogVisible.value = true
  aiChatMessage.value = ''
  aiChatContent.value = ''
  aiChatLoading.value = false
  // 取消之前的请求
  if (abortStream) {
    abortStream()
    abortStream = null
  }
}

// 发送 AI 聊天消息
function sendAiMessage() {
  const message = aiChatMessage.value.trim()
  if (!message) {
    ElMessage.warning('请输入消息内容')
    return
  }
  
  // 防止重复提交
  if (aiChatLoading.value) {
    return
  }
  
  // 取消之前的请求
  if (abortStream) {
    abortStream()
  }
  
  aiChatLoading.value = true
  aiChatContent.value = ''
  
  abortStream = streamChat(
    { message },
    (text) => {
      aiChatContent.value += text || ''
    },
    (error) => {
      const errorMsg = error.message?.includes('timeout') 
        ? '请求超时，AI 响应时间过长，请稍后重试'
        : error.message || 'AI 聊天失败'
      ElMessage.error(errorMsg)
      aiChatLoading.value = false
      abortStream = null
    },
    () => {
      aiChatLoading.value = false
      abortStream = null
    }
  )
}

// 检测是否为暗色模式（响应式）
const isDark = computed(() => {
  return settingsStore.isDark || document.documentElement.classList.contains('dark')
})

// 获取图表文字颜色（根据暗色模式）
const getChartTextColor = () => {
  return isDark.value ? 'rgba(255, 255, 255, 0.8)' : '#909399'
}

// 获取图表轴线颜色（根据暗色模式）
const getChartAxisLineColor = () => {
  return isDark.value ? 'rgba(255, 255, 255, 0.2)' : '#e4e7ed'
}

// 获取图表分割线颜色（根据暗色模式）
const getChartSplitLineColor = () => {
  return isDark.value ? 'rgba(255, 255, 255, 0.1)' : '#f0f2f5'
}

// 获取图表 tooltip 背景色（根据暗色模式）
const getChartTooltipBg = () => {
  return isDark.value ? 'rgba(29, 30, 31, 0.95)' : 'rgba(255, 255, 255, 0.95)'
}

// 获取图表 tooltip 文字颜色（根据暗色模式）
const getChartTooltipTextColor = () => {
  return isDark.value ? 'rgba(255, 255, 255, 0.9)' : '#303133'
}

// 获取图表 tooltip 边框颜色（根据暗色模式）
const getChartTooltipBorderColor = () => {
  return isDark.value ? 'rgba(255, 255, 255, 0.2)' : '#e4e7ed'
}

// 统计数据
const stats = ref({
  totalUsers: 1234,
  onlineUsers: 56,
  todayVisits: 892,
  systemMessages: 23
})

// 图表引用
const userChart = ref(null)
const operationChart = ref(null)
const performanceChart = ref(null)

// 图表实例
let userChartInstance = null
let operationChartInstance = null
let performanceChartInstance = null

function goTarget(url) {
  window.open(url, '__blank')
}

// 初始化用户增长趋势图
function initUserChart() {
  if (!userChart.value) return
  
  userChartInstance = echarts.init(userChart.value)
  const option = {
    tooltip: {
      trigger: 'axis',
      backgroundColor: getChartTooltipBg(),
      borderColor: getChartTooltipBorderColor(),
      borderWidth: 1,
      textStyle: {
        color: getChartTooltipTextColor()
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: ['1月', '2月', '3月', '4月', '5月', '6月'],
      axisLine: {
        lineStyle: {
          color: getChartAxisLineColor()
        }
      },
      axisLabel: {
        color: getChartTextColor()
      }
    },
    yAxis: {
      type: 'value',
      axisLine: {
        lineStyle: {
          color: getChartAxisLineColor()
        }
      },
      axisLabel: {
        color: getChartTextColor()
      },
      splitLine: {
        lineStyle: {
          color: getChartSplitLineColor(),
          type: 'dashed'
        }
      }
    },
    series: [
      {
        name: '新增用户',
        type: 'bar',
        barWidth: '50%',
        data: [120, 132, 101, 134, 90, 230],
        itemStyle: {
          borderRadius: [4, 4, 0, 0],
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#67C23A' },
            { offset: 1, color: '#85ce61' }
          ])
        },
        emphasis: {
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#85ce61' },
              { offset: 1, color: '#67C23A' }
            ])
          }
        }
      }
    ]
  }
  userChartInstance.setOption(option)
}

// 初始化操作类型分布图
function initOperationChart() {
  if (!operationChart.value) return
  
  operationChartInstance = echarts.init(operationChart.value)
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)',
      backgroundColor: getChartTooltipBg(),
      borderColor: getChartTooltipBorderColor(),
      borderWidth: 1,
      textStyle: {
        color: getChartTooltipTextColor()
      }
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      top: 'middle',
      textStyle: {
        color: getChartTextColor(),
        fontSize: 12
      }
    },
    series: [
      {
        name: '操作类型',
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['60%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: isDark.value ? 'rgba(20, 20, 20, 0.8)' : '#fff',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: '20',
            fontWeight: 'bold',
            color: getChartTooltipTextColor()
          },
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        },
        labelLine: {
          show: false
        },
        data: [
          { value: 335, name: '查询操作', itemStyle: { color: '#409EFF' } },
          { value: 310, name: '新增操作', itemStyle: { color: '#67C23A' } },
          { value: 234, name: '修改操作', itemStyle: { color: '#E6A23C' } },
          { value: 135, name: '删除操作', itemStyle: { color: '#F56C6C' } },
          { value: 154, name: '其他操作', itemStyle: { color: '#909399' } }
        ]
      }
    ]
  }
  operationChartInstance.setOption(option)
}

// 初始化系统性能监控图
function initPerformanceChart() {
  if (!performanceChart.value) return
  
  performanceChartInstance = echarts.init(performanceChart.value)
  const option = {
    tooltip: {
      trigger: 'axis',
      backgroundColor: getChartTooltipBg(),
      borderColor: getChartTooltipBorderColor(),
      borderWidth: 1,
      textStyle: {
        color: getChartTooltipTextColor()
      }
    },
    legend: {
      data: ['CPU使用率', '内存使用率'],
      top: 10,
      textStyle: {
        color: getChartTextColor()
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '24:00'],
      axisLine: {
        lineStyle: {
          color: getChartAxisLineColor()
        }
      },
      axisLabel: {
        color: getChartTextColor()
      }
    },
    yAxis: {
      type: 'value',
      max: 100,
      axisLine: {
        lineStyle: {
          color: getChartAxisLineColor()
        }
      },
      axisLabel: {
        color: getChartTextColor(),
        formatter: '{value}%'
      },
      splitLine: {
        lineStyle: {
          color: getChartSplitLineColor(),
          type: 'dashed'
        }
      }
    },
    series: [
      {
        name: 'CPU使用率',
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        data: [45, 52, 38, 65, 58, 42, 48],
        itemStyle: {
          color: '#409EFF',
          borderColor: isDark.value ? 'rgba(20, 20, 20, 0.8)' : '#fff',
          borderWidth: 2
        },
        lineStyle: {
          width: 3,
          color: '#409EFF'
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(64, 158, 255, 0.3)' },
              { offset: 1, color: 'rgba(64, 158, 255, 0.05)' }
            ]
          }
        }
      },
      {
        name: '内存使用率',
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        data: [62, 58, 65, 72, 68, 60, 64],
        itemStyle: {
          color: '#67C23A',
          borderColor: isDark.value ? 'rgba(20, 20, 20, 0.8)' : '#fff',
          borderWidth: 2
        },
        lineStyle: {
          width: 3,
          color: '#67C23A'
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(103, 194, 58, 0.3)' },
              { offset: 1, color: 'rgba(103, 194, 58, 0.05)' }
            ]
          }
        }
      }
    ]
  }
  performanceChartInstance.setOption(option)
}


// 窗口大小改变时重新调整图表
function handleResize() {
  userChartInstance?.resize()
  operationChartInstance?.resize()
  performanceChartInstance?.resize()
}

// 监听暗色模式变化，重新渲染图表
watch(() => settingsStore.isDark, () => {
  nextTick(() => {
    if (userChartInstance) {
      initUserChart()
    }
    if (operationChartInstance) {
      initOperationChart()
    }
    if (performanceChartInstance) {
      initPerformanceChart()
    }
  })
})

// 监听 DOM 的 dark 类变化
const observer = new MutationObserver(() => {
  nextTick(() => {
    if (userChartInstance) {
      initUserChart()
    }
    if (operationChartInstance) {
      initOperationChart()
    }
    if (performanceChartInstance) {
      initPerformanceChart()
    }
  })
})

onMounted(() => {
  // 使用双重 nextTick 和 setTimeout 确保 DOM 完全渲染
  nextTick(() => {
    setTimeout(() => {
      initUserChart()
      initOperationChart()
      initPerformanceChart()
      
      window.addEventListener('resize', handleResize)
      
      // 监听 html 元素的 class 变化（暗色模式切换）
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['class']
      })
    }, 100)
  })
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  observer.disconnect()
  userChartInstance?.dispose()
  operationChartInstance?.dispose()
  performanceChartInstance?.dispose()
})
</script>

<style scoped lang="scss">
.home {
  blockquote {
    padding: 10px 20px;
    margin: 0 0 20px;
    font-size: 17.5px;
    border-left: 5px solid #eee;
  }
  hr {
    margin-top: 20px;
    margin-bottom: 20px;
    border: 0;
    border-top: 1px solid #eee;
  }
  .col-item {
    margin-bottom: 20px;
  }

  ul {
    padding: 0;
    margin: 0;
  }

  font-family: inherit;
  font-size: 13px;
  color: #676a6c;
  overflow-x: hidden;
  
  // 暗色模式下的文字颜色会在 variables.module.scss 中覆盖

  .intro-row {
    margin-bottom: 12px;
  }

  ul {
    list-style-type: disc;
    padding-left: 18px;
    margin: 6px 0;
    
    li {
      margin: 3px 0;
      line-height: 1.5;
      font-size: 13px;
    }
  }

  ol {
    list-style-type: decimal;
    padding-left: 18px;
    margin: 6px 0;
    
    li {
      margin: 3px 0;
      line-height: 1.5;
      font-size: 13px;
    }
  }

  h4 {
    margin-top: 0px;
    margin-bottom: 8px;
    font-size: 15px;
    font-weight: 600;
  }

  h2 {
    margin-top: 0px;
    margin-bottom: 12px;
    font-size: 24px;
    font-weight: 100;
  }

  p {
    margin-top: 8px;
    margin-bottom: 8px;
    line-height: 1.6;

    b {
      font-weight: 700;
    }

    strong {
      font-weight: 600;
    }

    code {
      background-color: #f4f4f5;
      padding: 2px 6px;
      border-radius: 3px;
      font-family: 'Courier New', monospace;
      font-size: 12px;
    }

    kbd {
      background-color: #f4f4f5;
      padding: 2px 6px;
      border-radius: 3px;
      font-family: 'Courier New', monospace;
      font-size: 12px;
      border: 1px solid #d3d3d3;
    }

    a {
      color: #409eff;
      text-decoration: none;
      
      &:hover {
        text-decoration: underline;
      }
    }
  }

  .el-card {
    .body {
      ul, ol {
        margin: 10px 0;
      }
    }
  }

  .stats-row {
    margin-bottom: 16px;
  }

  .stat-card {
    cursor: pointer;
    transition: all 0.25s ease;
    position: relative;
    border: 1px solid #f0f2f5;
    border-radius: 8px;
    background: #ffffff;
    overflow: hidden;
    
    :deep(.el-card__body) {
      padding: 16px;
    }

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 3px;
      height: 100%;
      background: currentColor;
      opacity: 0;
      transition: opacity 0.25s ease;
    }

    &:hover {
      border-color: currentColor;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
      transform: translateY(-2px);

      &::before {
        opacity: 1;
      }

      .stat-icon-compact {
        transform: scale(1.1);
      }
    }

    .stat-content-compact {
      display: flex;
      align-items: center;
      gap: 14px;

      .stat-icon-compact {
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.25s ease;

        .stat-icon-img {
          width: 32px;
          height: 32px;
          object-fit: contain;
        }
      }

      .stat-info-compact {
        flex: 1;
        min-width: 0;

        .stat-label-compact {
          font-size: 12px;
          color: #909399;
          margin-bottom: 6px;
          font-weight: 400;
          letter-spacing: 0.3px;
        }

        .stat-value-compact {
          font-size: 24px;
          font-weight: 600;
          line-height: 1.2;
          color: #303133;
          white-space: nowrap;
        }
      }

      .stat-trend-compact {
        flex-shrink: 0;
        display: flex;
        align-items: center;
        font-size: 12px;
        font-weight: 500;
        padding: 4px 8px;
        border-radius: 12px;
        white-space: nowrap;
        transition: all 0.25s ease;

        &.up {
          color: #52c41a;
          background: #f6ffed;
          border: 1px solid #b7eb8f;
        }

        &.down {
          color: #ff4d4f;
          background: #fff1f0;
          border: 1px solid #ffccc7;
        }
      }
    }

    &.stat-card-primary {
      color: #1890ff;

      &:hover {
        border-color: #1890ff;
      }
    }

    &.stat-card-success {
      color: #52c41a;

      &:hover {
        border-color: #52c41a;
      }
    }

    &.stat-card-warning {
      color: #faad14;

      &:hover {
        border-color: #faad14;
      }
    }

    &.stat-card-danger {
      color: #ff4d4f;

      &:hover {
        border-color: #ff4d4f;
      }
    }
  }

  .chart-row {
    margin-bottom: 16px;
  }

  .chart-card {
    border-radius: 8px;
    transition: all 0.3s;
    
    :deep(.el-card__body) {
      padding: 16px;
    }
    
    :deep(.el-card__header) {
      padding: 12px 16px;
      border-bottom: 1px solid #f0f0f0;
    }

    &:hover {
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12);
    }

    .chart-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .chart-title {
        font-size: 15px;
        font-weight: 600;
        color: #303133;
        line-height: 1.5;
        font-family: inherit;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
      }

      .chart-subtitle {
        font-size: 11px;
        color: #909399;
      }
    }

    .chart-container {
      width: 100%;
      height: 240px;
      min-height: 240px;
    }
  }
  
  .el-card {
    :deep(.el-card__header) {
      padding: 12px 16px;
      border-bottom: 1px solid #f0f0f0;
    }
    
    :deep(.el-card__body) {
      padding: 16px;
    }
    
    // 统一所有卡片标题样式（包括图表卡片和普通卡片）
    .chart-header,
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .chart-title,
    .card-title {
      font-size: 15px !important;
      font-weight: 600 !important;
      color: #303133;
      line-height: 1.5 !important;
      font-family: inherit !important;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      margin: 0;
      padding: 0;
    }
    
    .body {
      ul, ol {
        margin: 8px 0;
      }
    }
  }
  
  .ai-test-card {
    border: 2px solid #409eff;
    background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
    
    &:hover {
      border-color: #66b1ff;
      box-shadow: 0 6px 20px rgba(64, 158, 255, 0.2);
    }
    
    .card-title {
      color: #409eff;
      font-weight: 700;
    }
  }
  
  .ai-chat-container {
    .ai-response {
      max-height: 300px;
      overflow-y: auto;
    }
  }
}

// 暗色模式下的文字颜色覆盖 - 使用全局选择器确保优先级
html.dark {
  .home {
    color: #ffffff !important;
    
    h2, h4, p, span, li {
      color: #ffffff !important;
    }
    
    .chart-title,
    .card-title {
      color: #ffffff !important;
    }
    
    .chart-subtitle {
      color: rgba(255, 255, 255, 0.8) !important;
    }
    
    .stat-label-compact {
      color: rgba(255, 255, 255, 0.8) !important;
    }
    
    .stat-value-compact {
      color: #ffffff !important;
    }
    
    .el-card {
      :deep(.el-card__body) {
        color: #ffffff !important;
      }
      
      .body {
        color: #ffffff !important;
        
        p, li, code, kbd {
          color: #ffffff !important;
        }
      }
    }
  }
}
</style>
