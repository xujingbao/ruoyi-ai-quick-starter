import { useEffect, useRef, useState } from 'react'
import { Row, Col, Card, Divider } from 'antd'
import * as echarts from 'echarts'
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons'
import { useSettingsStore } from '@/store/settingsStore'
import './index.scss'

const Index = () => {
  const settingsStore = useSettingsStore()
  const [version] = useState('1.0.0')
  const [stats] = useState({
    totalUsers: 1234,
    onlineUsers: 56,
    todayVisits: 892,
    systemMessages: 23
  })

  const userChartRef = useRef(null)
  const operationChartRef = useRef(null)
  const performanceChartRef = useRef(null)

  const userChartInstance = useRef(null)
  const operationChartInstance = useRef(null)
  const performanceChartInstance = useRef(null)

  // 检测是否为暗色模式
  const isDark = settingsStore.isDark || (typeof document !== 'undefined' && document.documentElement.classList.contains('dark'))

  // 获取图表文字颜色
  const getChartTextColor = () => {
    return isDark ? 'rgba(255, 255, 255, 0.8)' : '#909399'
  }

  // 获取图表轴线颜色
  const getChartAxisLineColor = () => {
    return isDark ? 'rgba(255, 255, 255, 0.2)' : '#e4e7ed'
  }

  // 获取图表分割线颜色
  const getChartSplitLineColor = () => {
    return isDark ? 'rgba(255, 255, 255, 0.1)' : '#f0f2f5'
  }

  // 获取图表 tooltip 背景色
  const getChartTooltipBg = () => {
    return isDark ? 'rgba(29, 30, 31, 0.95)' : 'rgba(255, 255, 255, 0.95)'
  }

  // 获取图表 tooltip 文字颜色
  const getChartTooltipTextColor = () => {
    return isDark ? 'rgba(255, 255, 255, 0.9)' : '#303133'
  }

  // 获取图表 tooltip 边框颜色
  const getChartTooltipBorderColor = () => {
    return isDark ? 'rgba(255, 255, 255, 0.2)' : '#e4e7ed'
  }

  // 初始化用户增长趋势图
  const initUserChart = () => {
    if (!userChartRef.current) return

    // 如果已存在实例，先销毁
    const existingInstance = echarts.getInstanceByDom(userChartRef.current)
    if (existingInstance) {
      existingInstance.dispose()
    }

    userChartInstance.current = echarts.init(userChartRef.current)
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
    userChartInstance.current.setOption(option)
  }

  // 初始化操作类型分布图
  const initOperationChart = () => {
    if (!operationChartRef.current) return

    // 如果已存在实例，先销毁
    const existingInstance = echarts.getInstanceByDom(operationChartRef.current)
    if (existingInstance) {
      existingInstance.dispose()
    }

    operationChartInstance.current = echarts.init(operationChartRef.current)
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
            borderColor: isDark ? 'rgba(20, 20, 20, 0.8)' : '#fff',
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
    operationChartInstance.current.setOption(option)
  }

  // 初始化系统性能监控图
  const initPerformanceChart = () => {
    if (!performanceChartRef.current) return

    // 如果已存在实例，先销毁
    const existingInstance = echarts.getInstanceByDom(performanceChartRef.current)
    if (existingInstance) {
      existingInstance.dispose()
    }

    performanceChartInstance.current = echarts.init(performanceChartRef.current)
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
            borderColor: isDark ? 'rgba(20, 20, 20, 0.8)' : '#fff',
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
            borderColor: isDark ? 'rgba(20, 20, 20, 0.8)' : '#fff',
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
    performanceChartInstance.current.setOption(option)
  }

  // 窗口大小改变时重新调整图表
  const handleResize = () => {
    userChartInstance.current?.resize()
    operationChartInstance.current?.resize()
    performanceChartInstance.current?.resize()
  }

  useEffect(() => {
    // 延迟初始化图表，确保 DOM 完全渲染
    const timer = setTimeout(() => {
      initUserChart()
      initOperationChart()
      initPerformanceChart()

      window.addEventListener('resize', handleResize)
    }, 100)

    // 监听暗色模式变化
    const observer = new MutationObserver(() => {
      setTimeout(() => {
        if (userChartInstance.current) {
          initUserChart()
        }
        if (operationChartInstance.current) {
          initOperationChart()
        }
        if (performanceChartInstance.current) {
          initPerformanceChart()
        }
      }, 100)
    })

    if (typeof document !== 'undefined') {
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['class']
      })
    }

    return () => {
      clearTimeout(timer)
      window.removeEventListener('resize', handleResize)
      observer.disconnect()
      userChartInstance.current?.dispose()
      operationChartInstance.current?.dispose()
      performanceChartInstance.current?.dispose()
    }
  }, [])

  return (
    <div className="app-container home">
      <Row gutter={16} className="intro-row">
        <Col xs={24} lg={12}>
          <h2>RuoYi AI Quick Starter</h2>
          <p>
            RuoYi AI Quick Starter 是基于 RuoYi 的 <strong>AI 快速开发框架</strong>，AI 友好设计，前后端工程统一在同一仓库，便于 AI 理解完整业务上下文，实现全栈开发。可快速生成模块完整代码（数据库表、后端接口、前端页面、API 对接）。
          </p>
          <p>
            保留前后端分离架构，确保代码可维护性和团队协作灵活性。内置用户权限管理、系统监控、定时任务、操作日志等企业级功能模块，开箱即用，助力高效开发。
          </p>
          <p>
            <b>当前版本:</b> <span>v{version}</span>
          </p>
        </Col>

        <Col xs={24} lg={12}>
          <Row>
            <Col span={12}>
              <h2>技术选型</h2>
            </Col>
          </Row>
          <Row>
            <Col span={12}>
              <h4>后端技术</h4>
              <ul>
                <li>Spring Boot 3.x</li>
                <li>MyBatis</li>
                <li>Redis</li>
                <li>PostgreSQL 15+</li>
              </ul>
            </Col>
            <Col span={12}>
              <h4>客户端技术</h4>
              <ul>
                <li>React 18</li>
                <li>Ant Design</li>
                <li>Vite</li>
                <li>uni-app</li>
                <li>pnpm</li>
              </ul>
            </Col>
          </Row>
        </Col>
      </Row>
      <Divider style={{ margin: '16px 0' }} />
      
      {/* 统计卡片 */}
      <Row gutter={16} className="stats-row">
        <Col xs={12} sm={6} md={6} lg={6}>
          <Card className="stat-card stat-card-primary" hoverable>
            <div className="stat-content-compact">
              <div className="stat-icon-compact">
                <img src="/tech/user.svg" alt="总用户数" className="stat-icon-img" />
              </div>
              <div className="stat-info-compact">
                <div className="stat-label-compact">总用户数</div>
                <div className="stat-value-compact">{stats.totalUsers}</div>
              </div>
              <div className="stat-trend-compact up">
                <ArrowUpOutlined style={{ fontSize: 12, marginRight: 3 }} /> 12.5%
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={12} sm={6} md={6} lg={6}>
          <Card className="stat-card stat-card-success" hoverable>
            <div className="stat-content-compact">
              <div className="stat-icon-compact">
                <img src="/tech/user-online.svg" alt="在线用户" className="stat-icon-img" />
              </div>
              <div className="stat-info-compact">
                <div className="stat-label-compact">在线用户</div>
                <div className="stat-value-compact">{stats.onlineUsers}</div>
              </div>
              <div className="stat-trend-compact up">
                <ArrowUpOutlined style={{ fontSize: 12, marginRight: 3 }} /> 8.2%
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={12} sm={6} md={6} lg={6}>
          <Card className="stat-card stat-card-warning" hoverable>
            <div className="stat-content-compact">
              <div className="stat-icon-compact">
                <img src="/tech/view.svg" alt="今日访问" className="stat-icon-img" />
              </div>
              <div className="stat-info-compact">
                <div className="stat-label-compact">今日访问</div>
                <div className="stat-value-compact">{stats.todayVisits}</div>
              </div>
              <div className="stat-trend-compact up">
                <ArrowUpOutlined style={{ fontSize: 12, marginRight: 3 }} /> 15.3%
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={12} sm={6} md={6} lg={6}>
          <Card className="stat-card stat-card-danger" hoverable>
            <div className="stat-content-compact">
              <div className="stat-icon-compact">
                <img src="/tech/bell.svg" alt="系统消息" className="stat-icon-img" />
              </div>
              <div className="stat-info-compact">
                <div className="stat-label-compact">系统消息</div>
                <div className="stat-value-compact">{stats.systemMessages}</div>
              </div>
              <div className="stat-trend-compact down">
                <ArrowDownOutlined style={{ fontSize: 12, marginRight: 3 }} /> 5.1%
              </div>
            </div>
          </Card>
        </Col>
      </Row>
      <Divider style={{ margin: '16px 0' }} />
      
      {/* 趋势图表 */}
      <Row gutter={16} className="chart-row">
        <Col xs={24} sm={24} md={8} lg={8}>
          <Card className="chart-card" hoverable
            title={
              <div className="chart-header">
                <span className="chart-title">用户增长趋势</span>
                <span className="chart-subtitle">最近6个月</span>
              </div>
            }
          >
            <div ref={userChartRef} className="chart-container"></div>
          </Card>
        </Col>
        <Col xs={24} sm={24} md={8} lg={8}>
          <Card className="chart-card" hoverable
            title={
              <div className="chart-header">
                <span className="chart-title">操作类型分布</span>
                <span className="chart-subtitle">实时统计</span>
              </div>
            }
          >
            <div ref={operationChartRef} className="chart-container"></div>
          </Card>
        </Col>
        <Col xs={24} sm={24} md={8} lg={8}>
          <Card className="chart-card" hoverable
            title={
              <div className="chart-header">
                <span className="chart-title">系统性能监控</span>
                <span className="chart-subtitle">24小时</span>
              </div>
            }
          >
            <div ref={performanceChartRef} className="chart-container"></div>
          </Card>
        </Col>
      </Row>
      <Divider style={{ margin: '16px 0' }} />
      
      <Row gutter={16}>
        <Col xs={24} sm={24} md={12} lg={8}>
          <Card
            title={<div className="card-header"><span className="card-title">核心特性</span></div>}
          >
            <div className="body">
              <ul>
                <li>✅ 企业级功能模块（用户权限、系统监控、定时任务等）</li>
                <li>✅ AI 辅助开发基础，规范化项目结构</li>
                <li>✅ 前后端统一仓库，便于 AI 理解业务上下文</li>
                <li>✅ 支持 Web 和移动端多端开发</li>
                <li>✅ 完善的开发规范文档</li>
                <li>✅ 预配置调试启动项，支持断点调试</li>
              </ul>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={24} md={12} lg={8}>
          <Card
            title={<div className="card-header"><span className="card-title">快速开始</span></div>}
          >
            <div className="body">
              <ol>
                <li>环境准备：JDK 17+、Maven 3.6+、Node.js 20.19+ 或 22.12+、pnpm 9+、PostgreSQL 15+、Redis 6.0+</li>
                <li>初始化数据库：执行 <code>sql/ry-demo-postgresql.sql</code> 和 <code>sql/quartz-postgresql.sql</code></li>
                <li>启动服务：在 Cursor 中按 <kbd>F5</kbd>，选择 "RuoYi Backend" 或 "RuoYi Frontend"</li>
                <li>访问系统：前端 <a href="http://localhost" target="_blank" rel="noopener noreferrer">http://localhost</a>，API 文档 <a href="http://localhost:8080/swagger-ui.html" target="_blank" rel="noopener noreferrer">http://localhost:8080/swagger-ui.html</a></li>
              </ol>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={24} md={12} lg={8}>
          <Card
            title={<div className="card-header"><span className="card-title">开发指南</span></div>}
          >
            <div className="body">
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
                更多信息请查看项目 <a href="README.md" target="_blank" rel="noopener noreferrer">README.md</a> 文档。
              </p>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default Index
