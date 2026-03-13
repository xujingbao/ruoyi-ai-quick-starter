-- PostgreSQL AI-native capabilities bootstrap
-- Run after core schema initialization.

BEGIN;

-- Vector extension for semantic retrieval
CREATE EXTENSION IF NOT EXISTS vector;

-- FTS extension for Chinese text parsing support (optional)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- AI knowledge chunks (RAG storage baseline)
CREATE TABLE IF NOT EXISTS ai_knowledge_chunk (
  chunk_id bigserial PRIMARY KEY,
  biz_key varchar(128) NOT NULL,
  source_type varchar(64) NOT NULL DEFAULT 'document',
  content text NOT NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  embedding vector(1024),
  tsv tsvector GENERATED ALWAYS AS (to_tsvector('simple', content)) STORED,
  created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_ai_chunk_biz_key ON ai_knowledge_chunk (biz_key);
CREATE INDEX IF NOT EXISTS idx_ai_chunk_metadata_gin ON ai_knowledge_chunk USING gin (metadata);
CREATE INDEX IF NOT EXISTS idx_ai_chunk_tsv_gin ON ai_knowledge_chunk USING gin (tsv);
CREATE INDEX IF NOT EXISTS idx_ai_chunk_embedding_ivfflat ON ai_knowledge_chunk USING hnsw (embedding vector_cosine_ops);

-- AI session context baseline
CREATE TABLE IF NOT EXISTS ai_session_context (
  session_id varchar(64) PRIMARY KEY,
  user_id bigint,
  context_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  summary text,
  created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_ai_session_user_id ON ai_session_context (user_id);
CREATE INDEX IF NOT EXISTS idx_ai_session_context_gin ON ai_session_context USING gin (context_data);

COMMIT;
