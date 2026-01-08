<template>
   <div class="app-container">
      <!-- 搜索表单 -->
      <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="70px" class="search-form">
         <el-form-item label="参数名称" prop="configName">
            <el-input
               v-model="queryParams.configName"
               placeholder="请输入参数名称"
               clearable
               style="width: 200px"
               @keyup.enter="handleQuery"
            />
         </el-form-item>
         <el-form-item label="参数键名" prop="configKey">
            <el-input
               v-model="queryParams.configKey"
               placeholder="请输入参数键名"
               clearable
               style="width: 200px"
               @keyup.enter="handleQuery"
            />
         </el-form-item>
         <el-form-item label="系统内置" prop="configType">
            <el-select v-model="queryParams.configType" placeholder="请选择" clearable style="width: 120px">
               <el-option
                  v-for="dict in sys_yes_no"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.value"
               />
            </el-select>
         </el-form-item>
         <el-form-item label="创建时间">
            <el-date-picker
               v-model="dateRange"
               value-format="YYYY-MM-DD"
               type="daterange"
               range-separator="至"
               start-placeholder="开始日期"
               end-placeholder="结束日期"
               style="width: 240px"
            />
         </el-form-item>
         <el-form-item>
            <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
            <el-button icon="Refresh" @click="resetQuery">重置</el-button>
         </el-form-item>
      </el-form>

      <!-- 操作工具栏 -->
      <el-row :gutter="10" class="mb8">
         <el-col :span="1.5">
            <el-button
               type="primary"
               plain
               icon="Plus"
               @click="handleAdd"
               v-hasPermi="['system:config:add']"
            >新增</el-button>
         </el-col>
         <el-col :span="1.5">
            <el-button
               type="success"
               plain
               icon="Edit"
               :disabled="single"
               @click="handleUpdate"
               v-hasPermi="['system:config:edit']"
            >修改</el-button>
         </el-col>
         <el-col :span="1.5">
            <el-button
               type="danger"
               plain
               icon="Delete"
               :disabled="multiple"
               @click="handleDelete"
               v-hasPermi="['system:config:remove']"
            >删除</el-button>
         </el-col>
         <el-col :span="1.5">
            <el-button
               type="warning"
               plain
               icon="Download"
               @click="handleExport"
               v-hasPermi="['system:config:export']"
            >导出</el-button>
         </el-col>
         <el-col :span="1.5">
            <el-button
               type="info"
               plain
               icon="RefreshRight"
               @click="handleRefreshCache"
               v-hasPermi="['system:config:remove']"
            >刷新缓存</el-button>
         </el-col>
         <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
      </el-row>

      <!-- 数据表格 -->
      <el-table 
         ref="configTableRef"
         v-loading="loading" 
         :data="configList" 
         @selection-change="handleSelectionChange"
         @row-dblclick="handleRowDblClick"
         @row-click="handleRowClick"
         :default-sort="defaultSort"
         @sort-change="handleSortChange"
         stripe
         style="width: 100%"
         class="config-table"
      >
         <el-table-column type="selection" width="55" align="center" />
         <el-table-column label="参数名称" align="left" prop="configName" min-width="150" :show-overflow-tooltip="true" />
         <el-table-column label="参数键名" align="left" prop="configKey" min-width="180" :show-overflow-tooltip="true" />
         <el-table-column label="参数键值" align="left" prop="configValue" min-width="200" :show-overflow-tooltip="true">
            <template #default="scope">
               <span class="config-value">{{ scope.row.configValue || '-' }}</span>
            </template>
         </el-table-column>
         <el-table-column label="系统内置" align="center" prop="configType" width="100">
            <template #default="scope">
               <dict-tag :options="sys_yes_no" :value="scope.row.configType" />
            </template>
         </el-table-column>
         <el-table-column label="备注" align="left" prop="remark" min-width="150" :show-overflow-tooltip="true">
            <template #default="scope">
               <span>{{ scope.row.remark || '-' }}</span>
            </template>
         </el-table-column>
         <el-table-column label="创建时间" align="center" prop="createTime" width="180" sortable="custom" :sort-orders="['descending', 'ascending']">
            <template #default="scope">
               <span>{{ parseTime(scope.row.createTime) }}</span>
            </template>
         </el-table-column>
         <el-table-column label="更新时间" align="center" prop="updateTime" width="180" sortable="custom" :sort-orders="['descending', 'ascending']">
            <template #default="scope">
               <span>{{ parseTime(scope.row.updateTime) || '-' }}</span>
            </template>
         </el-table-column>
         <el-table-column label="操作" align="center" width="140" fixed="right">
            <template #default="scope">
               <div class="action-buttons">
                  <el-button 
                     link 
                     type="primary" 
                     icon="Edit" 
                     size="small"
                     @click.stop="handleUpdate(scope.row)" 
                     v-hasPermi="['system:config:edit']"
                  >修改</el-button>
                  <el-button 
                     link 
                     type="danger" 
                     icon="Delete" 
                     size="small"
                     @click.stop="handleDelete(scope.row)" 
                     v-hasPermi="['system:config:remove']"
                  >删除</el-button>
               </div>
            </template>
         </el-table-column>
      </el-table>

      <!-- 分页组件 -->
      <pagination
         v-show="total > 0"
         :total="total"
         v-model:page="queryParams.pageNum"
         v-model:limit="queryParams.pageSize"
         @pagination="getList"
      />

      <!-- 添加或修改参数配置对话框 -->
      <el-dialog :title="title" v-model="open" width="680px" append-to-body :close-on-click-modal="false">
         <el-form ref="configRef" :model="form" :rules="rules" label-width="100px" class="config-form">
            <el-row :gutter="20">
               <el-col :span="24">
                  <el-form-item label="参数名称" prop="configName">
                     <el-input 
                        v-model="form.configName" 
                        placeholder="请输入参数名称，用于显示" 
                        maxlength="100" 
                        show-word-limit
                        clearable
                     />
                  </el-form-item>
               </el-col>
               <el-col :span="24">
                  <el-form-item label="参数键名" prop="configKey">
                     <el-input 
                        v-model="form.configKey" 
                        placeholder="请输入参数键名，用于代码调用" 
                        maxlength="100" 
                        show-word-limit
                        clearable
                     />
                     <div class="form-tip">参数键名在系统中必须唯一</div>
                  </el-form-item>
               </el-col>
               <el-col :span="24">
                  <el-form-item label="参数键值" prop="configValue">
                     <el-input 
                        v-model="form.configValue" 
                        type="textarea" 
                        :rows="5"
                        placeholder="请输入参数键值" 
                        maxlength="500"
                        show-word-limit
                        resize="vertical"
                     />
                  </el-form-item>
               </el-col>
               <el-col :span="24">
                  <el-form-item label="系统内置" prop="configType">
                     <el-radio-group v-model="form.configType">
                        <el-radio
                           v-for="dict in sys_yes_no"
                           :key="dict.value"
                           :value="dict.value"
                        >{{ dict.label }}</el-radio>
                     </el-radio-group>
                     <div class="form-tip">系统内置参数不允许删除</div>
                  </el-form-item>
               </el-col>
               <el-col :span="24">
                  <el-form-item label="备注" prop="remark">
                     <el-input 
                        v-model="form.remark" 
                        type="textarea" 
                        :rows="3"
                        placeholder="请输入备注信息，用于说明参数的用途" 
                        maxlength="500"
                        show-word-limit
                        resize="vertical"
                     />
                  </el-form-item>
               </el-col>
            </el-row>
         </el-form>
         <template #footer>
            <div class="dialog-footer">
               <el-button @click="cancel">取 消</el-button>
               <el-button type="primary" @click="submitForm" :loading="submitting">确 定</el-button>
            </div>
         </template>
      </el-dialog>
   </div>
