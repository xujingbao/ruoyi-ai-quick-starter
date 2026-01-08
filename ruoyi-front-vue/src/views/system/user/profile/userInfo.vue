<template>
   <el-form ref="userRef" :model="form" :rules="rules" label-width="100px" class="user-info-form">
      <el-row :gutter="20">
         <el-col :span="12" :xs="24">
            <el-form-item label="用户昵称" prop="nickName">
               <el-input 
                  v-model="form.nickName" 
                  maxlength="30" 
                  show-word-limit
                  clearable
                  placeholder="请输入用户昵称"
               />
            </el-form-item>
         </el-col>
         <el-col :span="12" :xs="24">
            <el-form-item label="手机号码" prop="phonenumber">
               <el-input 
                  v-model="form.phonenumber" 
                  maxlength="11" 
                  clearable
                  placeholder="请输入手机号码"
               />
            </el-form-item>
         </el-col>
      </el-row>
      <el-row :gutter="20">
         <el-col :span="12" :xs="24">
            <el-form-item label="邮箱" prop="email">
               <el-input 
                  v-model="form.email" 
                  maxlength="50" 
                  show-word-limit
                  clearable
                  placeholder="请输入邮箱地址"
               />
            </el-form-item>
         </el-col>
         <el-col :span="12" :xs="24">
            <el-form-item label="性别">
               <el-radio-group v-model="form.sex">
                  <el-radio value="0">男</el-radio>
                  <el-radio value="1">女</el-radio>
               </el-radio-group>
            </el-form-item>
         </el-col>
      </el-row>
      <el-form-item>
         <div class="form-actions">
            <el-button @click="close">取 消</el-button>
            <el-button type="primary" @click="submit">保 存</el-button>
         </div>
      </el-form-item>
   </el-form>
</template>

<script setup>
import { updateUserProfile } from "@/api/system/user"

const props = defineProps({
  user: {
    type: Object
  }
})

const { proxy } = getCurrentInstance()

const form = ref({})
const rules = ref({
  nickName: [{ required: true, message: "用户昵称不能为空", trigger: "blur" }],
  email: [{ required: true, message: "邮箱地址不能为空", trigger: "blur" }, { type: "email", message: "请输入正确的邮箱地址", trigger: ["blur", "change"] }],
  phonenumber: [{ required: true, message: "手机号码不能为空", trigger: "blur" }, { pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/, message: "请输入正确的手机号码", trigger: "blur" }],
})

/** 提交按钮 */
function submit() {
  proxy.$refs.userRef.validate(valid => {
    if (valid) {
      updateUserProfile(form.value).then(response => {
        proxy.$modal.msgSuccess("修改成功")
        props.user.phonenumber = form.value.phonenumber
        props.user.email = form.value.email
      })
    }
  })
}

/** 关闭按钮 */
function close() {
  proxy.$tab.closePage()
}

// 回显当前登录用户信息
watch(() => props.user, user => {
  if (user) {
    form.value = { nickName: user.nickName, phonenumber: user.phonenumber, email: user.email, sex: user.sex }
  }
},{ immediate: true })
</script>

<style scoped lang="scss">
.user-info-form {
  :deep(.el-form-item) {
    margin-bottom: 22px;
  }
  
  .form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    padding-top: 8px;
  }
}
</style>
