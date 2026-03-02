## ADDED Requirements

### Requirement: Vector retrieval foundation shall be available
系统 MUST 在 PostgreSQL 中提供向量检索基础能力，包括向量字段定义与可扩展索引策略，以支持后续 AI 检索增强场景。

#### Scenario: Persist and query embeddings
- **WHEN** 应用写入文本对应的向量嵌入并执行相似度检索
- **THEN** PostgreSQL 应返回按相似度排序的候选结果，且结果可用于上层 AI 流程

### Requirement: Context data shall support JSONB storage
系统 SHALL 使用 JSONB 存储 AI 会话与上下文扩展字段，保证半结构化数据可查询、可演进。

#### Scenario: Query context by JSON attributes
- **WHEN** 应用根据上下文属性进行过滤查询
- **THEN** 系统应基于 JSONB 字段返回符合条件的数据记录

### Requirement: Full-text retrieval capability shall be reserved
系统 MUST 提供 PostgreSQL 全文检索能力预留（文本索引与检索接口所需结构），用于支持混合检索场景。

#### Scenario: Text search on knowledge content
- **WHEN** 应用对知识内容执行关键词检索
- **THEN** 系统应返回相关文本候选，并可与向量检索结果组合使用
