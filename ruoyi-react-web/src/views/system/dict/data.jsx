import { useState, useEffect } from 'react'
import { Form, Input, InputNumber, Select, Button, Table, Modal, Radio, Space, Tag } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, DownloadOutlined, CloseOutlined, SearchOutlined, ReloadOutlined } from '@ant-design/icons'
import { useParams, useNavigate } from 'react-router-dom'
import { listData, getData, addData, updateData, delData } from '@/api/system/dict/data'
import { getType, optionselect } from '@/api/system/dict/type'
import { useDict } from '@/utils/dict'
import { parseTime } from '@/utils/ruoyi'
import { download } from '@/utils/request'
import { useDictStore } from '@/store/dictStore'
import { useTagsViewStore } from '@/store/tagsViewStore'
import modal from '@/plugins/modal'
import auth from '@/plugins/auth'
import Pagination from '@/components/Pagination'
import RightToolbar from '@/components/RightToolbar'
import './index.scss'

const { TextArea } = Input

const DictData = () => {
  const { dictId } = useParams()
  const navigate = useNavigate()
  const tagsViewStore = useTagsViewStore()
  const dictStore = useDictStore()
  const [form] = Form.useForm()
  const [queryForm] = Form.useForm()

  const [dataList, setDataList] = useState([])
  const [loading, setLoading] = useState(true)
  const [showSearch, setShowSearch] = useState(true)
  const [selectedRowKeys, setSelectedRowKeys] = useState([])
  const [total, setTotal] = useState(0)
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [defaultDictType, setDefaultDictType] = useState('')
  const [typeOptions, setTypeOptions] = useState([])

  const sys_normal_disable = useDict('sys_normal_disable')

  const listClassOptions = [
    { value: 'default', label: '默认' },
    { value: 'primary', label: '主要' },
    { value: 'success', label: '成功' },
    { value: 'info', label: '信息' },
    { value: 'warning', label: '警告' },
    { value: 'danger', label: '危险' }
  ]

  const [queryParams, setQueryParams] = useState({
    pageNum: 1,
    pageSize: 10,
    dictType: undefined,
    dictLabel: undefined,
    status: undefined
  })

  useEffect(() => {
    if (dictId) {
      getTypes(dictId)
    }
    getTypeList()
  }, [dictId])

  useEffect(() => {
    getList()
  }, [queryParams])

  // 查询字典类型详细
  const getTypes = async (dictId) => {
    try {
      const response = await getType(dictId)
      setQueryParams(prev => ({
        ...prev,
        dictType: response.data.dictType
      }))
      setDefaultDictType(response.data.dictType)
      getList()
    } catch (error) {
      console.error('Failed to get dict type:', error)
    }
  }

  // 查询字典类型列表
  const getTypeList = async () => {
    try {
      const response = await optionselect()
      setTypeOptions(response.data || [])
    } catch (error) {
      console.error('Failed to get type list:', error)
    }
  }

  // 查询字典数据列表
  const getList = async () => {
    setLoading(true)
    try {
      const response = await listData(queryParams)
      setDataList(response.rows || [])
      setTotal(response.total || 0)
    } catch (error) {
      console.error('Failed to get dict data list:', error)
    } finally {
      setLoading(false)
    }
  }

  // 搜索
  const handleQuery = () => {
    const values = queryForm.getFieldsValue()
    setQueryParams(prev => ({
      ...prev,
      ...values,
      pageNum: 1
    }))
  }

  // 重置
  const resetQuery = () => {
    queryForm.resetFields()
    setQueryParams(prev => ({
      ...prev,
      dictType: defaultDictType,
      dictLabel: undefined,
      status: undefined,
      pageNum: 1
    }))
    getList()
  }

  // 分页变化
  const handlePagination = ({ page, limit }) => {
    setQueryParams(prev => ({
      ...prev,
      pageNum: page,
      pageSize: limit
    }))
  }

  // 表格选择变化
  const handleSelectionChange = (selectedRowKeys) => {
    setSelectedRowKeys(selectedRowKeys)
  }

  // 新增
  const handleAdd = () => {
    reset()
    form.setFieldValue('dictType', queryParams.dictType)
    setOpen(true)
    setTitle('添加字典数据')
  }

  // 修改
  const handleUpdate = async (row) => {
    reset()
    const dictCode = row?.dictCode || (selectedRowKeys.length === 1 ? selectedRowKeys[0] : null)
    
    if (!dictCode) {
      modal.msgWarning('请选择要修改的字典数据')
      return
    }

    try {
      const response = await getData(dictCode)
      form.setFieldsValue(response.data)
      setOpen(true)
      setTitle('修改字典数据')
    } catch (error) {
      console.error('Failed to get dict data:', error)
      modal.msgError('获取字典数据失败')
    }
  }

  // 删除
  const handleDelete = (row) => {
    const dictCodes = row?.dictCode || selectedRowKeys
    Modal.confirm({
      title: '提示',
      content: `是否确认删除字典编码为"${dictCodes}"的数据项？`,
      onOk: async () => {
        try {
          await delData(dictCodes)
          dictStore.removeDict(queryParams.dictType)
          modal.msgSuccess('删除成功')
          getList()
        } catch (error) {
          console.error('Failed to delete dict data:', error)
        }
      }
    })
  }

  // 导出
  const handleExport = () => {
    download('system/dict/data/export', queryParams, `dict_data_${new Date().getTime()}.xlsx`)
  }

  // 关闭
  const handleClose = () => {
    const view = tagsViewStore.visitedViews.find(v => v.path === '/system/dict')
    if (view) {
      navigate('/system/dict')
    } else {
      navigate(-1)
    }
  }

  // 表单重置
  const reset = () => {
    form.resetFields()
    form.setFieldsValue({
      dictCode: undefined,
      dictLabel: undefined,
      dictValue: undefined,
      cssClass: undefined,
      listClass: 'default',
      dictSort: 0,
      status: '0',
      remark: undefined
    })
  }

  // 取消
  const cancel = () => {
    setOpen(false)
    reset()
  }

  // 提交表单
  const submitForm = async () => {
    try {
      const values = await form.validateFields()
      if (values.dictCode !== undefined && values.dictCode !== null && values.dictCode !== '') {
        await updateData(values)
        dictStore.removeDict(queryParams.dictType)
        modal.msgSuccess('修改成功')
      } else {
        await addData(values)
        dictStore.removeDict(queryParams.dictType)
        modal.msgSuccess('新增成功')
      }
      setOpen(false)
      getList()
    } catch (error) {
      console.error('Validation failed:', error)
    }
  }

  // 表格列定义
  const columns = [
    {
      title: '字典编码',
      dataIndex: 'dictCode',
      key: 'dictCode',
      align: 'center'
    },
    {
      title: '字典标签',
      dataIndex: 'dictLabel',
      key: 'dictLabel',
      align: 'center',
      render: (text, record) => {
        if ((!record.listClass || record.listClass === 'default') && (!record.cssClass || record.cssClass === null)) {
          return text
        }
        return (
          <Tag
            color={record.listClass === 'primary' ? 'blue' : record.listClass === 'success' ? 'green' : record.listClass === 'info' ? 'cyan' : record.listClass === 'warning' ? 'orange' : record.listClass === 'danger' ? 'red' : 'default'}
            className={record.cssClass}
          >
            {text}
          </Tag>
        )
      }
    },
    {
      title: '字典键值',
      dataIndex: 'dictValue',
      key: 'dictValue',
      align: 'center'
    },
    {
      title: '字典排序',
      dataIndex: 'dictSort',
      key: 'dictSort',
      align: 'center'
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      align: 'center',
      render: (status) => {
        const dict = sys_normal_disable.sys_normal_disable?.find(d => d.value === status)
        return dict ? dict.label : '-'
      }
    },
    {
      title: '备注',
      dataIndex: 'remark',
      key: 'remark',
      align: 'center',
      ellipsis: true
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      align: 'center',
      width: 180,
      render: (text) => parseTime(text)
    },
    {
      title: '操作',
      key: 'action',
      align: 'center',
      width: 160,
      render: (_, record) => (
        <Space size="small">
          {auth.hasPermiOr(['system:dict:edit']) && (
            <Button
              type="link"
              icon={<EditOutlined />}
              size="small"
              onClick={() => handleUpdate(record)}
            >
              修改
            </Button>
          )}
          {auth.hasPermiOr(['system:dict:remove']) && (
            <Button
              type="link"
              danger
              icon={<DeleteOutlined />}
              size="small"
              onClick={() => handleDelete(record)}
            >
              删除
            </Button>
          )}
        </Space>
      )
    }
  ]

  const rowSelection = {
    selectedRowKeys,
    onChange: handleSelectionChange
  }

  return (
    <div className="app-container">
      <Form
        form={queryForm}
        layout="inline"
        className="search-form"
        style={{ display: showSearch ? 'flex' : 'none', marginBottom: 16 }}
      >
        <Form.Item label="字典名称" name="dictType">
          <Select
            style={{ width: 200 }}
            value={queryParams.dictType}
            onChange={(value) => {
              setQueryParams(prev => ({
                ...prev,
                dictType: value,
                pageNum: 1
              }))
            }}
          >
            {typeOptions.map(item => (
              <Select.Option key={item.dictId} value={item.dictType}>
                {item.dictName}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item label="字典标签" name="dictLabel">
          <Input
            placeholder="请输入字典标签"
            style={{ width: 200 }}
            onPressEnter={handleQuery}
            allowClear
          />
        </Form.Item>
        <Form.Item label="状态" name="status">
          <Select
            placeholder="数据状态"
            style={{ width: 200 }}
            allowClear
          >
            {sys_normal_disable.sys_normal_disable?.map(dict => (
              <Select.Option key={dict.value} value={dict.value}>
                {dict.label}
              </Select.Option>
            ))}
          </Select>
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
          {auth.hasPermiOr(['system:dict:add']) && (
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              新增
            </Button>
          )}
          {auth.hasPermiOr(['system:dict:edit']) && (
            <Button
              type="default"
              icon={<EditOutlined />}
              disabled={selectedRowKeys.length !== 1}
              onClick={() => handleUpdate({ dictCode: selectedRowKeys[0] })}
            >
              修改
            </Button>
          )}
          {auth.hasPermiOr(['system:dict:remove']) && (
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
          {auth.hasPermiOr(['system:dict:export']) && (
            <Button type="default" icon={<DownloadOutlined />} onClick={handleExport}>
              导出
            </Button>
          )}
          <Button type="default" icon={<CloseOutlined />} onClick={handleClose}>
            关闭
          </Button>
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
        dataSource={dataList}
        columns={columns}
        rowSelection={rowSelection}
        rowKey="dictCode"
        pagination={false}
      />

      <Pagination
        total={total}
        page={queryParams.pageNum}
        limit={queryParams.pageSize}
        onChange={handlePagination}
      />

      {/* 添加或修改字典数据对话框 */}
      <Modal
        title={title}
        open={open}
        onCancel={cancel}
        onOk={submitForm}
        width={500}
        destroyOnHidden
      >
        <Form
          form={form}
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 18 }}
        >
          {/* 关键：编辑时需要带上 dictCode，否则 submitForm 会误判为新增 */}
          <Form.Item name="dictCode" hidden>
            <Input />
          </Form.Item>

          <Form.Item label="字典类型" name="dictType">
            <Input disabled />
          </Form.Item>
          <Form.Item
            label="数据标签"
            name="dictLabel"
            rules={[{ required: true, message: '数据标签不能为空' }]}
          >
            <Input placeholder="请输入数据标签" />
          </Form.Item>
          <Form.Item
            label="数据键值"
            name="dictValue"
            rules={[{ required: true, message: '数据键值不能为空' }]}
          >
            <Input placeholder="请输入数据键值" />
          </Form.Item>
          <Form.Item label="样式属性" name="cssClass">
            <Input placeholder="请输入样式属性" />
          </Form.Item>
          <Form.Item
            label="显示排序"
            name="dictSort"
            rules={[{ required: true, message: '数据顺序不能为空' }]}
          >
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="回显样式" name="listClass">
            <Select>
              {listClassOptions.map(item => (
                <Select.Option key={item.value} value={item.value}>
                  {item.label}({item.value})
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item label="状态" name="status">
            <Radio.Group>
              {sys_normal_disable.sys_normal_disable?.map(dict => (
                <Radio key={dict.value} value={dict.value}>
                  {dict.label}
                </Radio>
              ))}
            </Radio.Group>
          </Form.Item>
          <Form.Item label="备注" name="remark">
            <TextArea placeholder="请输入内容" rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default DictData
