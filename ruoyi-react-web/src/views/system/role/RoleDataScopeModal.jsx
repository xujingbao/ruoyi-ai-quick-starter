import { Form, Input, Select, Modal, Checkbox, Tree, Space } from 'antd'

const RoleDataScopeModal = ({
  open,
  title,
  onCancel,
  onOk,
  form,
  dataScopeOptions,
  dataScopeValue,
  deptOptions,
  deptCheckedKeys,
  deptHalfCheckedKeys,
  deptExpandedKeys,
  deptExpand,
  deptNodeAll,
  deptCheckStrictlyValue,
  onDeptCheck,
  onDeptExpand,
  onCheckedTreeExpand,
  onCheckedTreeNodeAll,
  onCheckedTreeConnect,
  onDataScopeSelectChange
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
        <Form.Item label="角色名称" name="roleName">
          <Input disabled />
        </Form.Item>
        <Form.Item label="权限字符" name="roleKey">
          <Input disabled />
        </Form.Item>
        <Form.Item label="权限范围" name="dataScope">
          <Select onChange={onDataScopeSelectChange}>
            {dataScopeOptions.map(item => (
              <Select.Option key={item.value} value={item.value}>
                {item.label}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        {dataScopeValue === '2' && (
          <Form.Item label="数据权限">
            <Space style={{ marginBottom: 8 }}>
              <Checkbox
                checked={deptExpand}
                onChange={(e) => onCheckedTreeExpand(e.target.checked, 'dept')}
              >
                展开/折叠
              </Checkbox>
              <Checkbox
                checked={deptNodeAll}
                onChange={(e) => onCheckedTreeNodeAll(e.target.checked, 'dept')}
              >
                全选/全不选
              </Checkbox>
              <Checkbox
                checked={deptCheckStrictlyValue !== false}
                onChange={(e) => onCheckedTreeConnect(e.target.checked, 'dept')}
              >
                父子联动
              </Checkbox>
            </Space>
            <Tree
              checkable
              treeData={deptOptions}
              fieldNames={{ title: 'label', key: 'id', children: 'children' }}
              checkStrictly={!(deptCheckStrictlyValue !== false)}
              expandedKeys={deptExpandedKeys}
              onExpand={onDeptExpand}
              checkedKeys={
                !(deptCheckStrictlyValue !== false)
                  ? { checked: deptCheckedKeys, halfChecked: deptHalfCheckedKeys }
                  : deptCheckedKeys
              }
              onCheck={onDeptCheck}
              style={{ maxHeight: '300px', overflow: 'auto', border: '1px solid #d9d9d9', padding: '8px' }}
            />
          </Form.Item>
        )}
      </Form>
    </Modal>
  )
}

export default RoleDataScopeModal
