import { message, notification, Modal, Spin } from 'antd'

let loadingInstance = null

export default {
  // 消息提示
  msg(content) {
    message.info(content)
  },
  // 错误消息
  msgError(content) {
    message.error(content)
  },
  // 成功消息
  msgSuccess(content) {
    message.success(content)
  },
  // 警告消息
  msgWarning(content) {
    message.warning(content)
  },
  // 弹出提示
  alert(content) {
    Modal.info({
      title: '系统提示',
      content
    })
  },
  // 错误提示
  alertError(content) {
    Modal.error({
      title: '系统提示',
      content
    })
  },
  // 成功提示
  alertSuccess(content) {
    Modal.success({
      title: '系统提示',
      content
    })
  },
  // 警告提示
  alertWarning(content) {
    Modal.warning({
      title: '系统提示',
      content
    })
  },
  // 通知提示
  notify(content) {
    notification.info({ message: content })
  },
  // 错误通知
  notifyError(content) {
    notification.error({ message: content })
  },
  // 成功通知
  notifySuccess(content) {
    notification.success({ message: content })
  },
  // 警告通知
  notifyWarning(content) {
    notification.warning({ message: content })
  },
  // 确认窗体
  confirm(content) {
    return Modal.confirm({
      title: '系统提示',
      content,
      okText: '确定',
      cancelText: '取消'
    })
  },
  // 提交内容
  prompt(content) {
    return Modal.confirm({
      title: '系统提示',
      content,
      okText: '确定',
      cancelText: '取消'
    })
  },
  // 打开遮罩层
  loading(content) {
    loadingInstance = message.loading({ content: content || '加载中...', duration: 0 })
  },
  // 关闭遮罩层
  closeLoading() {
    if (loadingInstance) {
      loadingInstance()
      loadingInstance = null
    }
  }
}
