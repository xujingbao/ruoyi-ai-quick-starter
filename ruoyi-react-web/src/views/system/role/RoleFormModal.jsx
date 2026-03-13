import { Form, Input, InputNumber, Select, Modal, Radio, Checkbox, Tree, Space, Tooltip } from 'antd'
import { QuestionCircleOutlined } from '@ant-design/icons'

const { TextArea } = Input

const RoleFormModal = ({
  open,
  title,
  onCancel,
  onOk,
  form,
  menuOptions,
  menuCheckedKeys,
  menuHalfCheckedKeys,
  menuExpandedKeys,
  menuExpand,
  menuNodeAll,
  menuCheckStrictlyValue,
  onMenuCheck,
  onMenuExpand,
  onCheckedTreeExpand,
  onCheckedTreeNodeAll,
  onCheckedTreeConnect,
  sysNormalDisable
}) => {
  return (
    <Modal
      title={title}
      open={open}
      onCancel={onCancel}
      onOk={onOk}
      width={500}
      destroyOnHidden
    >
      <Form
        form={form}
        labelCol={{ span: 6 }}
        wrapperCol={{ span: 18 }}
      >
        <Form.Item name="roleId" hidden>
          <Input />
        </Form.Item>

        <Form.Item
          label="角色名称"
          name="roleName"
          rules={[{ required: true, message: '角色名称不能为空' }]}
        >
          <Input placeholder="请输入角色名称" />
        </Form.Item>
        <Form.Item
          label={
            <span>
              <Tooltip title="控制器中定义的权限字符，如：@PreAuthorize(`@ss.hasRole('admin')`)">
                <QuestionCircleOutlined style={{ marginRight: 4 }} />
              </Tooltip>
              权限字符
            </span>
          }
          name="roleKey"
          rules={[{ required: true, message: '权限字符不能为空' }]}
        >
          <Input placeholder="请输入权限字符" />
        </Form.Item>
        <Form.Item
          label="角色顺序"
          name="roleSort"
          rules={[{ required: true, message: '角色顺序不能为空' }]}
        >
          <InputNumber min={0} style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item label="状态" name="status">
          <Radio.Group>
            {sysNormalDisable?.map(dict => (
              <Radio key={dict.value} value={dict.value}>
                {dict.label}
              </Radio>
            ))}
          </Radio.Group>
        </Form.Item>
        <Form.Item label="菜单权限">
          <Space style={{ marginBottom: 8 }}>
            <Checkbox
              checked={menuExpand}
              onChange={(e) => onCheckedTreeExpand(e.target.checked, 'menu')}
            >
              展开/折叠
            </Checkbox>
            <Checkbox
              checked={menuNodeAll}
              onChange={(e) => onCheckedTreeNodeAll(e.target.checked, 'menu')}
            >
              全选/全不选
            </Checkbox>
            <Checkbox
              checked={menuCheckStrictlyValue !== false}
              onChange={(e) => onCheckedTreeConnect(e.target.checked, 'menu')}
            >
              父子联动
            </Checkbox>
          </Space>
          <Tree
            checkable
            treeData={menuOptions}
            fieldNames={{ title: 'label', key: 'id', children: 'children' }}
            checkStrictly={!(menuCheckStrictlyValue !== false)}
            expandedKeys={menuExpandedKeys}
            onExpand={onMenuExpand}
            checkedKeys={
              !(menuCheckStrictlyValue !== false)
                ? { checked: menuCheckedKeys, halfChecked: menuHalfCheckedKeys }
                : menuCheckedKeys
            }
            onCheck={onMenuCheck}
            style={{ maxHeight: '300px', overflow: 'auto', border: '1px solid #d9d9d9', padding: '8px' }}
          />
        </Form.Item>
        <Form.Item label="备注" name="remark">
          <TextArea placeholder="请输入内容" rows={3} />
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default RoleFormModal
