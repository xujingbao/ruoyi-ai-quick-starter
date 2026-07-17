-- 移除 Spring AI 轻量聊天菜单与旧 OpenAI 参数（幂等）
-- 执行后重新登录或刷新菜单缓存

DELETE FROM sys_role_menu
WHERE menu_id IN (
    SELECT menu_id FROM sys_menu
    WHERE path = 'chat' OR component = 'ai/chat/index' OR perms LIKE 'ai:chat%'
       OR menu_name = 'AI聊天'
);

DELETE FROM sys_menu
WHERE path = 'chat' OR component = 'ai/chat/index' OR perms LIKE 'ai:chat%'
   OR menu_name = 'AI聊天';

DELETE FROM sys_config
WHERE config_key LIKE 'openai.api.%';
