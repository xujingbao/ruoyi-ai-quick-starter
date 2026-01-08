<template>
  <div class="app-container">
    <el-row :gutter="10">
      <!-- CPU 监控 -->
      <el-col :span="6" class="card-box">
        <el-card style="min-height: 400px;">
          <template #header><Cpu style="width: 1em; height: 1em; vertical-align: middle;" /> <span style="vertical-align: middle;">CPU</span></template>
          <div ref="cpuChart" style="height: 250px; margin-bottom: 15px;"></div>
          <div class="info-list">
            <div class="info-item">
              <span class="info-label">核心数</span>
              <span class="info-value" v-if="server.cpu">{{ server.cpu.cpuNum }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">用户使用率</span>
              <span class="info-value" v-if="server.cpu">{{ server.cpu.used }}%</span>
            </div>
            <div class="info-item">
              <span class="info-label">系统使用率</span>
              <span class="info-value" v-if="server.cpu">{{ server.cpu.sys }}%</span>
            </div>
            <div class="info-item">
              <span class="info-label">当前空闲率</span>
              <span class="info-value" v-if="server.cpu">{{ server.cpu.free }}%</span>
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- 内存监控 -->
      <el-col :span="6" class="card-box">
        <el-card style="min-height: 400px;">
          <template #header><Tickets style="width: 1em; height: 1em; vertical-align: middle;" /> <span style="vertical-align: middle;">内存</span></template>
          <div ref="memChart" style="height: 250px; margin-bottom: 15px;"></div>
          <div class="info-list">
            <div class="info-item">
              <span class="info-label">总内存</span>
              <span class="info-value-group">
                <span class="info-value" v-if="server.mem">{{ server.mem.total }}G</span>
                <span class="info-value" v-if="server.jvm">/ {{ server.jvm.total }}M</span>
              </span>
            </div>
            <div class="info-item">
              <span class="info-label">已用内存</span>
              <span class="info-value-group">
                <span class="info-value" v-if="server.mem">{{ server.mem.used}}G</span>
                <span class="info-value" v-if="server.jvm">/ {{ server.jvm.used}}M</span>
              </span>
            </div>
            <div class="info-item">
              <span class="info-label">剩余内存</span>
              <span class="info-value-group">
                <span class="info-value" v-if="server.mem">{{ server.mem.free }}G</span>
                <span class="info-value" v-if="server.jvm">/ {{ server.jvm.free }}M</span>
              </span>
            </div>
            <div class="info-item">
              <span class="info-label">使用率</span>
              <span class="info-value-group">
                <span class="info-value" v-if="server.mem" :class="{'text-danger': server.mem.usage > 80}">{{ server.mem.usage }}%</span>
                <span class="info-value" v-if="server.jvm" :class="{'text-danger': server.jvm.usage > 80}">/ {{ server.jvm.usage }}%</span>
              </span>
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- JVM 监控 -->
      <el-col :span="6" class="card-box">
        <el-card style="min-height: 400px;">
          <template #header><CoffeeCup style="width: 1em; height: 1em; vertical-align: middle;" /> <span style="vertical-align: middle;">JVM 使用率</span></template>
          <div ref="jvmChart" style="height: 250px; margin-bottom: 15px;"></div>
          <div class="info-list">
            <div class="info-item">
              <span class="info-label">启动时间</span>
              <span class="info-value" v-if="server.jvm">{{ server.jvm.startTime }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">运行时长</span>
              <span class="info-value" v-if="server.jvm">{{ server.jvm.runTime }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">版本</span>
              <span class="info-value" v-if="server.jvm">{{ server.jvm.version }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">JDK名称</span>
              <span class="info-value" v-if="server.jvm">{{ server.jvm.name }}</span>
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- 磁盘使用率图表 -->
      <el-col :span="6" class="card-box">
        <el-card style="min-height: 400px;">
          <template #header><MessageBox style="width: 1em; height: 1em; vertical-align: middle;" /> <span style="vertical-align: middle;">磁盘使用率</span></template>
          <div ref="diskChart" style="height: 250px; margin-bottom: 15px;"></div>
          <div class="info-list" v-if="server.sysFiles && server.sysFiles.length > 0">
            <div class="info-item">
              <span class="info-label">磁盘数量</span>
              <span class="info-value">{{ server.sysFiles.length }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">平均使用率</span>
              <span class="info-value">
                {{ Math.round(server.sysFiles.reduce((sum, file) => sum + parseFloat(file.usage || 0), 0) / server.sysFiles.length) }}%
              </span>
            </div>
            <div class="info-item">
              <span class="info-label">最高使用率</span>
              <span class="info-value" :class="{'text-danger': Math.max(...server.sysFiles.map(f => parseFloat(f.usage || 0))) > 80}">
                {{ Math.max(...server.sysFiles.map(f => parseFloat(f.usage || 0))).toFixed(1) }}%
              </span>
            </div>
            <div class="info-item">
              <span class="info-label">警告磁盘</span>
              <span class="info-value" :class="{'text-danger': server.sysFiles.filter(f => parseFloat(f.usage || 0) > 80).length > 0}">
                {{ server.sysFiles.filter(f => parseFloat(f.usage || 0) > 80).length }}
              </span>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="24" class="card-box">
        <el-card>
          <template #header><Monitor style="width: 1em; height: 1em; vertical-align: middle;" /> <span style="vertical-align: middle;">服务器信息</span></template>
          <div class="el-table el-table--enable-row-hover el-table--medium">
            <table cellspacing="0" style="width: 100%;">
              <tbody>
                <tr>
                  <td class="el-table__cell is-leaf"><div class="cell">服务器名称</div></td>
                  <td class="el-table__cell is-leaf"><div class="cell" v-if="server.sys">{{ server.sys.computerName }}</div></td>
                  <td class="el-table__cell is-leaf"><div class="cell">操作系统</div></td>
                  <td class="el-table__cell is-leaf"><div class="cell" v-if="server.sys">{{ server.sys.osName }}</div></td>
                </tr>
                <tr>
                  <td class="el-table__cell is-leaf"><div class="cell">服务器IP</div></td>
                  <td class="el-table__cell is-leaf"><div class="cell" v-if="server.sys">{{ server.sys.computerIp }}</div></td>
                  <td class="el-table__cell is-leaf"><div class="cell">系统架构</div></td>
                  <td class="el-table__cell is-leaf"><div class="cell" v-if="server.sys">{{ server.sys.osArch }}</div></td>
                </tr>
              </tbody>
            </table>
          </div>
        </el-card>
      </el-col>

      <el-col :span="24" class="card-box">
        <el-card>
          <template #header><CoffeeCup style="width: 1em; height: 1em; vertical-align: middle;" /> <span style="vertical-align: middle;">Java虚拟机信息</span></template>
          <div class="el-table el-table--enable-row-hover el-table--medium">
            <table cellspacing="0" style="width: 100%;table-layout:fixed;">
              <tbody>
                <tr>
                  <td class="el-table__cell is-leaf"><div class="cell">Java名称</div></td>
                  <td class="el-table__cell is-leaf"><div class="cell" v-if="server.jvm">{{ server.jvm.name }}</div></td>
                  <td class="el-table__cell is-leaf"><div class="cell">Java版本</div></td>
                  <td class="el-table__cell is-leaf"><div class="cell" v-if="server.jvm">{{ server.jvm.version }}</div></td>
                </tr>
                <tr>
                  <td class="el-table__cell is-leaf"><div class="cell">启动时间</div></td>
                  <td class="el-table__cell is-leaf"><div class="cell" v-if="server.jvm">{{ server.jvm.startTime }}</div></td>
                  <td class="el-table__cell is-leaf"><div class="cell">运行时长</div></td>
                  <td class="el-table__cell is-leaf"><div class="cell" v-if="server.jvm">{{ server.jvm.runTime }}</div></td>
                </tr>
                <tr>
                  <td colspan="1" class="el-table__cell is-leaf"><div class="cell">安装路径</div></td>
                  <td colspan="3" class="el-table__cell is-leaf"><div class="cell" v-if="server.jvm">{{ server.jvm.home }}</div></td>
                </tr>
                <tr>
                  <td colspan="1" class="el-table__cell is-leaf"><div class="cell">项目路径</div></td>
                  <td colspan="3" class="el-table__cell is-leaf"><div class="cell" v-if="server.sys">{{ server.sys.userDir }}</div></td>
                </tr>
                <tr>
                  <td colspan="1" class="el-table__cell is-leaf"><div class="cell">运行参数</div></td>
                  <td colspan="3" class="el-table__cell is-leaf"><div class="cell" v-if="server.jvm">{{ server.jvm.inputArgs }}</div></td>
                </tr>
              </tbody>
            </table>
          </div>
        </el-card>
      </el-col>

      <el-col :span="24" class="card-box">
        <el-card>
          <template #header><MessageBox style="width: 1em; height: 1em; vertical-align: middle;" /> <span style="vertical-align: middle;">磁盘状态</span></template>
          <div class="el-table el-table--enable-row-hover el-table--medium">
            <table cellspacing="0" style="width: 100%;">
              <thead>
                <tr>
                  <th class="el-table__cell el-table__cell is-leaf"><div class="cell">盘符路径</div></th>
                  <th class="el-table__cell is-leaf"><div class="cell">文件系统</div></th>
                  <th class="el-table__cell is-leaf"><div class="cell">盘符类型</div></th>
                  <th class="el-table__cell is-leaf"><div class="cell">总大小</div></th>
                  <th class="el-table__cell is-leaf"><div class="cell">可用大小</div></th>
                  <th class="el-table__cell is-leaf"><div class="cell">已用大小</div></th>
                  <th class="el-table__cell is-leaf"><div class="cell">已用百分比</div></th>
                </tr>
              </thead>
              <tbody v-if="server.sysFiles">
                <tr v-for="(sysFile, index) in server.sysFiles" :key="index">
                  <td class="el-table__cell is-leaf"><div class="cell">{{ sysFile.dirName }}</div></td>
                  <td class="el-table__cell is-leaf"><div class="cell">{{ sysFile.sysTypeName }}</div></td>
                  <td class="el-table__cell is-leaf"><div class="cell">{{ sysFile.typeName }}</div></td>
                  <td class="el-table__cell is-leaf"><div class="cell">{{ sysFile.total }}</div></td>
                  <td class="el-table__cell is-leaf"><div class="cell">{{ sysFile.free }}</div></td>
                  <td class="el-table__cell is-leaf"><div class="cell">{{ sysFile.used }}</div></td>
                  <td class="el-table__cell is-leaf"><div class="cell" :class="{'text-danger': sysFile.usage > 80}">{{ sysFile.usage }}%</div></td>
                </tr>
              </tbody>
            </table>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { getServer } from '@/api/monitor/server'
import * as echarts from 'echarts'

const server = ref([])
const cpuChart = ref(null)
const memChart = ref(null)
const jvmChart = ref(null)
const diskChart = ref(null)
const { proxy } = getCurrentInstance()

let cpuChartInstance = null
let memChartInstance = null
let jvmChartInstance = null
let diskChartInstance = null

// 初始化 CPU 图表
function initCpuChart() {
  if (!cpuChart.value || !server.value.cpu) return
  
  cpuChartInstance = echarts.init(cpuChart.value)
  const cpuUsage = parseFloat(server.value.cpu.used || 0)
  
  const option = {
    tooltip: {
      formatter: '{a} <br/>{b} : {c}%'
    },
    series: [
      {
        name: 'CPU使用率',
        type: 'gauge',
        min: 0,
        max: 100,
        splitNumber: 10,
        radius: '85%',
        axisLine: {
          lineStyle: {
            width: 15,
            color: [
              [cpuUsage / 100, '#67C23A'],
              [0.7, '#E6A23C'],
              [1, '#F56C6C']
            ]
          }
        },
        pointer: {
          itemStyle: {
            color: 'auto'
          }
        },
        axisTick: {
          distance: -30,
          length: 8,
          lineStyle: {
            color: '#fff',
            width: 2
          }
        },
        splitLine: {
          distance: -30,
          length: 30,
          lineStyle: {
            color: '#fff',
            width: 4
          }
        },
        axisLabel: {
          color: '#999',
          distance: 40,
          fontSize: 12
        },
        detail: {
          valueAnimation: true,
          formatter: '{value}%',
          color: 'auto',
          fontSize: 20,
          fontWeight: 'bold',
          offsetCenter: [0, '60%']
        },
        data: [
          {
            value: cpuUsage,
            name: 'CPU使用率'
          }
        ]
      }
    ]
  }
  cpuChartInstance.setOption(option)
}

// 初始化内存图表
function initMemChart() {
  if (!memChart.value || !server.value.mem) return
  
  memChartInstance = echarts.init(memChart.value)
  const memUsage = parseFloat(server.value.mem.usage || 0)
  
  const option = {
    tooltip: {
      formatter: '{a} <br/>{b} : {c}%'
    },
    series: [
      {
        name: '内存使用率',
        type: 'gauge',
        min: 0,
        max: 100,
        splitNumber: 10,
        radius: '85%',
        axisLine: {
          lineStyle: {
            width: 15,
            color: [
              [memUsage / 100, '#409EFF'],
              [0.7, '#E6A23C'],
              [1, '#F56C6C']
            ]
          }
        },
        pointer: {
          itemStyle: {
            color: 'auto'
          }
        },
        axisTick: {
          distance: -30,
          length: 8,
          lineStyle: {
            color: '#fff',
            width: 2
          }
        },
        splitLine: {
          distance: -30,
          length: 30,
          lineStyle: {
            color: '#fff',
            width: 4
          }
        },
        axisLabel: {
          color: '#999',
          distance: 40,
          fontSize: 12
        },
        detail: {
          valueAnimation: true,
          formatter: '{value}%',
          color: 'auto',
          fontSize: 20,
          fontWeight: 'bold',
          offsetCenter: [0, '60%']
        },
        data: [
          {
            value: memUsage,
            name: '内存使用率'
          }
        ]
      }
    ]
  }
  memChartInstance.setOption(option)
}

// 初始化 JVM 图表
function initJvmChart() {
  if (!jvmChart.value || !server.value.jvm) return
  
  jvmChartInstance = echarts.init(jvmChart.value)
  const jvmUsage = parseFloat(server.value.jvm.usage || 0)
  
  const option = {
    tooltip: {
      formatter: '{a} <br/>{b} : {c}%'
    },
    series: [
      {
        name: 'JVM使用率',
        type: 'gauge',
        min: 0,
        max: 100,
        splitNumber: 10,
        radius: '85%',
        axisLine: {
          lineStyle: {
            width: 15,
            color: [
              [jvmUsage / 100, '#67C23A'],
              [0.7, '#E6A23C'],
              [1, '#F56C6C']
            ]
          }
        },
        pointer: {
          itemStyle: {
            color: 'auto'
          }
        },
        axisTick: {
          distance: -30,
          length: 8,
          lineStyle: {
            color: '#fff',
            width: 2
          }
        },
        splitLine: {
          distance: -30,
          length: 30,
          lineStyle: {
            color: '#fff',
            width: 4
          }
        },
        axisLabel: {
          color: '#999',
          distance: 40,
          fontSize: 12
        },
        detail: {
          valueAnimation: true,
          formatter: '{value}%',
          color: 'auto',
          fontSize: 20,
          fontWeight: 'bold',
          offsetCenter: [0, '60%']
        },
        data: [
          {
            value: jvmUsage,
            name: 'JVM使用率'
          }
        ]
      }
    ]
  }
  jvmChartInstance.setOption(option)
}

// 初始化磁盘图表
function initDiskChart() {
  if (!diskChart.value || !server.value.sysFiles || server.value.sysFiles.length === 0) return
  
  diskChartInstance = echarts.init(diskChart.value)
  
  // 准备条形图数据
  const diskNames = server.value.sysFiles.map(file => file.dirName)
  const diskUsage = server.value.sysFiles.map(file => parseFloat(file.usage || 0))
  const diskColors = diskUsage.map(usage => 
    usage > 80 ? '#F56C6C' : usage > 60 ? '#E6A23C' : '#67C23A'
  )
  
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      formatter: function(params) {
        const param = params[0]
        const index = param.dataIndex
        const file = server.value.sysFiles[index]
        return `${file.dirName}<br/>` +
               `使用率: ${file.usage}%<br/>` +
               `总大小: ${file.total}<br/>` +
               `已用: ${file.used}<br/>` +
               `可用: ${file.free}`
      }
    },
    grid: {
      left: '15%',
      right: '10%',
      bottom: '10%',
      top: '10%',
      containLabel: false
    },
    xAxis: {
      type: 'value',
      max: 100,
      axisLabel: {
        formatter: '{value}%'
      },
      splitLine: {
        lineStyle: {
          type: 'dashed'
        }
      }
    },
    yAxis: {
      type: 'category',
      data: diskNames,
      axisLabel: {
        fontSize: 11,
        interval: 0
      }
    },
    series: [
      {
        name: '磁盘使用率',
        type: 'bar',
        data: diskUsage.map((value, index) => ({
          value: value,
          itemStyle: {
            color: diskColors[index],
            borderRadius: [0, 4, 4, 0]
          }
        })),
        label: {
          show: true,
          position: 'right',
          formatter: '{c}%',
          fontSize: 11
        },
        barWidth: '80%'
      }
    ]
  }
  diskChartInstance.setOption(option)
}

// 窗口大小改变时重新调整图表
function handleResize() {
  if (cpuChartInstance) cpuChartInstance.resize()
  if (memChartInstance) memChartInstance.resize()
  if (jvmChartInstance) jvmChartInstance.resize()
  if (diskChartInstance) diskChartInstance.resize()
}

function getList() {
  proxy.$modal.loading("正在加载服务监控数据，请稍候！")
  getServer().then(response => {
    server.value = response.data
    proxy.$modal.closeLoading()
    
    // 等待 DOM 更新后初始化图表
    nextTick(() => {
      initCpuChart()
      initMemChart()
      initJvmChart()
      initDiskChart()
    })
  })
}

onMounted(() => {
  getList()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  if (cpuChartInstance) cpuChartInstance.dispose()
  if (memChartInstance) memChartInstance.dispose()
  if (jvmChartInstance) jvmChartInstance.dispose()
  if (diskChartInstance) diskChartInstance.dispose()
})
</script>

<style scoped>
.info-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.info-item:last-child {
  border-bottom: none;
}

.info-label {
  font-size: 13px;
  color: var(--el-text-color-regular);
  font-weight: 500;
}

.info-value {
  font-size: 13px;
  color: var(--el-text-color-primary);
  font-weight: 600;
}

.info-value-group {
  display: flex;
  align-items: center;
  gap: 4px;
}

.info-value-group .info-value {
  font-size: 12px;
}

.text-danger {
  color: var(--el-color-danger);
  font-weight: 600;
}
</style>