</template>

<script setup name="Config">
import { listConfig, getConfig, delConfig, addConfig, updateConfig, refreshCache } from "@/api/system/config"

const { proxy } = getCurrentInstance()
const { sys_yes_no } = proxy.useDict("sys_yes_no")

const configList = ref([])
const open = ref(false)
const loading = ref(true)
const showSearch = ref(true)
const ids = ref([])
const single = ref(true)
const multiple = ref(true)
const total = ref(0)
const title = ref("")
const dateRange = ref([])
const submitting = ref(false)
const defaultSort = ref({ prop: "createTime", order: "descending" })

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    configName: undefined,
    configKey: undefined,
    configType: undefined,
    orderByColumn: "createTime",
    isAsc: "desc"
  },
  rules: {
    configName: [{ required: true, message: "参数名称不能为空", trigger: "blur" }],
    configKey: [{ required: true, message: "参数键名不能为空", trigger: "blur" }],
    configValue: [{ required: true, message: "参数键值不能为空", trigger: "blur" }]
  }
})

const { queryParams, form, rules } = toRefs(data)

/** 查询参数列表 */
function getList() {
  loading.value = true
  listConfig(proxy.addDateRange(queryParams.value, dateRange.value)).then(response => {
    configList.value = response.rows
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
    configId: undefined,
    configName: undefined,
    configKey: undefined,
    configValue: undefined,
    configType: "Y",
    remark: undefined
  }
  proxy.resetForm("configRef")
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1
  getList()
}

/** 重置按钮操作 */
function resetQuery() {
  dateRange.value = []
  proxy.resetForm("queryRef")
  queryParams.value.orderByColumn = "createTime"
  queryParams.value.isAsc = "desc"
  proxy.$refs["configTableRef"].sort(defaultSort.value.prop, defaultSort.value.order)
  handleQuery()
}

/** 排序触发事件 */
function handleSortChange(column, prop, order) {
  queryParams.value.orderByColumn = column.prop
  queryParams.value.isAsc = column.order === "ascending" ? "asc" : "desc"
  getList()
}

/** 多选框选中数据 */
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.configId)
  single.value = selection.length != 1
  multiple.value = !selection.length
}

