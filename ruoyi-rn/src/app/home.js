import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  StatusBar
} from 'react-native'
import { useRouter } from 'expo-router'
import { useSelector, useDispatch } from 'react-redux'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { logOutAction } from '../store/modules/user'
import { removeToken } from '../utils/auth'

export default function HomeScreen() {
  const router = useRouter()
  const dispatch = useDispatch()
  const insets = useSafeAreaInsets()
  const [activeTab, setActiveTab] = useState(0)
  
  const user = useSelector(state => ({
    name: state.user.name || state.user.username || '用户',
    avatar: state.user.avatar
  }))

  // 退出登录
  const handleLogout = async () => {
    try {
      await dispatch(logOutAction()).unwrap()
      await removeToken()
      router.replace('/login')
    } catch (error) {
      console.error('退出登录失败:', error)
    }
  }

  // Tab 配置 - 参考纷享销客
  const tabs = [
    { id: 0, label: '首页', icon: '🏠' },
    { id: 1, label: '工作', icon: '💼' },
    { id: 2, label: '客户', icon: '👥' },
    { id: 3, label: '我的', icon: '👤' }
  ]

  // 渲染内容
  const renderContent = () => {
    switch (activeTab) {
      case 0:
        return <HomeTab user={user} />
      case 1:
        return <WorkTab />
      case 2:
        return <CustomerTab />
      case 3:
        return <ProfileTab user={user} onLogout={handleLogout} />
      default:
        return <HomeTab user={user} />
    }
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle={activeTab === 0 ? "light-content" : "dark-content"} />
      {/* 内容区域 */}
      <View style={styles.content}>
        {renderContent()}
      </View>

      {/* Tab 导航栏 */}
      <View style={[styles.tabBar, { paddingBottom: insets.bottom }]}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[styles.tabItem, activeTab === tab.id && styles.tabItemActive]}
            onPress={() => setActiveTab(tab.id)}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabIcon, activeTab === tab.id && styles.tabIconActive]}>
              {tab.icon}
            </Text>
            <Text style={[styles.tabLabel, activeTab === tab.id && styles.tabLabelActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  )
}

