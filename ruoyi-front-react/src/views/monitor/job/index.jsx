import { useEffect, useState } from 'react'
import { Form, Input, Select, DatePicker, Button, Table, Modal, Switch, Radio, Space, Tooltip, InputNumber } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, DownloadOutlined, PlayCircleOutlined, PauseCircleOutlined, SearchOutlined, ReloadOutlined, CloudSyncOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import { listJob, getJob, addJob, updateJob, delJob, changeJobStatus, runJob } from '@/api/monitor/job'
import { useDict } from '@/utils/dict'
import { addDateRange, parseTime } from '@/utils/ruoyi'
import { download } from '@/utils/request'
import auth from '@/plugins/auth'
import modal from '@/plugins/modal'
import Pagination from '@/components/Pagination'
import RightToolbar from '@/components/RightToolbar'
import './index.scss'

const { RangePicker } = DatePicker
const { TextArea } = Input

const Job = () => {
  const [queryForm] = Form.useForm()
  const [form] = Form.useForm()

  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [showSearch, setShowSearch] = useState(true)
  const [selectedRowKeys, setSelectedRowKeys] = useState([])
  const [total, setTotal] = useState(0)
  const [dateRange, setDateRange] = useState([])
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [isEdit, setIsEdit] = useState(false)

  const { sys_job_status = [], sys_job_group = [], sys_misfire = [], sys_yes_no = [] } = useDict(
    'sys_job_status',
    'sys_job_group',
    'sys_misfire',
    'sys_yes_no'
  )

  const [queryParams, setQueryParams] = useState({
    pageNum: 1,
    pageSize: 10,
    jobName: undefined,
    jobGroup: undefined,
    status: undefined
  })

  useEffect(() => {
    getList()
  }, [queryParams, dateRange])

  const getList = async () => {
    setLoading(true)
    try {
      const params = addDateRange(queryParams, dateRange)
      const res = await listJob(params)
      setList(res.rows || [])
      setTotal(res.total || 0)
    } catch (error) {
      console.error('Failed to fetch job list:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleQuery = () => {
    const values = queryForm.getFieldsValue()
    setQueryParams(prev => ({
      ...prev,
      ...values,
      pageNum: 1
    }))
  }

  const resetQuery = () => {
    setDateRange([])
    queryForm.resetFields()
    setQueryParams({
      pageNum: 1,
      pageSize: 10,
      jobName: undefined,
      jobGroup: undefined,
      status: undefined
    })
    getList()
  }

  const handlePagination = ({ page, limit }) => {
    setQueryParams(prev => ({
      ...prev,
      pageNum: page,
      pageSize: limit
    }))
  }

  const handleSelectionChange = (keys) => setSelectedRowKeys(keys)

  const openAdd = () => {
    resetForm()
    setOpen(true)
    setTitle('新增任务')
    setIsEdit(false)
  }

  const openEdit = async (row) => {
    resetForm()
    const jobId = row?.jobId || (selectedRowKeys.length === 1 ? selectedRowKeys[0] : null)
    if (!jobId) {
      modal.msgWarning('请选择要修改的任务')
      return
    }
    try {
      const res = await getJob(jobId)
      setOpen(true)
      setTitle('修改任务')
      setIsEdit(true)
      form.setFieldsValue({
        ...res.data,
        nextValidTime: undefined // 不编辑下次执行时间
      })
    } catch (error) {
      console.error('Failed to get job:', error)
    }
  }

  const handleDelete = (row) => {
    const jobIds = row?.jobId || selectedRowKeys
    if (!jobIds || (Array.isArray(jobIds) && jobIds.length === 0)) {
      modal.msgWarning('请选择要删除的任务')
      return
    }
    Modal.confirm({
      title: '提示',
      content: `是否确认删除任务编号为"${jobIds}"的数据项？`,
      onOk: async () => {
        try {
          await delJob(jobIds)
          modal.msgSuccess('删除成功')
          getList()
          setSelectedRowKeys([])
        } catch (error) {
          console.error('Failed to delete job:', error)
        }
      }
    })
  }

  const handleStatusChange = async (checked, row) => {
    const text = checked ? '启用' : '停用'
    const status = checked ? '0' : '1'
    try {
      await changeJobStatus(row.jobId, status)
      modal.msgSuccess(`${text}成功`)
      getList()
    } catch (error) {
      console.error('Failed to change status:', error)
    }
  }

  const handleRun = async (row) => {
    Modal.confirm({
      title: '提示',
      content: `确认要立即执行一次"${row.jobName}"任务吗？`,
      onOk: async () => {
        try {
          await runJob(row.jobId, row.jobGroup)
          modal.msgSuccess('执行成功')
        } catch (error) {
          console.error('Failed to run job:', error)
        }
      }
    })
  }

  const handleExport = () => {
    download('monitor/job/export', queryParams, `job_${new Date().getTime()}.xlsx`)
  }

  const resetForm = () => {
    form.resetFields()
    form.setFieldsValue({
      jobId: undefined,
      jobName: undefined,
      jobGroup: 'DEFAULT',
      invokeTarget: undefined,
      cronExpression: undefined,
      misfirePolicy: '3',
      concurrent: '1',
      status: '0',
      remark: undefined
    })
  }

  const submitForm = async () => {
    try {
      const values = await form.validateFields()
      if (values.jobId !== undefined && values.jobId !== null && values.jobId !== '') {
        await updateJob(values)
        modal.msgSuccess('修改成功')
      } else {
        await addJob(values)
        modal.msgSuccess('新增成功')
      }
      setOpen(false)
      getList()
    } catch (error) {
      console.error('Validation or submit failed:', error)
    }
  }

  const columns = [
    {
      title: '任务编号',
      dataIndex: 'jobId',
      key: 'jobId',
      width: 90
    },
    {
      title: '任务名称',
      dataIndex: 'jobName',
      key: 'jobName',
      ellipsis: true
    },
    {
      title: '任务组名',
      dataIndex: 'jobGroup',
      key: 'jobGroup',
      width: 120,
      render: (text) => {
        const match = sys_job_group.find(d => d.value === text)
        const label = match ? match.label : text
        return label
      }
    },
    {
      title: '调用目标字符串',
      dataIndex: 'invokeTarget',
      key: 'invokeTarget',
      ellipsis: true
    },
    {
      title: 'cron执行表达式',
      dataIndex: 'cronExpression',
      key: 'cronExpression',
      width: 160
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (_, record) => (
        <Switch
          checked={record.status === '0'}
          checkedChildren="正常"
          unCheckedChildren="暂停"
          onChange={(checked) => handleStatusChange(checked, record)}
          disabled={!auth.hasPermiOr(['monitor:job:changeStatus'])}
        />
      )
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 180,
      render: (text) => parseTime(text)
    },
    {
      title: '操作',
      key: 'action',
      width: 240,
      render: (_, record) => (
        <Space size="small">
          {auth.hasPermiOr(['monitor:job:edit']) && (
            <Tooltip title="编辑">
              <Button
                type="link"
                icon={<EditOutlined />}
                size="small"
                onClick={() => openEdit(record)}
              />
            </Tooltip>
          )}
          {auth.hasPermiOr(['monitor:job:delete']) && (
            <Tooltip title="删除">
              <Button
                type="link"
                danger
                icon={<DeleteOutlined />}
                size="small"
                onClick={() => handleDelete(record)}
              />
            </Tooltip>
          )}
          {auth.hasPermiOr(['monitor:job:changeStatus']) && (
            <Tooltip title="立即执行一次">
              <Button
                type="link"
                icon={<PlayCircleOutlined />}
                size="small"
                onClick={() => handleRun(record)}
              />
            </Tooltip>
          )}
          {auth.hasPermiOr(['monitor:job:query']) && (
            <Tooltip title="调度日志">
              <Button
                type="link"
                icon={<CloudSyncOutlined />}
                size="small"
                onClick={() => window.open(`/monitor/job-log/index/${record.jobId}`, '_blank')}
              />
            </Tooltip>
          )}
        </Space>
      )
    }
  ]

  return (
    <div className="app-container job-page">
      <Form
        form={queryForm}
        layout="inline"
        className="search-form"
        style={{ display: showSearch ? 'flex' : 'none', marginBottom: 16 }}
      >
        <Form.Item label="任务名称" name="jobName">
          <Input
            placeholder="请输入任务名称"
            style={{ width: 240 }}
            onPressEnter={handleQuery}
            allowClear
          />
        </Form.Item>
        <Form.Item label="任务组名" name="jobGroup">
          <Select
            placeholder="请选择任务组名"
            style={{ width: 240 }}
            allowClear
          >
            {sys_job_group?.map(dict => (
              <Select.Option key={dict.value} value={dict.value}>
                {dict.label}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item label="任务状态" name="status">
          <Select
            placeholder="请选择任务状态"
            style={{ width: 240 }}
            allowClear
          >
            {sys_job_status?.map(dict => (
              <Select.Option key={dict.value} value={dict.value}>
                {dict.label}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item label="执行时间">
          <RangePicker
            value={dateRange.length ? [dayjs(dateRange[0]), dayjs(dateRange[1])] : null}
            onChange={(dates) => {
              setDateRange(dates ? [dates[0].format('YYYY-MM-DD'), dates[1].format('YYYY-MM-DD')] : [])
            }}
            format="YYYY-MM-DD"
          />
        </Form.Item>
        <Form.Item>
          <Button type="primary" icon={<SearchOutlined />} onClick={handleQuery}>
            搜索
          </Button>
          <Button icon={<ReloadOutlined />} onClick={resetQuery} style={{ marginLeft: 8 }}>
            重置
          </Button>
        </Form.Item>
      </Form>

      <div style={{ marginBottom: 16 }}>
        <Space>
          {auth.hasPermiOr(['monitor:job:add']) && (
            <Button type="primary" icon={<PlusOutlined />} onClick={openAdd}>
              新增
            </Button>
          )}
          {auth.hasPermiOr(['monitor:job:edit']) && (
            <Button
              type="default"
              icon={<EditOutlined />}
              disabled={selectedRowKeys.length !== 1}
              onClick={() => openEdit({ jobId: selectedRowKeys[0] })}
            >
              修改
            </Button>
          )}
          {auth.hasPermiOr(['monitor:job:delete']) && (
            <Button
              type="default"
              danger
              icon={<DeleteOutlined />}
              disabled={!selectedRowKeys.length}
              onClick={() => handleDelete()}
            >
              删除
            </Button>
          )}
          {auth.hasPermiOr(['monitor:job:export']) && (
            <Button type="default" icon={<DownloadOutlined />} onClick={handleExport}>
              导出
            </Button>
          )}
          <RightToolbar
            showSearch={showSearch}
            columns={{}}
            onShowSearchChange={setShowSearch}
            onQueryTable={getList}
          />
        </Space>
      </div>

      <Table
        loading={loading}
        dataSource={list}
        columns={columns}
        rowSelection={{
          selectedRowKeys,
          onChange: handleSelectionChange
        }}
        rowKey="jobId"
        pagination={false}
      />

      <Pagination
        total={total}
        page={queryParams.pageNum}
        limit={queryParams.pageSize}
        onChange={handlePagination}
      />

      {/* 新增/修改任务 */}
      <Modal
        title={title}
        open={open}
        onCancel={() => setOpen(false)}
        onOk={submitForm}
        width={720}
        destroyOnHidden
      >
        <Form
          form={form}
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 18 }}
        >
          {/* 关键：编辑时需要带上 jobId，否则 submitForm 会误判为新增 */}
          <Form.Item name="jobId" hidden>
            <Input />
          </Form.Item>

          <Form.Item
            label="任务名称"
            name="jobName"
            rules={[{ required: true, message: '任务名称不能为空' }]}
          >
            <Input placeholder="请输入任务名称" />
          </Form.Item>
          <Form.Item
            label="任务分组"
            name="jobGroup"
            rules={[{ required: true, message: '任务分组不能为空' }]}
          >
            <Select placeholder="请选择任务分组">
              {sys_job_group?.map(dict => (
                <Select.Option key={dict.value} value={dict.value}>
                  {dict.label}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            label="调用方法"
            name="invokeTarget"
            rules={[{ required: true, message: '调用方法不能为空' }]}
          >
            <Input placeholder="例如：ryTask.ryParams('ry')" />
          </Form.Item>
          <Form.Item
            label="cron表达式"
            name="cronExpression"
            rules={[{ required: true, message: 'cron 表达式不能为空' }]}
          >
            <Input placeholder="例如：0/10 * * * * ?" />
          </Form.Item>
          <Form.Item
            label="执行策略"
            name="misfirePolicy"
            rules={[{ required: true, message: '请选择执行策略' }]}
          >
            <Radio.Group>
              {sys_misfire.sys_misfire?.map(dict => (
                <Radio key={dict.value} value={dict.value}>
                  {dict.label}
                </Radio>
              ))}
            </Radio.Group>
          </Form.Item>
          <Form.Item label="并发执行" name="concurrent">
            <Radio.Group>
              {sys_yes_no.sys_yes_no?.map(dict => (
                <Radio key={dict.value} value={dict.value}>
                  {dict.label}
                </Radio>
              ))}
            </Radio.Group>
          </Form.Item>
          <Form.Item label="状态" name="status">
            <Radio.Group>
              {sys_job_status?.map(dict => (
                <Radio key={dict.value} value={dict.value}>
                  {dict.label}
                </Radio>
              ))}
            </Radio.Group>
          </Form.Item>
          <Form.Item label="备注" name="remark">
            <TextArea rows={3} placeholder="请输入备注" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default Job
