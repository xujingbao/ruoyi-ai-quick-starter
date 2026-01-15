import { message as staticMessage, notification as staticNotification, Modal as staticModal } from 'antd'
import { getAntdAppApi } from './antdApp'

let loadingInstance = null

const getMessage = () => getAntdAppApi()?.message || staticMessage
const getNotification = () => getAntdAppApi()?.notification || staticNotification
const getModal = () => getAntdAppApi()?.modal || staticModal

export default {
  // 消息提示
  msg(content) {
    getMessage().info(content)
  },
  // 错误消息
  msgError(content) {
    getMessage().error(content)
  },
  // 成功消息
  msgSuccess(content) {
    getMessage().success(content)
  },
  // 警告消息
  msgWarning(content) {
    getMessage().warning(content)
  },
  // 弹出提示
  alert(content) {
    getModal().info({
      title: '系统提示',
      content
    })
  },
  // 错误提示
  alertError(content) {
    getModal().error({
      title: '系统提示',
      content
    })
  },
  // 成功提示
  alertSuccess(content) {
    getModal().success({
      title: '系统提示',
      content
    })
  },
  // 警告提示
  alertWarning(content) {
    getModal().warning({
      title: '系统提示',
      content
    })
  },
  // 通知提示
  notify(content) {
    getNotification().info({ message: content })
  },
  // 错误通知
  notifyError(content) {
    getNotification().error({ message: content })
  },
  // 成功通知
  notifySuccess(content) {
    getNotification().success({ message: content })
  },
  // 警告通知
  notifyWarning(content) {
    getNotification().warning({ message: content })
  },
  // 确认窗体
  confirm(content) {
    return getModal().confirm({
      title: '系统提示',
      content,
      okText: '确定',
      cancelText: '取消'
    })
  },
  // 提交内容
  prompt(content) {
    return getModal().confirm({
      title: '系统提示',
      content,
      okText: '确定',
      cancelText: '取消'
    })
  },
  // 打开遮罩层
  loading(content) {
    loadingInstance = getMessage().loading({ content: content || '加载中...', duration: 0 })
  },
  // 关闭遮罩层
  closeLoading() {
    if (loadingInstance) {
      loadingInstance()
      loadingInstance = null
    }
  }
}