// 首页 Tab - 参考纷享销客设计
function HomeTab({ user }) {
  const insets = useSafeAreaInsets()
  
  // 数据统计
  const stats = [
    { label: '今日', value: '128', unit: '条', color: '#409EFF' },
    { label: '本周', value: '856', unit: '条', color: '#67C23A' },
    { label: '本月', value: '3.2K', unit: '条', color: '#E6A23C' }
  ]

  // 快捷功能 - 参考纷享销客
  const quickActions = [
    { icon: '💼', label: '工作台', color: '#409EFF', badge: 3 },
    { icon: '👥', label: '客户', color: '#67C23A' },
    { icon: '📊', label: '商机', color: '#E6A23C' },
    { icon: '✅', label: '审批', color: '#F56C6C', badge: 5 },
    { icon: '📅', label: '日程', color: '#909399' },
    { icon: '📈', label: '报表', color: '#409EFF' },
    { icon: '📝', label: '任务', color: '#67C23A', badge: 2 },
    { icon: '🔔', label: '消息', color: '#E6A23C', badge: 8 }
  ]

  // 待办事项
  const todos = [
    { title: '审批待处理', desc: '您有 5 条审批待处理', time: '刚刚', type: 'approval' },
    { title: '任务提醒', desc: '今日有 3 个任务待完成', time: '10分钟前', type: 'task' },
    { title: '客户跟进', desc: '2 个客户需要跟进', time: '1小时前', type: 'customer' }
  ]

  // 最近动态
  const activities = [
    { title: '系统公告', desc: '系统将于今晚进行升级维护', time: '2小时前', avatar: '📢' },
    { title: '数据报告', desc: '本周销售数据报告已生成', time: '5小时前', avatar: '📊' },
    { title: '团队动态', desc: '张三完成了客户跟进任务', time: '1天前', avatar: '👤' }
  ]

  return (
    <View style={styles.homeContainer}>
      {/* 顶部搜索栏 */}
      <View style={[styles.searchHeader, { paddingTop: Math.max(insets.top, 44) + 12 }]}>
        <View style={styles.searchHeaderRow}>
          <View style={styles.searchBar}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="搜索客户、商机、任务..."
              placeholderTextColor="#C0C4CC"
              editable={false}
            />
          </View>
          <TouchableOpacity style={styles.messageBtn}>
            <Text style={styles.messageIcon}>🔔</Text>
            <View style={styles.messageBadge} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* 数据统计卡片 */}
        <View style={styles.statsContainer}>
          {stats.map((stat, index) => (
            <View key={index} style={styles.statCard}>
              <Text style={styles.statLabel}>{stat.label}</Text>
              <View style={styles.statValueRow}>
                <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
                <Text style={styles.statUnit}>{stat.unit}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* 快捷功能入口 */}
        <View style={styles.quickActionsContainer}>
          <View style={styles.quickActionsGrid}>
            {quickActions.map((action, index) => (
              <TouchableOpacity
                key={index}
                style={styles.quickActionItem}
                activeOpacity={0.7}
              >
                <View style={styles.quickActionIconWrapper}>
                  <View style={[styles.quickActionIcon, { backgroundColor: action.color + '15' }]}>
                    <Text style={styles.quickActionIconText}>{action.icon}</Text>
                  </View>
                  {action.badge && (
                    <View style={styles.quickActionBadge}>
                      <Text style={styles.quickActionBadgeText}>{action.badge}</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.quickActionLabel}>{action.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 待办事项 */}
        <View style={styles.todosContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>待办事项</Text>
            <TouchableOpacity>
              <Text style={styles.sectionMore}>查看全部 ›</Text>
            </TouchableOpacity>
          </View>
          {todos.map((todo, index) => (
            <TouchableOpacity
              key={index}
              style={styles.todoItem}
              activeOpacity={0.7}
            >
              <View style={[styles.todoIcon, { backgroundColor: getTodoColor(todo.type) + '15' }]}>
                <Text style={[styles.todoIconText, { color: getTodoColor(todo.type) }]}>
                  {getTodoIcon(todo.type)}
                </Text>
              </View>
              <View style={styles.todoContent}>
                <View style={styles.todoHeader}>
                  <Text style={styles.todoTitle}>{todo.title}</Text>
                  <Text style={styles.todoTime}>{todo.time}</Text>
                </View>
                <Text style={styles.todoDesc}>{todo.desc}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* 最近动态 */}
        <View style={styles.activitiesContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>最近动态</Text>
            <TouchableOpacity>
              <Text style={styles.sectionMore}>更多 ›</Text>
            </TouchableOpacity>
          </View>
          {activities.map((activity, index) => (
            <TouchableOpacity
              key={index}
              style={styles.activityItem}
              activeOpacity={0.7}
            >
              <View style={styles.activityAvatar}>
                <Text style={styles.activityAvatarText}>{activity.avatar}</Text>
              </View>
              <View style={styles.activityContent}>
                <View style={styles.activityHeader}>
                  <Text style={styles.activityTitle}>{activity.title}</Text>
                  <Text style={styles.activityTime}>{activity.time}</Text>
                </View>
                <Text style={styles.activityDesc}>{activity.desc}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  )
}

// 辅助函数
function getTodoIcon(type) {
  const icons = {
    approval: '✅',
    task: '📝',
    customer: '👥'
  }
  return icons[type] || '📋'
}

function getTodoColor(type) {
  const colors = {
    approval: '#F56C6C',
    task: '#409EFF',
    customer: '#67C23A'
  }
  return colors[type] || '#909399'
}

// 工作 Tab
function WorkTab() {
  const insets = useSafeAreaInsets()
  const workItems = [
    { title: '我的任务', desc: '待处理任务 3 条', icon: '📝', color: '#409EFF' },
    { title: '我的审批', desc: '待审批 5 条', icon: '✅', color: '#F56C6C' },
    { title: '我的日程', desc: '今日日程 2 个', icon: '📅', color: '#67C23A' },
    { title: '工作报表', desc: '查看数据报表', icon: '📊', color: '#E6A23C' }
  ]

  return (
    <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <View style={[styles.tabHeader, { paddingTop: Math.max(insets.top, 44) + 20 }]}>
        <Text style={styles.tabHeaderTitle}>工作台</Text>
        <Text style={styles.tabHeaderDesc}>管理您的工作任务和审批</Text>
      </View>
      <View style={styles.cardContainer}>
        {workItems.map((item, index) => (
          <TouchableOpacity key={index} style={styles.workCard} activeOpacity={0.7}>
            <View style={[styles.workCardIcon, { backgroundColor: item.color + '15' }]}>
              <Text style={[styles.workCardIconText, { color: item.color }]}>{item.icon}</Text>
            </View>
            <View style={styles.workCardContent}>
              <Text style={styles.workCardTitle}>{item.title}</Text>
              <Text style={styles.workCardDesc}>{item.desc}</Text>
            </View>
            <Text style={styles.workCardArrow}>›</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  )
}

// 客户 Tab
function CustomerTab() {
  const insets = useSafeAreaInsets()
  const customers = [
    { name: '北京科技有限公司', type: '企业客户', status: '跟进中', avatar: '🏢' },
    { name: '上海贸易集团', type: '企业客户', status: '已签约', avatar: '🏢' },
    { name: '深圳创新公司', type: '企业客户', status: '待跟进', avatar: '🏢' }
  ]

  return (
    <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <View style={[styles.tabHeader, { paddingTop: Math.max(insets.top, 44) + 20 }]}>
        <Text style={styles.tabHeaderTitle}>客户管理</Text>
        <Text style={styles.tabHeaderDesc}>管理您的客户信息</Text>
      </View>
      <View style={styles.cardContainer}>
        {customers.map((customer, index) => (
          <TouchableOpacity key={index} style={styles.customerCard} activeOpacity={0.7}>
            <View style={styles.customerAvatar}>
              <Text style={styles.customerAvatarText}>{customer.avatar}</Text>
            </View>
            <View style={styles.customerContent}>
              <View style={styles.customerHeader}>
                <Text style={styles.customerName}>{customer.name}</Text>
                <View style={[styles.customerStatus, { backgroundColor: getStatusColor(customer.status) + '15' }]}>
                  <Text style={[styles.customerStatusText, { color: getStatusColor(customer.status) }]}>
                    {customer.status}
                  </Text>
                </View>
              </View>
              <Text style={styles.customerType}>{customer.type}</Text>
            </View>
            <Text style={styles.customerArrow}>›</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  )
}

function getStatusColor(status) {
  const colors = {
    '跟进中': '#409EFF',
    '已签约': '#67C23A',
    '待跟进': '#E6A23C'
  }
  return colors[status] || '#909399'
}


// 我的 Tab
function ProfileTab({ user, onLogout }) {
  const insets = useSafeAreaInsets()
  const menuItems = [
    { label: '个人信息', icon: '👤', action: () => {} },
    { label: '账号设置', icon: '⚙️', action: () => {} },
    { label: '关于我们', icon: 'ℹ️', action: () => {} },
    { label: '帮助中心', icon: '❓', action: () => {} }
  ]

  return (
    <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <View style={[styles.profileHeader, { paddingTop: Math.max(insets.top, 44) + 20 }]}>
        <View style={styles.profileAvatar}>
          <Text style={styles.profileAvatarText}>
            {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </Text>
        </View>
        <Text style={styles.profileName}>{user.name || '用户'}</Text>
        <Text style={styles.profileEmail}>{user.username || 'user@example.com'}</Text>
      </View>

      {/* React Native 信息卡片 */}
      <View style={styles.rnInfoCard}>
        <View style={styles.rnInfoHeader}>
          <Text style={styles.rnInfoIcon}>⚛️</Text>
          <Text style={styles.rnInfoTitle}>React Native 跨端应用</Text>
        </View>
        <Text style={styles.rnInfoDesc}>
          基于 React Native 开发，一套代码支持 iOS 和 Android 平台
        </Text>
      </View>

      <View style={styles.menuContainer}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.menuItem}
            onPress={item.action}
            activeOpacity={0.7}
          >
            <Text style={styles.menuIcon}>{item.icon}</Text>
            <Text style={styles.menuLabel}>{item.label}</Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.cardContainer}>
        <TouchableOpacity style={styles.logoutButton} onPress={onLogout} activeOpacity={0.7}>
          <Text style={styles.logoutButtonText}>退出登录</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  // 首页样式
  homeContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  searchHeader: {
    backgroundColor: '#67C23A',
    paddingBottom: 12,
    paddingHorizontal: 16
  },
  searchHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    paddingHorizontal: 16,
    height: 40
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
    color: '#909399'
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#303133',
    padding: 0
  },
  messageBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center'
  },
  messageIcon: {
    fontSize: 22,
    color: '#fff'
  },
  messageBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#F56C6C'
  },
  // 数据统计卡片
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
    gap: 12
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2
  },
  statLabel: {
    fontSize: 13,
    color: '#909399',
    fontWeight: '400',
    marginBottom: 8
  },
  statValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline'
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: 0.5
  },
  statUnit: {
    fontSize: 12,
    color: '#909399',
    marginLeft: 2
  },
  quickActionsContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between'
  },
  quickActionItem: {
    width: '25%',
    alignItems: 'center',
    marginBottom: 20
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8
  },
  quickActionIconWrapper: {
    position: 'relative'
  },
  quickActionIconText: {
    fontSize: 28
  },
  quickActionBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#F56C6C',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4
  },
  quickActionBadgeText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '600'
  },
  quickActionLabel: {
    fontSize: 12,
    color: '#606266',
    fontWeight: '400',
    textAlign: 'center',
    marginTop: 4
  },
  // 待办事项
  todosContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2
  },
  todoItem: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5'
  },
  todoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12
  },
  todoIconText: {
    fontSize: 20
  },
  todoContent: {
    flex: 1
  },
  todoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4
  },
  todoTitle: {
    fontSize: 16,
    color: '#303133',
    fontWeight: '600',
    letterSpacing: 0.2
  },
  todoTime: {
    fontSize: 12,
    color: '#C0C4CC',
    fontWeight: '400'
  },
  todoDesc: {
    fontSize: 14,
    color: '#606266',
    fontWeight: '400',
    lineHeight: 20
  },
  // 最近动态
  activitiesContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2
  },
  activityItem: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5'
  },
  activityAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12
  },
  activityAvatarText: {
    fontSize: 20
  },
  activityContent: {
    flex: 1
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4
  },
  activityTitle: {
    fontSize: 16,
    color: '#303133',
    fontWeight: '600',
    letterSpacing: 0.2
  },
  activityTime: {
    fontSize: 12,
    color: '#C0C4CC',
    fontWeight: '400'
  },
  activityDesc: {
    fontSize: 14,
    color: '#606266',
    fontWeight: '400',
    lineHeight: 20
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  sectionTitle: {
    fontSize: 18,
    color: '#303133',
    fontWeight: '600',
    letterSpacing: 0.3
  },
  sectionMore: {
    fontSize: 14,
    color: '#909399',
    fontWeight: '400'
  },
  content: {
    flex: 1
  },
  scrollContent: {
    flex: 1
  },
  cardContainer: {
    paddingHorizontal: 20,
    marginBottom: 20
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3
  },
  cardTitle: {
    fontSize: 20,
    color: '#303133',
    fontWeight: '600',
    marginBottom: 10,
    letterSpacing: 0.3
  },
  cardDesc: {
    fontSize: 15,
    color: '#606266',
    lineHeight: 26,
    fontWeight: '400',
    letterSpacing: 0.2
  },
  // Tab 导航栏样式
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e4e7ed',
    paddingTop: 8,
    paddingHorizontal: 0
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8
  },
  tabItemActive: {
    // 激活状态样式
  },
  tabIcon: {
    fontSize: 24,
    marginBottom: 4
  },
  tabIconActive: {
    // 激活状态图标
  },
  tabLabel: {
    fontSize: 12,
    color: '#909399',
    fontWeight: '400'
  },
  tabLabelActive: {
    color: '#67C23A',
    fontWeight: '600'
  },
  // Tab 内容样式
  tabHeader: {
    padding: 20,
    paddingBottom: 20,
    alignItems: 'center'
  },
  tabHeaderTitle: {
    fontSize: 24,
    color: '#303133',
    fontWeight: '700',
    marginBottom: 8,
    letterSpacing: 0.3
  },
  tabHeaderDesc: {
    fontSize: 14,
    color: '#909399',
    fontWeight: '400'
  },
  // 工作卡片样式
  workCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2
  },
  workCardIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12
  },
  workCardIconText: {
    fontSize: 24
  },
  workCardContent: {
    flex: 1
  },
  workCardTitle: {
    fontSize: 16,
    color: '#303133',
    fontWeight: '600',
    marginBottom: 4,
    letterSpacing: 0.2
  },
  workCardDesc: {
    fontSize: 13,
    color: '#909399',
    fontWeight: '400'
  },
  workCardArrow: {
    fontSize: 20,
    color: '#C0C4CC',
    marginLeft: 8
  },
  // 客户卡片样式
  customerCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2
  },
  customerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12
  },
  customerAvatarText: {
    fontSize: 24
  },
  customerContent: {
    flex: 1
  },
  customerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6
  },
  customerName: {
    fontSize: 16,
    color: '#303133',
    fontWeight: '600',
    letterSpacing: 0.2,
    flex: 1
  },
  customerStatus: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 8
  },
  customerStatusText: {
    fontSize: 11,
    fontWeight: '500'
  },
  customerType: {
    fontSize: 13,
    color: '#909399',
    fontWeight: '400'
  },
  customerArrow: {
    fontSize: 20,
    color: '#C0C4CC',
    marginLeft: 8
  },
  // 个人中心样式
  profileHeader: {
    alignItems: 'center',
    paddingBottom: 40,
    backgroundColor: '#fff',
    marginBottom: 20
  },
  profileAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#67C23A',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16
  },
  profileAvatarText: {
    fontSize: 32,
    color: '#fff',
    fontWeight: '700'
  },
  profileName: {
    fontSize: 22,
    color: '#303133',
    fontWeight: '600',
    marginBottom: 6,
    letterSpacing: 0.3
  },
  profileEmail: {
    fontSize: 14,
    color: '#909399',
    fontWeight: '400'
  },
  // React Native 信息卡片
  rnInfoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2
  },
  rnInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12
  },
  rnInfoIcon: {
    fontSize: 24,
    marginRight: 8
  },
  rnInfoTitle: {
    fontSize: 18,
    color: '#303133',
    fontWeight: '600',
    letterSpacing: 0.3
  },
  rnInfoDesc: {
    fontSize: 14,
    color: '#606266',
    lineHeight: 20,
    fontWeight: '400'
  },
  menuContainer: {
    backgroundColor: '#fff',
    marginBottom: 20
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5'
  },
  menuIcon: {
    fontSize: 20,
    marginRight: 12,
    width: 24
  },
  menuLabel: {
    flex: 1,
    fontSize: 16,
    color: '#303133',
    fontWeight: '400'
  },
  menuArrow: {
    fontSize: 20,
    color: '#C0C4CC'
  },
  logoutButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3
  },
  logoutButtonText: {
    fontSize: 16,
    color: '#F56C6C',
    fontWeight: '600'
  }
})

