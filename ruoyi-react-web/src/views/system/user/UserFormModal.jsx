import { Row, Col, Form, Input, Select, Modal, Radio, TreeSelect } from 'antd'

const { TextArea } = Input

const UserFormModal = ({
  open,
  title,
  isEdit,
  onCancel,
  onOk,
  form,
  enabledDeptOptions,
  postOptions,
  roleOptions,
  sysNormalDisable,
  sysUserSex
}) => {
  return (
    <Modal
      title={title}
      open={open}
      onCancel={onCancel}
      onOk={onOk}
      width={600}
      destroyOnHidden
    >
      <Form
        form={form}
        labelCol={{ span: 6 }}
        wrapperCol={{ span: 18 }}
      >
        <Form.Item name="userId" hidden>
          <Input />
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="用户昵称"
              name="nickName"
              rules={[{ required: true, message: '用户昵称不能为空' }]}
            >
              <Input placeholder="请输入用户昵称" maxLength={30} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="归属部门"
              name="deptId"
            >
              <TreeSelect
                treeData={enabledDeptOptions}
                fieldNames={{ label: 'label', value: 'id', children: 'children' }}
                placeholder="请选择归属部门"
                allowClear
                treeDefaultExpandAll
              />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="手机号码"
              name="phonenumber"
              rules={[
                { pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/, message: '请输入正确的手机号码' }
              ]}
            >
              <Input placeholder="请输入手机号码" maxLength={11} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="邮箱"
              name="email"
              rules={[{ type: 'email', message: '请输入正确的邮箱地址' }]}
            >
              <Input placeholder="请输入邮箱" maxLength={50} />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="用户名称"
              name="userName"
              rules={[
                { required: true, message: '用户名称不能为空' },
                { min: 2, max: 20, message: '用户名称长度必须介于 2 和 20 之间' }
              ]}
            >
              <Input placeholder="请输入用户名称" maxLength={30} disabled={isEdit} />
            </Form.Item>
          </Col>
          {!isEdit && (
            <Col span={12}>
              <Form.Item
                label="用户密码"
                name="password"
                rules={[
                  { required: true, message: '用户密码不能为空' },
                  { min: 5, max: 20, message: '用户密码长度必须介于 5 和 20 之间' },
                  { pattern: /^[^<>"'|\\]+$/, message: '不能包含非法字符：< > " \' \\ |' }
                ]}
              >
                <Input.Password placeholder="请输入用户密码" maxLength={20} />
              </Form.Item>
            </Col>
          )}
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="用户性别" name="sex">
              <Select placeholder="请选择">
                {sysUserSex?.map(dict => (
                  <Select.Option key={dict.value} value={dict.value}>
                    {dict.label}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="状态" name="status">
              <Radio.Group>
                {sysNormalDisable?.map(dict => (
                  <Radio key={dict.value} value={dict.value}>
                    {dict.label}
                  </Radio>
                ))}
              </Radio.Group>
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="岗位" name="postIds">
              <Select mode="multiple" placeholder="请选择">
                {postOptions.map(item => (
                  <Select.Option key={item.postId} value={item.postId} disabled={item.status == 1}>
                    {item.postName}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="角色" name="roleIds">
              <Select mode="multiple" placeholder="请选择">
                {roleOptions.map(item => (
                  <Select.Option key={item.roleId} value={item.roleId} disabled={item.status == 1}>
                    {item.roleName}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col span={24}>
            <Form.Item label="备注" name="remark">
              <TextArea placeholder="请输入内容" rows={3} />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  )
}

export default UserFormModal
