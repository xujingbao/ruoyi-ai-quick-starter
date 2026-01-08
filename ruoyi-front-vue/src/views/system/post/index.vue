<template>
   <div class="app-container">
      <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" class="search-form">
         <el-form-item label="岗位编码" prop="postCode">
            <el-input
               v-model="queryParams.postCode"
               placeholder="请输入岗位编码"
               clearable
               style="width: 200px"
               @keyup.enter="handleQuery"
            />
         </el-form-item>
         <el-form-item label="岗位名称" prop="postName">
            <el-input
               v-model="queryParams.postName"
               placeholder="请输入岗位名称"
               clearable
               style="width: 200px"
               @keyup.enter="handleQuery"
            />
         </el-form-item>
         <el-form-item label="状态" prop="status">
            <el-select v-model="queryParams.status" placeholder="岗位状态" clearable style="width: 200px">
               <el-option
                  v-for="dict in sys_normal_disable"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.value"
               />
            </el-select>
         </el-form-item>
         <el-form-item>
            <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
            <el-button icon="Refresh" @click="resetQuery">重置</el-button>
         </el-form-item>
      </el-form>

      <el-row :gutter="10" class="mb8">
         <el-col :span="1.5">
            <el-button
               type="primary"
               plain
               icon="Plus"
               @click="handleAdd"
               v-hasPermi="['system:post:add']"
            >新增</el-button>
         </el-col>
         <el-col :span="1.5">
            <el-button
               type="success"
               plain
               icon="Edit"
               :disabled="single"
               @click="handleUpdate"
               v-hasPermi="['system:post:edit']"
            >修改</el-button>
         </el-col>
         <el-col :span="1.5">
            <el-button
               type="danger"
               plain
               icon="Delete"
               :disabled="multiple"
               @click="handleDelete"
               v-hasPermi="['system:post:remove']"
            >删除</el-button>
         </el-col>
         <el-col :span="1.5">
            <el-button
               type="warning"
               plain
               icon="Download"
               @click="handleExport"
               v-hasPermi="['system:post:export']"
            >导出</el-button>
         </el-col>
         <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
      </el-row>

      <el-table 
         v-loading="loading" 
         :data="postList" 
         @selection-change="handleSelectionChange"
         @row-dblclick="handleRowDblClick"
         @row-click="handleRowClick"
         stripe
         style="width: 100%"
         class="post-table"
      >
         <el-table-column type="selection" width="55" align="center" />
         <el-table-column label="岗位编号" align="center" prop="postId" />
         <el-table-column label="岗位编码" align="center" prop="postCode" />
         <el-table-column label="岗位名称" align="center" prop="postName" />
         <el-table-column label="岗位排序" align="center" prop="postSort" />
         <el-table-column label="状态" align="center" prop="status">
            <template #default="scope">
               <dict-tag :options="sys_normal_disable" :value="scope.row.status" />
            </template>
         </el-table-column>
         <el-table-column label="创建时间" align="center" prop="createTime" width="180">
            <template #default="scope">
               <span>{{ parseTime(scope.row.createTime) }}</span>
            </template>
         </el-table-column>
         <el-table-column label="操作" width="180" align="center" fixed="right">
            <template #default="scope">
               <div class="action-buttons">
                  <el-button 
                     link 
                     type="primary" 
                     icon="Edit" 
                     size="small"
                     @click.stop="handleUpdate(scope.row)" 
                     v-hasPermi="['system:post:edit']"
                  >修改</el-button>
                  <el-button 
                     link 
                     type="danger" 
                     icon="Delete" 
                     size="small"
                     @click.stop="handleDelete(scope.row)" 
                     v-hasPermi="['system:post:remove']"
                  >删除</el-button>
               </div>
            </template>
         </el-table-column>
      </el-table>

      <pagination
         v-show="total > 0"
         :total="total"
         v-model:page="queryParams.pageNum"
         v-model:limit="queryParams.pageSize"
         @pagination="getList"
      />

      <!-- 添加或修改岗位对话框 -->
      <el-dialog :title="title" v-model="open" width="500px" append-to-body :close-on-click-modal="false">
         <el-form ref="postRef" :model="form" :rules="rules" label-width="80px" class="post-form">
            <el-form-item label="岗位名称" prop="postName">
               <el-input 
                  v-model="form.postName" 
                  placeholder="请输入岗位名称" 
                  maxlength="50"
                  show-word-limit
                  clearable
               />
            </el-form-item>
            <el-form-item label="岗位编码" prop="postCode">
               <el-input 
                  v-model="form.postCode" 
                  placeholder="请输入岗位编码" 
                  maxlength="64"
                  show-word-limit
                  clearable
               />
               <div class="form-tip">岗位编码在系统中必须唯一</div>
            </el-form-item>
            <el-form-item label="岗位顺序" prop="postSort">
               <el-input-number v-model="form.postSort" controls-position="right" :min="0" />
            </el-form-item>
            <el-form-item label="岗位状态" prop="status">
               <el-radio-group v-model="form.status">
                  <el-radio
                     v-for="dict in sys_normal_disable"
                     :key="dict.value"
                     :value="dict.value"
                  >{{ dict.label }}</el-radio>
               </el-radio-group>
            </el-form-item>
            <el-form-item label="备注" prop="remark">
               <el-input v-model="form.remark" type="textarea" placeholder="请输入内容" />
            </el-form-item>
         </el-form>
         <template #footer>
            <div class="dialog-footer">
               <el-button @click="cancel">取 消</el-button>
               <el-button type="primary" @click="submitForm">确 定</el-button>
            </div>
         </template>
      </el-dialog>
   </div>
