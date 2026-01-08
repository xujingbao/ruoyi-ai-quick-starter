<template>
   <div class="app-container profile-container">
      <el-row :gutter="20">
         <el-col :span="6" :xs="24" :sm="24" :md="6">
            <el-card class="profile-card info-card" shadow="hover">
               <template v-slot:header>
                 <div class="card-header">
                   <span class="card-title">个人信息</span>
                 </div>
               </template>
               <div class="profile-content">
                  <div class="avatar-container">
                     <userAvatar />
                  </div>
                  <ul class="info-list">
                     <li class="info-item">
                        <div class="info-label">
                           <el-icon class="info-icon"><User /></el-icon>
                           <span>用户名称</span>
                        </div>
                        <div class="info-value">{{ state.user.userName || '-' }}</div>
                     </li>
                     <li class="info-item">
                        <div class="info-label">
                           <el-icon class="info-icon"><Phone /></el-icon>
                           <span>手机号码</span>
                        </div>
                        <div class="info-value">{{ state.user.phonenumber || '-' }}</div>
                     </li>
                     <li class="info-item">
                        <div class="info-label">
                           <el-icon class="info-icon"><Message /></el-icon>
                           <span>用户邮箱</span>
                        </div>
                        <div class="info-value">{{ state.user.email || '-' }}</div>
                     </li>
                     <li class="info-item">
                        <div class="info-label">
                           <el-icon class="info-icon"><Connection /></el-icon>
                           <span>所属部门</span>
                        </div>
                        <div class="info-value" v-if="state.user.dept">{{ state.user.dept.deptName }} / {{ state.postGroup }}</div>
                        <div class="info-value" v-else>-</div>
                     </li>
                     <li class="info-item">
                        <div class="info-label">
                           <el-icon class="info-icon"><UserFilled /></el-icon>
                           <span>所属角色</span>
                        </div>
                        <div class="info-value">{{ state.roleGroup || '-' }}</div>
                     </li>
                     <li class="info-item">
                        <div class="info-label">
                           <el-icon class="info-icon"><Calendar /></el-icon>
                           <span>创建日期</span>
                        </div>
                        <div class="info-value">{{ state.user.createTime || '-' }}</div>
                     </li>
                  </ul>
               </div>
            </el-card>
         </el-col>
         <el-col :span="18" :xs="24" :sm="24" :md="18">
            <el-card class="profile-card form-card" shadow="hover">
               <template v-slot:header>
                 <div class="card-header">
                   <span class="card-title">基本资料</span>
                 </div>
               </template>
               <el-tabs v-model="selectedTab" class="profile-tabs">
                  <el-tab-pane label="基本资料" name="userinfo">
                     <userInfo :user="state.user" />
                  </el-tab-pane>
                  <el-tab-pane label="修改密码" name="resetPwd">
                     <resetPwd />
                  </el-tab-pane>
               </el-tabs>
            </el-card>
         </el-col>
      </el-row>
   </div>
</template>

<script setup name="Profile">
import userAvatar from "./userAvatar"
import userInfo from "./userInfo"
import resetPwd from "./resetPwd"
import { getUserProfile } from "@/api/system/user"
import { User, Phone, Message, Connection, UserFilled, Calendar } from '@element-plus/icons-vue'

const route = useRoute()
const selectedTab = ref("userinfo")
const state = reactive({
  user: {},
  roleGroup: {},
  postGroup: {}
})

function getUser() {
  getUserProfile().then(response => {
    state.user = response.data
    state.roleGroup = response.roleGroup
    state.postGroup = response.postGroup
  })
}

onMounted(() => {
  const activeTab = route.params && route.params.activeTab
  if (activeTab) {
    selectedTab.value = activeTab
  }
  getUser()
})
</script>

<style scoped lang="scss">
.profile-container {
  padding: 20px;
}

.profile-card {
  border-radius: 8px;
  transition: all 0.3s;
  
  :deep(.el-card__header) {
    padding: 16px 20px;
    border-bottom: 1px solid var(--el-border-color-lighter);
  }
  
  :deep(.el-card__body) {
    padding: 20px;
  }
  
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    .card-title {
      font-size: 16px;
      font-weight: 600;
      color: var(--el-text-color-primary);
    }
  }
}

.info-card {
  .profile-content {
    .avatar-container {
      display: flex;
      justify-content: center;
      margin-bottom: 24px;
      padding-bottom: 24px;
      border-bottom: 1px solid var(--el-border-color-lighter);
    }
    
    .info-list {
      list-style: none;
      padding: 0;
      margin: 0;
      
      .info-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 14px 0;
        border-bottom: 1px solid var(--el-border-color-extra-light);
        transition: all 0.2s;
        
        &:last-child {
          border-bottom: none;
        }
        
        &:hover {
          background-color: var(--el-fill-color-extra-light);
          margin: 0 -12px;
          padding: 14px 12px;
          border-radius: 4px;
        }
        
        .info-label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          color: var(--el-text-color-regular);
          font-weight: 500;
          flex: 1;
          min-width: 0;
          
          .info-icon {
            font-size: 16px;
            color: var(--el-text-color-secondary);
            flex-shrink: 0;
          }
        }
        
        .info-value {
          font-size: 14px;
          color: var(--el-text-color-primary);
          text-align: right;
          flex-shrink: 0;
          margin-left: 12px;
          word-break: break-all;
        }
      }
    }
  }
}

.form-card {
  .profile-tabs {
    :deep(.el-tabs__header) {
      margin-bottom: 24px;
    }
    
    :deep(.el-tabs__item) {
      font-size: 15px;
      font-weight: 500;
      padding: 0 20px;
      height: 48px;
      line-height: 48px;
    }
    
    :deep(.el-tabs__content) {
      padding: 0;
    }
  }
}

// 响应式优化
@media (max-width: 768px) {
  .profile-container {
    padding: 12px;
  }
  
  .info-card {
    margin-bottom: 16px;
  }
  
  .profile-card {
    :deep(.el-card__body) {
      padding: 16px;
    }
  }
}
</style>