/** 新增按钮操作 */
function handleAdd() {
  reset()
  open.value = true
  title.value = "添加参数"
}

/** 单击行操作（用于选中） */
function handleRowClick(row, column, event) {
  // 如果点击的是操作列，不处理
  if (event?.target?.closest('.action-buttons')) {
    return
  }
}

/** 双击行操作 */
function handleRowDblClick(row, column, event) {
  // 如果双击的是操作列，不处理（避免与按钮点击冲突）
  if (event?.target?.closest('.action-buttons')) {
    return
  }
  
  // 直接调用修改方法打开编辑对话框
  // 权限控制由对话框内的保存按钮处理
  handleUpdate(row)
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset()
  // 确保 row 是对象且有 configId
  if (!row || typeof row !== 'object') {
    return
  }
  
  const configId = row.configId || (Array.isArray(ids.value) && ids.value.length === 1 ? ids.value[0] : null)
  
  if (!configId) {
    proxy.$modal.msgWarning("请选择要修改的参数")
    return
  }
  
  getConfig(configId).then(response => {
    form.value = response.data
    open.value = true
    title.value = "修改参数"
  }).catch(error => {
    console.error("获取参数配置失败:", error)
    proxy.$modal.msgError("获取参数配置失败")
  })
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["configRef"].validate(valid => {
    if (valid) {
      submitting.value = true
      const submitFn = form.value.configId != undefined ? updateConfig : addConfig
      submitFn(form.value).then(response => {
        proxy.$modal.msgSuccess(form.value.configId != undefined ? "修改成功" : "新增成功")
        open.value = false
        getList()
      }).finally(() => {
        submitting.value = false
      })
    }
  })
}

/** 删除按钮操作 */
function handleDelete(row) {
  const configIds = row.configId || ids.value
  const configName = row.configName || (configList.value.find(item => item.configId === configIds)?.configName || '')
  const message = row.configId 
    ? `是否确认删除参数"${configName}"？`
    : `是否确认删除选中的 ${configIds.length} 条参数配置？`
  proxy.$modal.confirm(message).then(function () {
    return delConfig(configIds)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess("删除成功")
  }).catch(() => {})
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download("system/config/export", {
    ...queryParams.value
  }, `config_${new Date().getTime()}.xlsx`)
}

/** 刷新缓存按钮操作 */
function handleRefreshCache() {
  refreshCache().then(() => {
    proxy.$modal.msgSuccess("刷新缓存成功")
  })
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

.config-value {
  color: var(--el-text-color-regular);
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 13px;
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

.config-table {
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

.config-form {
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