</template>

<script setup name="Post">
import { listPost, addPost, delPost, getPost, updatePost } from "@/api/system/post"

const { proxy } = getCurrentInstance()
const { sys_normal_disable } = proxy.useDict("sys_normal_disable")

const postList = ref([])
const open = ref(false)
const loading = ref(true)
const showSearch = ref(true)
const ids = ref([])
const single = ref(true)
const multiple = ref(true)
const total = ref(0)
const title = ref("")

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    postCode: undefined,
    postName: undefined,
    status: undefined
  },
  rules: {
    postName: [{ required: true, message: "岗位名称不能为空", trigger: "blur" }],
    postCode: [{ required: true, message: "岗位编码不能为空", trigger: "blur" }],
    postSort: [{ required: true, message: "岗位顺序不能为空", trigger: "blur" }],
  }
})

const { queryParams, form, rules } = toRefs(data)

/** 查询岗位列表 */
function getList() {
  loading.value = true
  listPost(queryParams.value).then(response => {
    postList.value = response.rows
    total.value = response.total
    loading.value = false
  })
}

/** 取消按钮 */
function cancel() {
  open.value = false
  reset()
}

/** 表单重置 */
function reset() {
  form.value = {
    postId: undefined,
    postCode: undefined,
    postName: undefined,
    postSort: 0,
    status: "0",
    remark: undefined
  }
  proxy.resetForm("postRef")
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1
  getList()
}

/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm("queryRef")
  handleQuery()
}

/** 多选框选中数据 */
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.postId)
  single.value = selection.length != 1
  multiple.value = !selection.length
}

/** 新增按钮操作 */
function handleAdd() {
  reset()
  open.value = true
  title.value = "添加岗位"
}

/** 单击行操作（用于选中） */
function handleRowClick(row, column, event) {
  if (event?.target?.closest('.action-buttons')) {
    return
  }
}

/** 双击行操作 */
function handleRowDblClick(row, column, event) {
  if (event?.target?.closest('.action-buttons')) {
    return
  }
  handleUpdate(row)
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset()
  if (!row || typeof row !== 'object') {
    return
  }
  
  const postId = row.postId || (Array.isArray(ids.value) && ids.value.length === 1 ? ids.value[0] : null)
  
  if (!postId) {
    proxy.$modal.msgWarning("请选择要修改的岗位")
    return
  }
  
  getPost(postId).then(response => {
    form.value = response.data
    open.value = true
    title.value = "修改岗位"
  }).catch(error => {
    console.error("获取岗位信息失败:", error)
    proxy.$modal.msgError("获取岗位信息失败")
  })
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["postRef"].validate(valid => {
    if (valid) {
      if (form.value.postId != undefined) {
        updatePost(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功")
          open.value = false
          getList()
        })
      } else {
        addPost(form.value).then(response => {
          proxy.$modal.msgSuccess("新增成功")
          open.value = false
          getList()
        })
      }
    }
  })
}

/** 删除按钮操作 */
function handleDelete(row) {
  const postIds = row.postId || ids.value
  proxy.$modal.confirm('是否确认删除岗位编号为"' + postIds + '"的数据项？').then(function() {
    return delPost(postIds)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess("删除成功")
  }).catch(() => {})
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download("system/post/export", {
    ...queryParams.value
  }, `post_${new Date().getTime()}.xlsx`)
}

getList()
</script>

<style scoped lang="scss">
.search-form {
  margin-bottom: 16px;
  
  .el-form-item {
    margin-bottom: 16px;
  }
}

.action-buttons {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  white-space: nowrap;
  
  .el-button {
    padding: 0 8px;
  }
}

.post-table {
  :deep(.el-table__row) {
    cursor: pointer;
    
    &:hover {
      background-color: var(--el-table-row-hover-bg-color);
    }
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.post-form {
  :deep(.el-form-item) {
    margin-bottom: 22px;
  }
  
  .form-tip {
    font-size: 12px;
    color: var(--el-text-color-secondary);
    margin-top: 4px;
    line-height: 1.4;
  }
}

:deep(.el-table) {
  .el-table__header {
    th {
      background-color: var(--el-table-header-bg-color);
      font-weight: 500;
    }
  }
}

:deep(.el-dialog__body) {
  padding: 24px 28px;
}

:deep(.el-dialog__header) {
  padding: 20px 28px 16px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

:deep(.el-dialog__footer) {
  padding: 16px 28px 20px;
  border-top: 1px solid var(--el-border-color-lighter);
}
</style>
