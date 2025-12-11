# ************************************************************
# Sequel Ace SQL dump
# Version 20095
#
# https://sequel-ace.com/
# https://github.com/Sequel-Ace/Sequel-Ace
#
# Host: localhost (MySQL 8.0.43)
# Database: ry-demo
# Generation Time: 2025-12-11 14:57:36 +0000
# ************************************************************


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
SET NAMES utf8mb4;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE='NO_AUTO_VALUE_ON_ZERO', SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


# Dump of table sys_config
# ------------------------------------------------------------

DROP TABLE IF EXISTS `sys_config`;

CREATE TABLE `sys_config` (
  `config_id` int NOT NULL AUTO_INCREMENT COMMENT '参数主键',
  `config_name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT '' COMMENT '参数名称',
  `config_key` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT '' COMMENT '参数键名',
  `config_value` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT '' COMMENT '参数键值',
  `config_type` char(1) COLLATE utf8mb4_unicode_ci DEFAULT 'N' COMMENT '系统内置（Y是 N否）',
  `create_by` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT '' COMMENT '创建者',
  `create_time` datetime DEFAULT NULL COMMENT '创建时间',
  `update_by` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT '' COMMENT '更新者',
  `update_time` datetime DEFAULT NULL COMMENT '更新时间',
  `remark` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '备注',
  PRIMARY KEY (`config_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='参数配置表';

LOCK TABLES `sys_config` WRITE;
/*!40000 ALTER TABLE `sys_config` DISABLE KEYS */;

INSERT INTO `sys_config` (`config_id`, `config_name`, `config_key`, `config_value`, `config_type`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`)
VALUES
	(1,'主框架页-默认皮肤样式名称','sys.index.skinName','skin-blue','Y','admin','2025-12-01 04:31:35','',NULL,'蓝色 skin-blue、绿色 skin-green、紫色 skin-purple、红色 skin-red、黄色 skin-yellow'),
	(2,'用户管理-账号初始密码','sys.user.initPassword','123456','Y','admin','2025-12-01 04:31:35','',NULL,'初始化密码 123456'),
	(3,'主框架页-侧边栏主题','sys.index.sideTheme','theme-dark','Y','admin','2025-12-01 04:31:35','',NULL,'深色主题theme-dark，浅色主题theme-light'),
	(4,'账号自助-验证码开关','sys.account.captchaEnabled','true','Y','admin','2025-12-01 04:31:35','',NULL,'是否开启验证码功能（true开启，false关闭）'),
	(5,'账号自助-是否开启用户注册功能','sys.account.registerUser','false','Y','admin','2025-12-01 04:31:36','',NULL,'是否开启注册用户功能（true开启，false关闭）'),
	(6,'用户登录-黑名单列表','sys.login.blackIPList','','Y','admin','2025-12-01 04:31:36','',NULL,'设置登录IP黑名单限制，多个匹配项以;分隔，支持匹配（*通配、网段）'),
	(7,'用户管理-初始密码修改策略','sys.account.initPasswordModify','1','Y','admin','2025-12-01 04:31:36','',NULL,'0：初始密码修改策略关闭，没有任何提示，1：提醒用户，如果未修改初始密码，则在登录时就会提醒修改密码对话框'),
	(8,'用户管理-账号密码更新周期','sys.account.passwordValidateDays','0','Y','admin','2025-12-01 04:31:36','',NULL,'密码更新周期（填写数字，数据初始化值为0不限制，若修改必须为大于0小于365的正整数），如果超过这个周期登录系统时，则在登录时就会提醒修改密码对话框');

/*!40000 ALTER TABLE `sys_config` ENABLE KEYS */;
UNLOCK TABLES;


# Dump of table sys_dept
# ------------------------------------------------------------

DROP TABLE IF EXISTS `sys_dept`;

CREATE TABLE `sys_dept` (
  `dept_id` bigint NOT NULL AUTO_INCREMENT COMMENT '部门id',
  `parent_id` bigint DEFAULT '0' COMMENT '父部门id',
  `ancestors` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT '' COMMENT '祖级列表',
  `dept_name` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT '' COMMENT '部门名称',
  `order_num` int DEFAULT '0' COMMENT '显示顺序',
  `leader` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '负责人',
  `phone` varchar(11) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '联系电话',
  `email` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '邮箱',
  `status` char(1) COLLATE utf8mb4_unicode_ci DEFAULT '0' COMMENT '部门状态（0正常 1停用）',
  `del_flag` char(1) COLLATE utf8mb4_unicode_ci DEFAULT '0' COMMENT '删除标志（0代表存在 2代表删除）',
  `create_by` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT '' COMMENT '创建者',
  `create_time` datetime DEFAULT NULL COMMENT '创建时间',
  `update_by` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT '' COMMENT '更新者',
  `update_time` datetime DEFAULT NULL COMMENT '更新时间',
  PRIMARY KEY (`dept_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='部门表';

LOCK TABLES `sys_dept` WRITE;
/*!40000 ALTER TABLE `sys_dept` DISABLE KEYS */;

INSERT INTO `sys_dept` (`dept_id`, `parent_id`, `ancestors`, `dept_name`, `order_num`, `leader`, `phone`, `email`, `status`, `del_flag`, `create_by`, `create_time`, `update_by`, `update_time`)
VALUES
	(100,0,'0','科技集团',0,'evan','15888888888','evan@ai-quick.dev','0','0','admin','2025-12-01 04:31:32','admin','2025-12-11 14:50:25'),
	(101,100,'0,100','深圳总公司',1,'evan','15888888888','evan@ai-quick.dev','0','0','admin','2025-12-01 04:31:32','admin','2025-12-11 14:50:22'),
	(102,100,'0,100','长沙分公司',2,'evan','15888888888','evan@ai-quick.dev','0','0','admin','2025-12-01 04:31:32','',NULL),
	(103,101,'0,100,101','科技研发部',1,'evan','15888888888','evan@ai-quick.dev','0','0','admin','2025-12-01 04:31:32','admin','2025-12-11 14:50:28'),
	(104,101,'0,100,101','市场部门',2,'evan','15888888888','evan@ai-quick.dev','0','0','admin','2025-12-01 04:31:32','admin','2025-12-11 14:50:31'),
	(105,101,'0,100,101','测试部门',3,'evan','15888888888','evan@ai-quick.dev','0','0','admin','2025-12-01 04:31:32','admin','2025-12-11 14:50:35'),
	(106,101,'0,100,101','财务部门',4,'evan','15888888888','evan@ai-quick.dev','0','0','admin','2025-12-01 04:31:32','admin','2025-12-11 14:50:39'),
	(107,101,'0,100,101','运维部门',5,'evan','15888888888','evan@ai-quick.dev','0','0','admin','2025-12-01 04:31:32','',NULL),
	(108,102,'0,100,102','市场部门',1,'evan','15888888888','evan@ai-quick.dev','0','0','admin','2025-12-01 04:31:32','',NULL),
	(109,102,'0,100,102','财务部门',2,'evan','15888888888','evan@ai-quick.dev','0','0','admin','2025-12-01 04:31:32','',NULL),
	(223,100,'0,100','北京分公司',3,'evan','15888888888','evan@ai-quick.dev','0','0','admin','2025-12-11 14:52:46','',NULL),
	(224,100,'0,100','上海分公司',4,'evan','15888888888','evan@ai-quick.dev','0','0','admin','2025-12-11 14:52:46','',NULL),
	(225,101,'0,100,101','产品部门',6,'evan','15888888888','evan@ai-quick.dev','0','0','admin','2025-12-11 14:52:46','',NULL),
	(226,101,'0,100,101','人事部门',7,'evan','15888888888','evan@ai-quick.dev','0','0','admin','2025-12-11 14:52:46','',NULL),
	(227,101,'0,100,101','法务部门',8,'evan','15888888888','evan@ai-quick.dev','0','0','admin','2025-12-11 14:52:46','',NULL),
	(228,103,'0,100,101,103','前端开发组',1,'evan','15888888888','evan@ai-quick.dev','0','0','admin','2025-12-11 14:52:46','',NULL),
	(229,103,'0,100,101,103','后端开发组',2,'evan','15888888888','evan@ai-quick.dev','0','0','admin','2025-12-11 14:52:46','',NULL),
	(230,103,'0,100,101,103','移动端开发组',3,'evan','15888888888','evan@ai-quick.dev','0','0','admin','2025-12-11 14:52:46','',NULL),
	(231,103,'0,100,101,103','AI算法组',4,'evan','15888888888','evan@ai-quick.dev','0','0','admin','2025-12-11 14:52:46','',NULL),
	(232,104,'0,100,101,104','市场推广组',1,'evan','15888888888','evan@ai-quick.dev','0','0','admin','2025-12-11 14:52:46','',NULL),
	(233,104,'0,100,101,104','商务拓展组',2,'evan','15888888888','evan@ai-quick.dev','0','0','admin','2025-12-11 14:52:46','',NULL),
	(234,105,'0,100,101,105','功能测试组',1,'evan','15888888888','evan@ai-quick.dev','0','0','admin','2025-12-11 14:52:46','',NULL),
	(235,105,'0,100,101,105','性能测试组',2,'evan','15888888888','evan@ai-quick.dev','0','0','admin','2025-12-11 14:52:46','',NULL),
	(236,105,'0,100,101,105','自动化测试组',3,'evan','15888888888','evan@ai-quick.dev','0','0','admin','2025-12-11 14:52:46','',NULL),
	(237,107,'0,100,101,107','系统运维组',1,'evan','15888888888','evan@ai-quick.dev','0','0','admin','2025-12-11 14:52:46','',NULL),
	(238,107,'0,100,101,107','网络运维组',2,'evan','15888888888','evan@ai-quick.dev','0','0','admin','2025-12-11 14:52:46','',NULL),
	(239,107,'0,100,101,107','安全运维组',3,'evan','15888888888','evan@ai-quick.dev','0','0','admin','2025-12-11 14:52:46','',NULL),
	(240,102,'0,100,102','技术部门',3,'evan','15888888888','evan@ai-quick.dev','0','0','admin','2025-12-11 14:52:46','',NULL),
	(241,102,'0,100,102','运营部门',4,'evan','15888888888','evan@ai-quick.dev','0','0','admin','2025-12-11 14:52:46','',NULL),
	(242,223,'0,100,223','技术部门',1,'evan','15888888888','evan@ai-quick.dev','0','0','admin','2025-12-11 14:53:09','',NULL),
	(243,223,'0,100,223','市场部门',2,'evan','15888888888','evan@ai-quick.dev','0','0','admin','2025-12-11 14:53:09','',NULL),
	(244,223,'0,100,223','销售部门',3,'evan','15888888888','evan@ai-quick.dev','0','0','admin','2025-12-11 14:53:09','',NULL),
	(245,223,'0,100,223','运营部门',4,'evan','15888888888','evan@ai-quick.dev','0','0','admin','2025-12-11 14:53:09','',NULL),
	(246,224,'0,100,224','技术部门',1,'evan','15888888888','evan@ai-quick.dev','0','0','admin','2025-12-11 14:53:09','',NULL),
	(247,224,'0,100,224','市场部门',2,'evan','15888888888','evan@ai-quick.dev','0','0','admin','2025-12-11 14:53:09','',NULL),
	(248,224,'0,100,224','销售部门',3,'evan','15888888888','evan@ai-quick.dev','0','0','admin','2025-12-11 14:53:09','',NULL),
	(249,224,'0,100,224','客户服务部门',4,'evan','15888888888','evan@ai-quick.dev','0','0','admin','2025-12-11 14:53:09','',NULL);

/*!40000 ALTER TABLE `sys_dept` ENABLE KEYS */;
UNLOCK TABLES;


# Dump of table sys_dict_data
# ------------------------------------------------------------

DROP TABLE IF EXISTS `sys_dict_data`;

CREATE TABLE `sys_dict_data` (
  `dict_code` bigint NOT NULL AUTO_INCREMENT COMMENT '字典编码',
  `dict_sort` int DEFAULT '0' COMMENT '字典排序',
  `dict_label` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT '' COMMENT '字典标签',
  `dict_value` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT '' COMMENT '字典键值',
  `dict_type` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT '' COMMENT '字典类型',
  `css_class` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '样式属性（其他样式扩展）',
  `list_class` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '表格回显样式',
  `is_default` char(1) COLLATE utf8mb4_unicode_ci DEFAULT 'N' COMMENT '是否默认（Y是 N否）',
  `status` char(1) COLLATE utf8mb4_unicode_ci DEFAULT '0' COMMENT '状态（0正常 1停用）',
  `create_by` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT '' COMMENT '创建者',
  `create_time` datetime DEFAULT NULL COMMENT '创建时间',
  `update_by` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT '' COMMENT '更新者',
  `update_time` datetime DEFAULT NULL COMMENT '更新时间',
  `remark` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '备注',
  PRIMARY KEY (`dict_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='字典数据表';

LOCK TABLES `sys_dict_data` WRITE;
/*!40000 ALTER TABLE `sys_dict_data` DISABLE KEYS */;

INSERT INTO `sys_dict_data` (`dict_code`, `dict_sort`, `dict_label`, `dict_value`, `dict_type`, `css_class`, `list_class`, `is_default`, `status`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`)
VALUES
	(1,1,'男','0','sys_user_sex','','','Y','0','admin','2025-12-01 04:31:35','',NULL,'性别男'),
	(2,2,'女','1','sys_user_sex','','','N','0','admin','2025-12-01 04:31:35','',NULL,'性别女'),
	(3,3,'未知','2','sys_user_sex','','','N','0','admin','2025-12-01 04:31:35','',NULL,'性别未知'),
	(4,1,'显示','0','sys_show_hide','','primary','Y','0','admin','2025-12-01 04:31:35','',NULL,'显示菜单'),
	(5,2,'隐藏','1','sys_show_hide','','danger','N','0','admin','2025-12-01 04:31:35','',NULL,'隐藏菜单'),
	(6,1,'正常','0','sys_normal_disable','','primary','Y','0','admin','2025-12-01 04:31:35','',NULL,'正常状态'),
	(7,2,'停用','1','sys_normal_disable','','danger','N','0','admin','2025-12-01 04:31:35','',NULL,'停用状态'),
	(8,1,'正常','0','sys_job_status','','primary','Y','0','admin','2025-12-01 04:31:35','',NULL,'正常状态'),
	(9,2,'暂停','1','sys_job_status','','danger','N','0','admin','2025-12-01 04:31:35','',NULL,'停用状态'),
	(10,1,'默认','DEFAULT','sys_job_group','','','Y','0','admin','2025-12-01 04:31:35','',NULL,'默认分组'),
	(11,2,'系统','SYSTEM','sys_job_group','','','N','0','admin','2025-12-01 04:31:35','',NULL,'系统分组'),
	(12,1,'是','Y','sys_yes_no','','primary','Y','0','admin','2025-12-01 04:31:35','',NULL,'系统默认是'),
	(13,2,'否','N','sys_yes_no','','danger','N','0','admin','2025-12-01 04:31:35','',NULL,'系统默认否'),
	(14,1,'通知','1','sys_notice_type','','warning','Y','0','admin','2025-12-01 04:31:35','',NULL,'通知'),
	(15,2,'公告','2','sys_notice_type','','success','N','0','admin','2025-12-01 04:31:35','',NULL,'公告'),
	(16,1,'正常','0','sys_notice_status','','primary','Y','0','admin','2025-12-01 04:31:35','',NULL,'正常状态'),
	(17,2,'关闭','1','sys_notice_status','','danger','N','0','admin','2025-12-01 04:31:35','',NULL,'关闭状态'),
	(18,99,'其他','0','sys_oper_type','','info','N','0','admin','2025-12-01 04:31:35','',NULL,'其他操作'),
	(19,1,'新增','1','sys_oper_type','','info','N','0','admin','2025-12-01 04:31:35','',NULL,'新增操作'),
	(20,2,'修改','2','sys_oper_type','','info','N','0','admin','2025-12-01 04:31:35','',NULL,'修改操作'),
	(21,3,'删除','3','sys_oper_type','','danger','N','0','admin','2025-12-01 04:31:35','',NULL,'删除操作'),
	(22,4,'授权','4','sys_oper_type','','primary','N','0','admin','2025-12-01 04:31:35','',NULL,'授权操作'),
	(23,5,'导出','5','sys_oper_type','','warning','N','0','admin','2025-12-01 04:31:35','',NULL,'导出操作'),
	(24,6,'导入','6','sys_oper_type','','warning','N','0','admin','2025-12-01 04:31:35','',NULL,'导入操作'),
	(25,7,'强退','7','sys_oper_type','','danger','N','0','admin','2025-12-01 04:31:35','',NULL,'强退操作'),
	(26,8,'生成代码','8','sys_oper_type','','warning','N','0','admin','2025-12-01 04:31:35','',NULL,'生成操作'),
	(27,9,'清空数据','9','sys_oper_type','','danger','N','0','admin','2025-12-01 04:31:35','',NULL,'清空操作'),
	(28,1,'成功','0','sys_common_status','','primary','N','0','admin','2025-12-01 04:31:35','',NULL,'正常状态'),
	(29,2,'失败','1','sys_common_status','','danger','N','0','admin','2025-12-01 04:31:35','',NULL,'停用状态');

/*!40000 ALTER TABLE `sys_dict_data` ENABLE KEYS */;
UNLOCK TABLES;


# Dump of table sys_dict_type
# ------------------------------------------------------------

DROP TABLE IF EXISTS `sys_dict_type`;

CREATE TABLE `sys_dict_type` (
  `dict_id` bigint NOT NULL AUTO_INCREMENT COMMENT '字典主键',
  `dict_name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT '' COMMENT '字典名称',
  `dict_type` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT '' COMMENT '字典类型',
  `status` char(1) COLLATE utf8mb4_unicode_ci DEFAULT '0' COMMENT '状态（0正常 1停用）',
  `create_by` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT '' COMMENT '创建者',
  `create_time` datetime DEFAULT NULL COMMENT '创建时间',
  `update_by` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT '' COMMENT '更新者',
  `update_time` datetime DEFAULT NULL COMMENT '更新时间',
  `remark` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '备注',
  PRIMARY KEY (`dict_id`),
  UNIQUE KEY `dict_type` (`dict_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='字典类型表';

LOCK TABLES `sys_dict_type` WRITE;
/*!40000 ALTER TABLE `sys_dict_type` DISABLE KEYS */;

INSERT INTO `sys_dict_type` (`dict_id`, `dict_name`, `dict_type`, `status`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`)
VALUES
	(1,'用户性别','sys_user_sex','0','admin','2025-12-01 04:31:35','',NULL,'用户性别列表'),
	(2,'菜单状态','sys_show_hide','0','admin','2025-12-01 04:31:35','',NULL,'菜单状态列表'),
	(3,'系统开关','sys_normal_disable','0','admin','2025-12-01 04:31:35','',NULL,'系统开关列表'),
	(4,'任务状态','sys_job_status','0','admin','2025-12-01 04:31:35','',NULL,'任务状态列表'),
	(5,'任务分组','sys_job_group','0','admin','2025-12-01 04:31:35','',NULL,'任务分组列表'),
	(6,'系统是否','sys_yes_no','0','admin','2025-12-01 04:31:35','',NULL,'系统是否列表'),
	(7,'通知类型','sys_notice_type','0','admin','2025-12-01 04:31:35','',NULL,'通知类型列表'),
	(8,'通知状态','sys_notice_status','0','admin','2025-12-01 04:31:35','',NULL,'通知状态列表'),
	(9,'操作类型','sys_oper_type','0','admin','2025-12-01 04:31:35','',NULL,'操作类型列表'),
	(10,'系统状态','sys_common_status','0','admin','2025-12-01 04:31:35','',NULL,'登录状态列表');

/*!40000 ALTER TABLE `sys_dict_type` ENABLE KEYS */;
UNLOCK TABLES;


# Dump of table sys_job
# ------------------------------------------------------------

DROP TABLE IF EXISTS `sys_job`;

CREATE TABLE `sys_job` (
  `job_id` bigint NOT NULL AUTO_INCREMENT COMMENT '任务ID',
  `job_name` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '' COMMENT '任务名称',
  `job_group` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'DEFAULT' COMMENT '任务组名',
  `invoke_target` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '调用目标字符串',
  `cron_expression` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT '' COMMENT 'cron执行表达式',
  `misfire_policy` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT '3' COMMENT '计划执行错误策略（1立即执行 2执行一次 3放弃执行）',
  `concurrent` char(1) COLLATE utf8mb4_unicode_ci DEFAULT '1' COMMENT '是否并发执行（0允许 1禁止）',
  `status` char(1) COLLATE utf8mb4_unicode_ci DEFAULT '0' COMMENT '状态（0正常 1暂停）',
  `create_by` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT '' COMMENT '创建者',
  `create_time` datetime DEFAULT NULL COMMENT '创建时间',
  `update_by` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT '' COMMENT '更新者',
  `update_time` datetime DEFAULT NULL COMMENT '更新时间',
  `remark` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT '' COMMENT '备注信息',
  PRIMARY KEY (`job_id`,`job_name`,`job_group`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='定时任务调度表';

LOCK TABLES `sys_job` WRITE;
/*!40000 ALTER TABLE `sys_job` DISABLE KEYS */;

INSERT INTO `sys_job` (`job_id`, `job_name`, `job_group`, `invoke_target`, `cron_expression`, `misfire_policy`, `concurrent`, `status`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`)
VALUES
	(1,'系统默认（无参）','DEFAULT','ryTask.ryNoParams','0/10 * * * * ?','3','1','1','admin','2025-12-01 04:31:36','',NULL,''),
	(2,'系统默认（有参）','DEFAULT','ryTask.ryParams(\'ry\')','0/15 * * * * ?','3','1','1','admin','2025-12-01 04:31:36','',NULL,''),
	(3,'系统默认（多参）','DEFAULT','ryTask.ryMultipleParams(\'ry\', true, 2000L, 316.50D, 100)','0/20 * * * * ?','3','1','1','admin','2025-12-01 04:31:36','',NULL,'');

/*!40000 ALTER TABLE `sys_job` ENABLE KEYS */;
UNLOCK TABLES;


# Dump of table sys_job_log
# ------------------------------------------------------------

DROP TABLE IF EXISTS `sys_job_log`;

CREATE TABLE `sys_job_log` (
  `job_log_id` bigint NOT NULL AUTO_INCREMENT COMMENT '任务日志ID',
  `job_name` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '任务名称',
  `job_group` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '任务组名',
  `invoke_target` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '调用目标字符串',
  `job_message` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '日志信息',
  `status` char(1) COLLATE utf8mb4_unicode_ci DEFAULT '0' COMMENT '执行状态（0正常 1失败）',
  `exception_info` varchar(2000) COLLATE utf8mb4_unicode_ci DEFAULT '' COMMENT '异常信息',
  `create_time` datetime DEFAULT NULL COMMENT '创建时间',
  PRIMARY KEY (`job_log_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='定时任务调度日志表';



# Dump of table sys_logininfor
# ------------------------------------------------------------

DROP TABLE IF EXISTS `sys_logininfor`;

CREATE TABLE `sys_logininfor` (
  `info_id` bigint NOT NULL AUTO_INCREMENT COMMENT '访问ID',
  `user_name` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT '' COMMENT '用户账号',
  `ipaddr` varchar(128) COLLATE utf8mb4_unicode_ci DEFAULT '' COMMENT '登录IP地址',
  `login_location` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT '' COMMENT '登录地点',
  `browser` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT '' COMMENT '浏览器类型',
  `os` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT '' COMMENT '操作系统',
  `status` char(1) COLLATE utf8mb4_unicode_ci DEFAULT '0' COMMENT '登录状态（0成功 1失败）',
  `msg` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT '' COMMENT '提示消息',
  `login_time` datetime DEFAULT NULL COMMENT '访问时间',
  PRIMARY KEY (`info_id`),
  KEY `idx_sys_logininfor_s` (`status`),
  KEY `idx_sys_logininfor_lt` (`login_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='系统访问记录';

LOCK TABLES `sys_logininfor` WRITE;
/*!40000 ALTER TABLE `sys_logininfor` DISABLE KEYS */;

INSERT INTO `sys_logininfor` (`info_id`, `user_name`, `ipaddr`, `login_location`, `browser`, `os`, `status`, `msg`, `login_time`)
VALUES
	(100,'admin','127.0.0.1','内网IP','Chrome 13','Mac OS X','0','登录成功','2025-12-02 11:35:16'),
	(101,'admin','127.0.0.1','内网IP','Chrome 14','Mac OS X','0','登录成功','2025-12-02 11:36:40'),
	(102,'admin','172.16.18.43','内网IP','Chrome Mobile','Android 1.x','0','登录成功','2025-12-02 12:23:04'),
	(103,'admin','127.0.0.1','内网IP','Chrome 14','Mac OS X','0','登录成功','2025-12-02 13:06:49'),
	(104,'admin','127.0.0.1','内网IP','Chrome 14','Mac OS X','1','验证码错误','2025-12-04 12:22:35'),
	(105,'admin','127.0.0.1','内网IP','Chrome 14','Mac OS X','0','登录成功','2025-12-04 12:22:39'),
	(106,'admin','127.0.0.1','内网IP','Chrome 14','Mac OS X','0','退出成功','2025-12-04 12:25:41'),
	(107,'admin','127.0.0.1','内网IP','Chrome 14','Mac OS X','0','登录成功','2025-12-04 12:27:35'),
	(108,'admin','127.0.0.1','内网IP','Chrome 14','Mac OS X','0','登录成功','2025-12-04 14:06:21'),
	(109,'admin','127.0.0.1','内网IP','Chrome 14','Mac OS X','0','登录成功','2025-12-05 02:25:50'),
	(110,'admin','127.0.0.1','内网IP','Chrome 14','Mac OS X','0','登录成功','2025-12-05 02:50:54'),
	(111,'admin','127.0.0.1','内网IP','Chrome 14','Mac OS X','0','登录成功','2025-12-05 03:04:34'),
	(112,'admin','127.0.0.1','内网IP','Chrome 13','Mac OS X','0','登录成功','2025-12-05 04:20:56'),
	(113,'admin','127.0.0.1','内网IP','Chrome 14','Mac OS X','0','登录成功','2025-12-05 04:24:25'),
	(114,'admin','127.0.0.1','内网IP','Chrome 13','Mac OS X','0','登录成功','2025-12-05 04:44:16'),
	(115,'admin','127.0.0.1','内网IP','Chrome 14','Mac OS X','0','登录成功','2025-12-05 04:44:57'),
	(116,'admin','127.0.0.1','内网IP','Chrome 14','Mac OS X','0','登录成功','2025-12-05 07:43:23'),
	(117,'admin','127.0.0.1','内网IP','Chrome 14','Mac OS X','0','退出成功','2025-12-05 07:43:31'),
	(118,'admin','127.0.0.1','内网IP','Chrome 14','Mac OS X','0','登录成功','2025-12-05 07:43:35'),
	(119,'admin','127.0.0.1','内网IP','Chrome 13','Mac OS X','1','验证码错误','2025-12-05 16:08:44'),
	(120,'admin','127.0.0.1','内网IP','Chrome 14','Mac OS X','0','登录成功','2025-12-05 16:08:56'),
	(121,'admin','127.0.0.1','内网IP','Chrome 14','Mac OS X','1','验证码错误','2025-12-06 01:58:27'),
	(122,'admin','127.0.0.1','内网IP','Chrome 14','Mac OS X','0','登录成功','2025-12-06 01:58:32'),
	(123,'admin','127.0.0.1','内网IP','CFNetwork','Mac OS X','0','登录成功','2025-12-07 07:33:54'),
	(124,'admin','127.0.0.1','内网IP','CFNetwork','Mac OS X','0','退出成功','2025-12-07 07:41:42'),
	(125,'admin','127.0.0.1','内网IP','CFNetwork','Mac OS X','0','登录成功','2025-12-07 07:45:28'),
	(126,'admin','127.0.0.1','内网IP','CFNetwork','Mac OS X','0','退出成功','2025-12-07 07:45:36'),
	(127,'admin','127.0.0.1','内网IP','CFNetwork','Mac OS X','0','登录成功','2025-12-07 08:45:53'),
	(128,'admin','127.0.0.1','内网IP','CFNetwork','Mac OS X','0','退出成功','2025-12-07 08:45:54'),
	(129,'admin','127.0.0.1','内网IP','CFNetwork','Mac OS X','0','登录成功','2025-12-07 08:48:18'),
	(130,'admin','127.0.0.1','内网IP','CFNetwork','Mac OS X','0','退出成功','2025-12-07 08:49:36'),
	(131,'admin','127.0.0.1','内网IP','CFNetwork','Mac OS X','0','登录成功','2025-12-07 08:54:38'),
	(132,'admin','127.0.0.1','内网IP','CFNetwork','Mac OS X','0','退出成功','2025-12-07 08:54:43'),
	(133,'admin','127.0.0.1','内网IP','CFNetwork','Mac OS X','0','登录成功','2025-12-07 08:56:41'),
	(134,'admin','127.0.0.1','内网IP','Chrome 14','Mac OS X','0','登录成功','2025-12-07 13:16:56'),
	(135,'admin','127.0.0.1','内网IP','Chrome 14','Mac OS X','0','登录成功','2025-12-10 09:10:06'),
	(136,'admin','127.0.0.1','内网IP','CFNetwork','Mac OS X','0','登录成功','2025-12-11 12:19:17'),
	(137,'admin','127.0.0.1','内网IP','CFNetwork','Mac OS X','0','退出成功','2025-12-11 12:20:48'),
	(138,'admin','127.0.0.1','内网IP','CFNetwork','Mac OS X','0','登录成功','2025-12-11 13:20:36'),
	(139,'admin','127.0.0.1','内网IP','CFNetwork','Mac OS X','0','退出成功','2025-12-11 13:21:53'),
	(140,'admin','127.0.0.1','内网IP','Chrome 14','Mac OS X','0','登录成功','2025-12-11 13:32:05'),
	(141,'admin','127.0.0.1','内网IP','Chrome 14','Mac OS X','0','退出成功','2025-12-11 14:20:12'),
	(142,'admin','127.0.0.1','内网IP','Chrome 14','Mac OS X','0','登录成功','2025-12-11 14:20:17'),
	(143,'admin','127.0.0.1','内网IP','Chrome 14','Mac OS X','0','退出成功','2025-12-11 14:28:03'),
	(144,'admin','127.0.0.1','内网IP','Chrome 14','Mac OS X','0','登录成功','2025-12-11 14:37:08'),
	(145,'admin','127.0.0.1','内网IP','Chrome 14','Mac OS X','0','退出成功','2025-12-11 14:37:18'),
	(146,'admin','127.0.0.1','内网IP','Chrome 14','Mac OS X','0','登录成功','2025-12-11 14:39:28'),
	(147,'admin','127.0.0.1','内网IP','Chrome 14','Mac OS X','0','退出成功','2025-12-11 14:41:47'),
	(148,'admin','127.0.0.1','内网IP','Chrome 14','Mac OS X','0','登录成功','2025-12-11 14:43:25');

/*!40000 ALTER TABLE `sys_logininfor` ENABLE KEYS */;
UNLOCK TABLES;


# Dump of table sys_menu
# ------------------------------------------------------------

DROP TABLE IF EXISTS `sys_menu`;

CREATE TABLE `sys_menu` (
  `menu_id` bigint NOT NULL AUTO_INCREMENT COMMENT '菜单ID',
  `menu_name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '菜单名称',
  `parent_id` bigint DEFAULT '0' COMMENT '父菜单ID',
  `order_num` int DEFAULT '0' COMMENT '显示顺序',
  `path` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT '' COMMENT '路由地址',
  `component` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '组件路径',
  `query` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '路由参数',
  `route_name` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT '' COMMENT '路由名称',
  `is_frame` int DEFAULT '1' COMMENT '是否为外链（0是 1否）',
  `is_cache` int DEFAULT '0' COMMENT '是否缓存（0缓存 1不缓存）',
  `menu_type` char(1) COLLATE utf8mb4_unicode_ci DEFAULT '' COMMENT '菜单类型（M目录 C菜单 F按钮）',
  `visible` char(1) COLLATE utf8mb4_unicode_ci DEFAULT '0' COMMENT '菜单状态（0显示 1隐藏）',
  `status` char(1) COLLATE utf8mb4_unicode_ci DEFAULT '0' COMMENT '菜单状态（0正常 1停用）',
  `perms` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '权限标识',
  `icon` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT '#' COMMENT '菜单图标',
  `create_by` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT '' COMMENT '创建者',
  `create_time` datetime DEFAULT NULL COMMENT '创建时间',
  `update_by` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT '' COMMENT '更新者',
  `update_time` datetime DEFAULT NULL COMMENT '更新时间',
  `remark` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT '' COMMENT '备注',
  PRIMARY KEY (`menu_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='菜单权限表';

LOCK TABLES `sys_menu` WRITE;
/*!40000 ALTER TABLE `sys_menu` DISABLE KEYS */;

INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `component`, `query`, `route_name`, `is_frame`, `is_cache`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`)
VALUES
	(1,'系统管理',0,1,'system',NULL,'','',1,0,'M','0','0','','system','admin','2025-12-01 04:31:32','',NULL,'系统管理目录'),
	(2,'系统监控',0,2,'monitor',NULL,'','',1,0,'M','0','0','','monitor','admin','2025-12-01 04:31:32','',NULL,'系统监控目录'),
	(4,'官方网站',0,4,'http://ai-quick.dev',NULL,'','',0,0,'M','0','0','','guide','admin','2025-12-01 04:31:33','admin','2025-12-11 14:11:11','若依官网地址'),
	(100,'用户管理',1,1,'user','system/user/index','','',1,0,'C','0','0','system:user:list','user','admin','2025-12-01 04:31:33','',NULL,'用户管理菜单'),
	(101,'角色管理',1,2,'role','system/role/index','','',1,0,'C','0','0','system:role:list','switch-filled','admin','2025-12-01 04:31:33','admin','2025-12-11 14:27:36','角色管理菜单'),
	(102,'菜单管理',1,3,'menu','system/menu/index','','',1,0,'C','0','0','system:menu:list','tree-table','admin','2025-12-01 04:31:33','',NULL,'菜单管理菜单'),
	(103,'部门管理',1,4,'dept','system/dept/index','','',1,0,'C','0','0','system:dept:list','tree','admin','2025-12-01 04:31:33','',NULL,'部门管理菜单'),
	(104,'岗位管理',1,5,'post','system/post/index','','',1,0,'C','0','0','system:post:list','post','admin','2025-12-01 04:31:33','',NULL,'岗位管理菜单'),
	(105,'字典管理',1,6,'dict','system/dict/index','','',1,0,'C','0','0','system:dict:list','dict','admin','2025-12-01 04:31:33','',NULL,'字典管理菜单'),
	(106,'参数设置',1,7,'config','system/config/index','','',1,0,'C','0','0','system:config:list','set-up','admin','2025-12-01 04:31:33','admin','2025-12-11 14:40:28','参数设置菜单'),
	(107,'通知公告',1,8,'notice','system/notice/index','','',1,0,'C','0','0','system:notice:list','message','admin','2025-12-01 04:31:33','',NULL,'通知公告菜单'),
	(108,'日志管理',1,9,'log','','','',1,0,'M','0','0','','log','admin','2025-12-01 04:31:33','',NULL,'日志管理菜单'),
	(109,'在线用户',2,1,'online','monitor/online/index','','',1,0,'C','0','0','monitor:online:list','online','admin','2025-12-01 04:31:33','',NULL,'在线用户菜单'),
	(110,'定时任务',2,2,'job','monitor/job/index','','',1,0,'C','0','0','monitor:job:list','job','admin','2025-12-01 04:31:33','',NULL,'定时任务菜单'),
	(111,'数据监控',2,3,'druid','monitor/druid/index','','',1,0,'C','0','0','monitor:druid:list','druid','admin','2025-12-01 04:31:33','',NULL,'数据监控菜单'),
	(112,'服务监控',2,4,'server','monitor/server/index','','',1,0,'C','0','0','monitor:server:list','server','admin','2025-12-01 04:31:33','',NULL,'服务监控菜单'),
	(113,'缓存监控',2,5,'cache','monitor/cache/index','','',1,0,'C','0','0','monitor:cache:list','redis','admin','2025-12-01 04:31:33','',NULL,'缓存监控菜单'),
	(114,'缓存列表',2,6,'cacheList','monitor/cache/list','','',1,0,'C','0','0','monitor:cache:list','redis-list','admin','2025-12-01 04:31:33','',NULL,'缓存列表菜单'),
	(500,'操作日志',108,1,'operlog','monitor/operlog/index','','',1,0,'C','0','0','monitor:operlog:list','form','admin','2025-12-01 04:31:33','',NULL,'操作日志菜单'),
	(501,'登录日志',108,2,'logininfor','monitor/logininfor/index','','',1,0,'C','0','0','monitor:logininfor:list','logininfor','admin','2025-12-01 04:31:33','',NULL,'登录日志菜单'),
	(1000,'用户查询',100,1,'','','','',1,0,'F','0','0','system:user:query','#','admin','2025-12-01 04:31:33','',NULL,''),
	(1001,'用户新增',100,2,'','','','',1,0,'F','0','0','system:user:add','#','admin','2025-12-01 04:31:33','',NULL,''),
	(1002,'用户修改',100,3,'','','','',1,0,'F','0','0','system:user:edit','#','admin','2025-12-01 04:31:33','',NULL,''),
	(1003,'用户删除',100,4,'','','','',1,0,'F','0','0','system:user:remove','#','admin','2025-12-01 04:31:33','',NULL,''),
	(1004,'用户导出',100,5,'','','','',1,0,'F','0','0','system:user:export','#','admin','2025-12-01 04:31:33','',NULL,''),
	(1005,'用户导入',100,6,'','','','',1,0,'F','0','0','system:user:import','#','admin','2025-12-01 04:31:33','',NULL,''),
	(1006,'重置密码',100,7,'','','','',1,0,'F','0','0','system:user:resetPwd','#','admin','2025-12-01 04:31:33','',NULL,''),
	(1007,'角色查询',101,1,'','','','',1,0,'F','0','0','system:role:query','#','admin','2025-12-01 04:31:33','',NULL,''),
	(1008,'角色新增',101,2,'','','','',1,0,'F','0','0','system:role:add','#','admin','2025-12-01 04:31:33','',NULL,''),
	(1009,'角色修改',101,3,'','','','',1,0,'F','0','0','system:role:edit','#','admin','2025-12-01 04:31:33','',NULL,''),
	(1010,'角色删除',101,4,'','','','',1,0,'F','0','0','system:role:remove','#','admin','2025-12-01 04:31:33','',NULL,''),
	(1011,'角色导出',101,5,'','','','',1,0,'F','0','0','system:role:export','#','admin','2025-12-01 04:31:33','',NULL,''),
	(1012,'菜单查询',102,1,'','','','',1,0,'F','0','0','system:menu:query','#','admin','2025-12-01 04:31:33','',NULL,''),
	(1013,'菜单新增',102,2,'','','','',1,0,'F','0','0','system:menu:add','#','admin','2025-12-01 04:31:33','',NULL,''),
	(1014,'菜单修改',102,3,'','','','',1,0,'F','0','0','system:menu:edit','#','admin','2025-12-01 04:31:33','',NULL,''),
	(1015,'菜单删除',102,4,'','','','',1,0,'F','0','0','system:menu:remove','#','admin','2025-12-01 04:31:33','',NULL,''),
	(1016,'部门查询',103,1,'','','','',1,0,'F','0','0','system:dept:query','#','admin','2025-12-01 04:31:33','',NULL,''),
	(1017,'部门新增',103,2,'','','','',1,0,'F','0','0','system:dept:add','#','admin','2025-12-01 04:31:33','',NULL,''),
	(1018,'部门修改',103,3,'','','','',1,0,'F','0','0','system:dept:edit','#','admin','2025-12-01 04:31:33','',NULL,''),
	(1019,'部门删除',103,4,'','','','',1,0,'F','0','0','system:dept:remove','#','admin','2025-12-01 04:31:33','',NULL,''),
	(1020,'岗位查询',104,1,'','','','',1,0,'F','0','0','system:post:query','#','admin','2025-12-01 04:31:33','',NULL,''),
	(1021,'岗位新增',104,2,'','','','',1,0,'F','0','0','system:post:add','#','admin','2025-12-01 04:31:33','',NULL,''),
	(1022,'岗位修改',104,3,'','','','',1,0,'F','0','0','system:post:edit','#','admin','2025-12-01 04:31:33','',NULL,''),
	(1023,'岗位删除',104,4,'','','','',1,0,'F','0','0','system:post:remove','#','admin','2025-12-01 04:31:33','',NULL,''),
	(1024,'岗位导出',104,5,'','','','',1,0,'F','0','0','system:post:export','#','admin','2025-12-01 04:31:33','',NULL,''),
	(1025,'字典查询',105,1,'#','','','',1,0,'F','0','0','system:dict:query','#','admin','2025-12-01 04:31:33','',NULL,''),
	(1026,'字典新增',105,2,'#','','','',1,0,'F','0','0','system:dict:add','#','admin','2025-12-01 04:31:33','',NULL,''),
	(1027,'字典修改',105,3,'#','','','',1,0,'F','0','0','system:dict:edit','#','admin','2025-12-01 04:31:33','',NULL,''),
	(1028,'字典删除',105,4,'#','','','',1,0,'F','0','0','system:dict:remove','#','admin','2025-12-01 04:31:33','',NULL,''),
	(1029,'字典导出',105,5,'#','','','',1,0,'F','0','0','system:dict:export','#','admin','2025-12-01 04:31:33','',NULL,''),
	(1030,'参数查询',106,1,'#','','','',1,0,'F','0','0','system:config:query','#','admin','2025-12-01 04:31:33','',NULL,''),
	(1031,'参数新增',106,2,'#','','','',1,0,'F','0','0','system:config:add','#','admin','2025-12-01 04:31:33','',NULL,''),
	(1032,'参数修改',106,3,'#','','','',1,0,'F','0','0','system:config:edit','#','admin','2025-12-01 04:31:33','',NULL,''),
	(1033,'参数删除',106,4,'#','','','',1,0,'F','0','0','system:config:remove','#','admin','2025-12-01 04:31:33','',NULL,''),
	(1034,'参数导出',106,5,'#','','','',1,0,'F','0','0','system:config:export','#','admin','2025-12-01 04:31:33','',NULL,''),
	(1035,'公告查询',107,1,'#','','','',1,0,'F','0','0','system:notice:query','#','admin','2025-12-01 04:31:33','',NULL,''),
	(1036,'公告新增',107,2,'#','','','',1,0,'F','0','0','system:notice:add','#','admin','2025-12-01 04:31:33','',NULL,''),
	(1037,'公告修改',107,3,'#','','','',1,0,'F','0','0','system:notice:edit','#','admin','2025-12-01 04:31:33','',NULL,''),
	(1038,'公告删除',107,4,'#','','','',1,0,'F','0','0','system:notice:remove','#','admin','2025-12-01 04:31:33','',NULL,''),
	(1039,'操作查询',500,1,'#','','','',1,0,'F','0','0','monitor:operlog:query','#','admin','2025-12-01 04:31:33','',NULL,''),
	(1040,'操作删除',500,2,'#','','','',1,0,'F','0','0','monitor:operlog:remove','#','admin','2025-12-01 04:31:33','',NULL,''),
	(1041,'日志导出',500,3,'#','','','',1,0,'F','0','0','monitor:operlog:export','#','admin','2025-12-01 04:31:33','',NULL,''),
	(1042,'登录查询',501,1,'#','','','',1,0,'F','0','0','monitor:logininfor:query','#','admin','2025-12-01 04:31:33','',NULL,''),
	(1043,'登录删除',501,2,'#','','','',1,0,'F','0','0','monitor:logininfor:remove','#','admin','2025-12-01 04:31:33','',NULL,''),
	(1044,'日志导出',501,3,'#','','','',1,0,'F','0','0','monitor:logininfor:export','#','admin','2025-12-01 04:31:33','',NULL,''),
	(1045,'账户解锁',501,4,'#','','','',1,0,'F','0','0','monitor:logininfor:unlock','#','admin','2025-12-01 04:31:33','',NULL,''),
	(1046,'在线查询',109,1,'#','','','',1,0,'F','0','0','monitor:online:query','#','admin','2025-12-01 04:31:33','',NULL,''),
	(1047,'批量强退',109,2,'#','','','',1,0,'F','0','0','monitor:online:batchLogout','#','admin','2025-12-01 04:31:33','',NULL,''),
	(1048,'单条强退',109,3,'#','','','',1,0,'F','0','0','monitor:online:forceLogout','#','admin','2025-12-01 04:31:33','',NULL,''),
	(1049,'任务查询',110,1,'#','','','',1,0,'F','0','0','monitor:job:query','#','admin','2025-12-01 04:31:33','',NULL,''),
	(1050,'任务新增',110,2,'#','','','',1,0,'F','0','0','monitor:job:add','#','admin','2025-12-01 04:31:33','',NULL,''),
	(1051,'任务修改',110,3,'#','','','',1,0,'F','0','0','monitor:job:edit','#','admin','2025-12-01 04:31:34','',NULL,''),
	(1052,'任务删除',110,4,'#','','','',1,0,'F','0','0','monitor:job:remove','#','admin','2025-12-01 04:31:34','',NULL,''),
	(1053,'状态修改',110,5,'#','','','',1,0,'F','0','0','monitor:job:changeStatus','#','admin','2025-12-01 04:31:34','',NULL,''),
	(1054,'任务导出',110,6,'#','','','',1,0,'F','0','0','monitor:job:export','#','admin','2025-12-01 04:31:34','',NULL,'');

/*!40000 ALTER TABLE `sys_menu` ENABLE KEYS */;
UNLOCK TABLES;


# Dump of table sys_notice
# ------------------------------------------------------------

DROP TABLE IF EXISTS `sys_notice`;

CREATE TABLE `sys_notice` (
  `notice_id` int NOT NULL AUTO_INCREMENT COMMENT '公告ID',
  `notice_title` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '公告标题',
  `notice_type` char(1) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '公告类型（1通知 2公告）',
  `notice_content` longblob COMMENT '公告内容',
  `status` char(1) COLLATE utf8mb4_unicode_ci DEFAULT '0' COMMENT '公告状态（0正常 1关闭）',
  `create_by` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT '' COMMENT '创建者',
  `create_time` datetime DEFAULT NULL COMMENT '创建时间',
  `update_by` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT '' COMMENT '更新者',
  `update_time` datetime DEFAULT NULL COMMENT '更新时间',
  `remark` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '备注',
  PRIMARY KEY (`notice_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='通知公告表';

LOCK TABLES `sys_notice` WRITE;
/*!40000 ALTER TABLE `sys_notice` DISABLE KEYS */;

INSERT INTO `sys_notice` (`notice_id`, `notice_title`, `notice_type`, `notice_content`, `status`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`)
VALUES
	(10,'系统升级通知','1',X'E7B3BBE7BB9FE5B086E4BA8EE69CACE591A8E585ADE5878CE699A8323A30302D343A3030E8BF9BE8A18CE7B3BBE7BB9FE58D87E7BAA7E7BBB4E68AA4EFBC8CE69C9FE997B4E7B3BBE7BB9FE5B086E69A82E5819CE69C8DE58AA1EFBC8CE8AFB7E68F90E5898DE5819AE5A5BDE58786E5A487E5B7A5E4BD9CE38082','0','admin','2025-12-11 14:53:58','',NULL,'系统维护通知'),
	(11,'新功能上线公告','2',X'E69CACE6ACA1E69BB4E696B0E696B0E5A29EE4BA86E4BBA5E4B88BE58A9FE883BDEFBC9A312E20E799BBE5BD95E7958CE99DA2E4BC98E58C96EFBC8CE694AFE68C81E8838CE699AFE6A8A1E7B38AE5928CE981AEE7BDA9E69588E69E9CEFBC9B322E20E983A8E997A8E7AEA1E79086E58A9FE883BDE5A29EE5BCBAEFBC9B332E20E9809AE79FA5E585ACE5918AE7B3BBE7BB9FE4BC98E58C96E38082E6ACA2E8BF8EE5A4A7E5AEB6E4BD93E9AA8CE696B0E58A9FE883BDEFBC81','0','admin','2025-12-11 14:53:58','',NULL,'功能更新'),
	(12,'安全提醒通知','1',X'E8AFB7E59084E4BD8DE794A8E688B7E6B3A8E6848FE8B4A6E58FB7E5AE89E585A8EFBC8CE5AE9AE69C9FE4BFAEE694B9E5AF86E7A081EFBC8CE4B88DE8A681E5B086E5AF86E7A081E5918AE79FA5E4BB96E4BABAE38082E5A682E58F91E78EB0E5BC82E5B8B8E799BBE5BD95EFBC8CE8AFB7E58F8AE697B6E88194E7B3BBE7AEA1E79086E59198E38082','0','admin','2025-12-11 14:53:58','',NULL,'安全提醒'),
	(13,'季度总结公告','2',X'E69CACE5ADA3E5BAA6E585ACE58FB8E4B89AE58AA1E58F91E5B195E889AFE5A5BDEFBC8CE59084E983A8E997A8E5B7A5E4BD9CE69C89E5BA8FE68EA8E8BF9BE38082E6849FE8B0A2E5A4A7E5AEB6E79A84E8BE9BE58BA4E4BB98E587BAEFBC8CE5B88CE69C9BE5A4A7E5AEB6E7BBA7E7BBADE4BF9DE68C81E889AFE5A5BDE79A84E5B7A5E4BD9CE78AB6E68081E38082','0','admin','2025-12-11 14:53:58','',NULL,'季度总结'),
	(14,'节假日安排通知','1',X'E6A0B9E68DAEE59BBDE5AEB6E6B395E5AE9AE88A82E58187E697A5E5AE89E68E92EFBC8CE58583E697A6E58187E69C9FE4B8BA31E69C8831E697A52D31E69C8833E697A5EFBC8CE585B133E5A4A9E38082E8AFB7E59084E983A8E997A8E68F90E5898DE5AE89E68E92E5A5BDE5B7A5E4BD9CEFBC8CE7A1AEE4BF9DE58187E69C9FE69C9FE997B4E7B3BBE7BB9FE6ADA3E5B8B8E8BF90E8A18CE38082','0','admin','2025-12-11 14:53:58','',NULL,'节假日通知'),
	(15,'培训计划公告','2',X'E585ACE58FB8E5B086E4BA8EE4B88BE69C88E7BB84E7BB87E68A80E69CAFE59FB9E8AEADEFBC8CE58685E5AEB9E58C85E68BACEFBC9AE5898DE7ABAFE5BC80E58F91E69C80E4BDB3E5AE9EE8B7B5E38081E5908EE7ABAFE69EB6E69E84E8AEBEE8AEA1E38081E695B0E68DAEE5BA93E4BC98E58C96E7AD89E38082E8AFB7E59084E983A8E997A8E68F90E5898DE68AA5E5908DE38082','0','admin','2025-12-11 14:53:58','',NULL,'培训通知'),
	(16,'系统性能优化通知','1',X'E7B3BBE7BB9FE5B7B2E5AE8CE68890E680A7E883BDE4BC98E58C96EFBC8CE5938DE5BA94E9809FE5BAA6E68F90E58D87333025E38082E5A682E59CA8E4BDBFE794A8E8BF87E7A88BE4B8ADE98187E588B0E4BBBBE4BD95E997AEE9A298EFBC8CE8AFB7E58F8AE697B6E58F8DE9A688E38082','0','admin','2025-12-11 14:53:58','',NULL,'性能优化'),
	(17,'数据备份提醒','1',X'E8AFB7E59084E983A8E997A8E5AE9AE69C9FE5A487E4BBBDE9878DE8A681E695B0E68DAEEFBC8CE5BBBAE8AEAEE6AF8FE591A8E8BF9BE8A18CE4B880E6ACA1E5AE8CE695B4E5A487E4BBBDE38082E695B0E68DAEE5AE89E585A8E698AFE585ACE58FB8E79A84E9878DE8A681E4BF9DE99A9CE38082','0','admin','2025-12-11 14:53:58','',NULL,'数据备份'),
	(18,'新员工入职公告','2',X'E6ACA2E8BF8EE696B0E5908CE4BA8BE58AA0E585A5E68891E4BBACE79A84E59BA2E9989FEFBC81E5B88CE69C9BE5A4A7E5AEB6E883BDE5A49FE5BFABE9809FE89E8DE585A5E59BA2E9989FEFBC8CE585B1E5908CE4B8BAE585ACE58FB8E58F91E5B195E8B4A1E78CAEE58A9BE9878FE38082','0','admin','2025-12-11 14:53:58','',NULL,'人事公告'),
	(19,'系统使用规范通知','1',X'E8AFB7E59084E4BD8DE794A8E688B7E981B5E5AE88E7B3BBE7BB9FE4BDBFE794A8E8A784E88C83EFBC8CE4B88DE5BE97E8BF9BE8A18CE99D9EE6B395E6938DE4BD9CE38082E5A682E58F91E78EB0E8BF9DE8A784E8A18CE4B8BAEFBC8CE5B086E68C89E785A7E585ACE58FB8E8A784E5AE9AE5A484E79086E38082','0','admin','2025-12-11 14:53:58','',NULL,'使用规范'),
	(20,'月度优秀员工公告','2',X'E7BB8FE8BF87E8AF84E98089EFBC8CE69CACE69C88E4BC98E7A780E59198E5B7A5E4B8BAEFBC9AE7A791E68A80E7A094E58F91E983A82DE5898DE7ABAFE5BC80E58F91E7BB84E38082E6849FE8B0A2E4BB96E4BBACE79A84E7AA81E587BAE8B4A1E78CAEEFBC8CE5B88CE69C9BE5A4A7E5AEB6E59091E4BB96E4BBACE5ADA6E4B9A0E38082','0','admin','2025-12-11 14:53:58','',NULL,'优秀员工'),
	(21,'系统维护完成通知','1',X'E7B3BBE7BB9FE7BBB4E68AA4E5B7B2E5AE8CE68890EFBC8CE68980E69C89E58A9FE883BDE5B7B2E681A2E5A48DE6ADA3E5B8B8E38082E6849FE8B0A2E5A4A7E5AEB6E79A84E88090E5BF83E7AD89E5BE85EFBC8CE5A682E69C89E997AEE9A298E8AFB7E58F8AE697B6E58F8DE9A688E38082','0','admin','2025-12-11 14:53:58','',NULL,'维护完成');

/*!40000 ALTER TABLE `sys_notice` ENABLE KEYS */;
UNLOCK TABLES;


# Dump of table sys_oper_log
# ------------------------------------------------------------

DROP TABLE IF EXISTS `sys_oper_log`;

CREATE TABLE `sys_oper_log` (
  `oper_id` bigint NOT NULL AUTO_INCREMENT COMMENT '日志主键',
  `title` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT '' COMMENT '模块标题',
  `business_type` int DEFAULT '0' COMMENT '业务类型（0其它 1新增 2修改 3删除）',
  `method` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT '' COMMENT '方法名称',
  `request_method` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT '' COMMENT '请求方式',
  `operator_type` int DEFAULT '0' COMMENT '操作类别（0其它 1后台用户 2手机端用户）',
  `oper_name` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT '' COMMENT '操作人员',
  `dept_name` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT '' COMMENT '部门名称',
  `oper_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT '' COMMENT '请求URL',
  `oper_ip` varchar(128) COLLATE utf8mb4_unicode_ci DEFAULT '' COMMENT '主机地址',
  `oper_location` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT '' COMMENT '操作地点',
  `oper_param` varchar(2000) COLLATE utf8mb4_unicode_ci DEFAULT '' COMMENT '请求参数',
  `json_result` varchar(2000) COLLATE utf8mb4_unicode_ci DEFAULT '' COMMENT '返回参数',
  `status` int DEFAULT '0' COMMENT '操作状态（0正常 1异常）',
  `error_msg` varchar(2000) COLLATE utf8mb4_unicode_ci DEFAULT '' COMMENT '错误消息',
  `oper_time` datetime DEFAULT NULL COMMENT '操作时间',
  `cost_time` bigint DEFAULT '0' COMMENT '消耗时间',
  PRIMARY KEY (`oper_id`),
  KEY `idx_sys_oper_log_bt` (`business_type`),
  KEY `idx_sys_oper_log_s` (`status`),
  KEY `idx_sys_oper_log_ot` (`oper_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='操作日志记录';

LOCK TABLES `sys_oper_log` WRITE;
/*!40000 ALTER TABLE `sys_oper_log` DISABLE KEYS */;

INSERT INTO `sys_oper_log` (`oper_id`, `title`, `business_type`, `method`, `request_method`, `operator_type`, `oper_name`, `dept_name`, `oper_url`, `oper_ip`, `oper_location`, `oper_param`, `json_result`, `status`, `error_msg`, `oper_time`, `cost_time`)
VALUES
	(100,'用户头像',2,'com.ruoyi.web.controller.system.SysProfileController.avatar()','POST',1,'admin','研发部门','/system/user/profile/avatar','127.0.0.1','内网IP','',NULL,1,'文件[logo.svg]后缀[svg]不正确，请上传[bmp, gif, jpg, jpeg, png]格式','2025-12-04 12:25:34',7),
	(101,'菜单管理',2,'com.ruoyi.web.controller.system.SysMenuController.edit()','PUT',1,'admin','研发部门','/system/menu','127.0.0.1','内网IP','{\"children\":[],\"createTime\":\"2025-12-01 04:31:33\",\"icon\":\"guide\",\"isCache\":\"0\",\"isFrame\":\"0\",\"menuId\":4,\"menuName\":\"官方网站\",\"menuType\":\"M\",\"orderNum\":4,\"params\":{},\"parentId\":0,\"path\":\"http://#\",\"perms\":\"\",\"query\":\"\",\"routeName\":\"\",\"status\":\"0\",\"updateBy\":\"admin\",\"visible\":\"0\"}','{\"msg\":\"操作成功\",\"code\":200}',0,NULL,'2025-12-04 12:38:50',52),
	(102,'用户头像',2,'com.ruoyi.web.controller.system.SysProfileController.avatar()','POST',1,'admin','研发部门','/system/user/profile/avatar','127.0.0.1','内网IP','','{\"msg\":\"操作成功\",\"imgUrl\":\"/profile/avatar/2025/12/04/1719b54114a44b779ee2d3655876dc7b.png\",\"code\":200}',0,NULL,'2025-12-04 14:08:37',306),
	(103,'个人信息',2,'com.ruoyi.web.controller.system.SysProfileController.updateProfile()','PUT',1,'admin','研发部门','/system/user/profile','127.0.0.1','内网IP','{\"admin\":false,\"email\":\"ry@163.com\",\"nickName\":\"Ruoyi Quick Starter Demo\",\"params\":{},\"phonenumber\":\"15888888888\",\"sex\":\"1\"}','{\"msg\":\"操作成功\",\"code\":200}',0,NULL,'2025-12-05 03:02:32',63),
	(104,'个人信息',2,'com.ruoyi.web.controller.system.SysProfileController.updateProfile()','PUT',1,'admin','研发部门','/system/user/profile','127.0.0.1','内网IP','{\"admin\":false,\"email\":\"ry@163.com\",\"nickName\":\"Quick Starter Demo\",\"params\":{},\"phonenumber\":\"15888888888\",\"sex\":\"1\"}','{\"msg\":\"操作成功\",\"code\":200}',0,NULL,'2025-12-05 03:02:46',56),
	(105,'用户头像',2,'com.ruoyi.web.controller.system.SysProfileController.avatar()','POST',1,'admin','研发部门','/system/user/profile/avatar','127.0.0.1','内网IP','','{\"msg\":\"操作成功\",\"imgUrl\":\"/profile/avatar/2025/12/05/c2cbd1fffa3f4bc793cee82887d4779f.png\",\"code\":200}',0,NULL,'2025-12-05 03:02:56',36),
	(106,'用户头像',2,'com.ruoyi.web.controller.system.SysProfileController.avatar()','POST',1,'admin','研发部门','/system/user/profile/avatar','127.0.0.1','内网IP','','{\"msg\":\"操作成功\",\"imgUrl\":\"/profile/avatar/2025/12/05/feb54b4582674b618f9467a4c22802ff.png\",\"code\":200}',0,NULL,'2025-12-05 03:03:17',21),
	(107,'用户头像',2,'com.ruoyi.web.controller.system.SysProfileController.avatar()','POST',1,'admin','研发部门','/system/user/profile/avatar','127.0.0.1','内网IP','','{\"msg\":\"操作成功\",\"imgUrl\":\"/profile/avatar/2025/12/10/a5671dbe610a427cbc99b0ed47aa010d.png\",\"code\":200}',0,NULL,'2025-12-10 09:13:41',140),
	(108,'参数管理',9,'com.ruoyi.web.controller.system.SysConfigController.refreshCache()','DELETE',1,'admin','研发部门','/system/config/refreshCache','127.0.0.1','内网IP','','{\"msg\":\"操作成功\",\"code\":200}',0,NULL,'2025-12-11 13:50:38',50),
	(109,'菜单管理',2,'com.ruoyi.web.controller.system.SysMenuController.edit()','PUT',1,'admin','研发部门','/system/menu','127.0.0.1','内网IP','{\"children\":[],\"createTime\":\"2025-12-01 04:31:33\",\"icon\":\"guide\",\"isCache\":\"0\",\"isFrame\":\"0\",\"menuId\":4,\"menuName\":\"官方网站\",\"menuType\":\"M\",\"orderNum\":4,\"params\":{},\"parentId\":0,\"path\":\"http://ai-quick.dev\",\"perms\":\"\",\"query\":\"\",\"routeName\":\"\",\"status\":\"0\",\"updateBy\":\"admin\",\"visible\":\"0\"}','{\"msg\":\"操作成功\",\"code\":200}',0,NULL,'2025-12-11 14:11:11',43),
	(110,'用户头像',2,'com.ruoyi.web.controller.system.SysProfileController.avatar()','POST',1,'admin','研发部门','/system/user/profile/avatar','127.0.0.1','内网IP','','{\"msg\":\"操作成功\",\"imgUrl\":\"/profile/avatar/2025/12/11/6f13ca471822454ea62b5748434574b7.png\",\"code\":200}',0,NULL,'2025-12-11 14:15:11',168),
	(111,'个人信息',2,'com.ruoyi.web.controller.system.SysProfileController.updateProfile()','PUT',1,'admin','研发部门','/system/user/profile','127.0.0.1','内网IP','{\"admin\":false,\"email\":\"ry@163.com\",\"nickName\":\"Quick Starter Demo\",\"params\":{},\"phonenumber\":\"15888888888\",\"sex\":\"1\"}','{\"msg\":\"操作成功\",\"code\":200}',0,NULL,'2025-12-11 14:16:15',42),
	(112,'个人信息',2,'com.ruoyi.web.controller.system.SysProfileController.updateProfile()','PUT',1,'admin','研发部门','/system/user/profile','127.0.0.1','内网IP','{\"admin\":false,\"email\":\"ry@163.com\",\"nickName\":\"Quick Starter\",\"params\":{},\"phonenumber\":\"15888888888\",\"sex\":\"1\"}','{\"msg\":\"操作成功\",\"code\":200}',0,NULL,'2025-12-11 14:18:19',63),
	(113,'个人信息',2,'com.ruoyi.web.controller.system.SysProfileController.updateProfile()','PUT',1,'admin','研发部门','/system/user/profile','127.0.0.1','内网IP','{\"admin\":false,\"email\":\"ai-quick@dev.com\",\"nickName\":\"Quick Starter\",\"params\":{},\"phonenumber\":\"15888888888\",\"sex\":\"1\"}','{\"msg\":\"操作成功\",\"code\":200}',0,NULL,'2025-12-11 14:18:35',52),
	(114,'个人信息',2,'com.ruoyi.web.controller.system.SysProfileController.updateProfile()','PUT',1,'admin','研发部门','/system/user/profile','127.0.0.1','内网IP','{\"admin\":false,\"email\":\"ai-quick@dev.com\",\"nickName\":\"Quick Demo\",\"params\":{},\"phonenumber\":\"15888888888\",\"sex\":\"1\"}','{\"msg\":\"操作成功\",\"code\":200}',0,NULL,'2025-12-11 14:19:03',43),
	(115,'部门管理',2,'com.ruoyi.web.controller.system.SysDeptController.edit()','PUT',1,'admin','研发部门','/system/dept','127.0.0.1','内网IP','{\"ancestors\":\"0,100,101\",\"children\":[],\"deptId\":103,\"deptName\":\"科技研发部\",\"email\":\"evan@ai-quick.dev\",\"leader\":\"Evan\",\"orderNum\":1,\"params\":{},\"parentId\":101,\"parentName\":\"深圳总公司\",\"phone\":\"15888888888\",\"status\":\"0\",\"updateBy\":\"admin\"}','{\"msg\":\"操作成功\",\"code\":200}',0,NULL,'2025-12-11 14:19:49',78),
	(116,'菜单管理',2,'com.ruoyi.web.controller.system.SysMenuController.edit()','PUT',1,'admin','科技研发部','/system/menu','127.0.0.1','内网IP','{\"children\":[],\"component\":\"system/role/index\",\"createTime\":\"2025-12-01 04:31:33\",\"icon\":\"switch-filled\",\"isCache\":\"0\",\"isFrame\":\"1\",\"menuId\":101,\"menuName\":\"角色管理\",\"menuType\":\"C\",\"orderNum\":2,\"params\":{},\"parentId\":1,\"path\":\"role\",\"perms\":\"system:role:list\",\"query\":\"\",\"routeName\":\"\",\"status\":\"0\",\"updateBy\":\"admin\",\"visible\":\"0\"}','{\"msg\":\"操作成功\",\"code\":200}',0,NULL,'2025-12-11 14:27:36',69),
	(117,'菜单管理',2,'com.ruoyi.web.controller.system.SysMenuController.edit()','PUT',1,'admin','科技研发部','/system/menu','127.0.0.1','内网IP','{\"children\":[],\"component\":\"system/config/index\",\"createTime\":\"2025-12-01 04:31:33\",\"icon\":\"set-up\",\"isCache\":\"0\",\"isFrame\":\"1\",\"menuId\":106,\"menuName\":\"参数设置\",\"menuType\":\"C\",\"orderNum\":7,\"params\":{},\"parentId\":1,\"path\":\"config\",\"perms\":\"system:config:list\",\"query\":\"\",\"routeName\":\"\",\"status\":\"0\",\"updateBy\":\"admin\",\"visible\":\"0\"}','{\"msg\":\"操作成功\",\"code\":200}',0,NULL,'2025-12-11 14:40:28',60),
	(118,'部门管理',2,'com.ruoyi.web.controller.system.SysDeptController.edit()','PUT',1,'admin','科技研发部','/system/dept','127.0.0.1','内网IP','{\"ancestors\":\"0\",\"children\":[],\"deptId\":100,\"deptName\":\"科技集团\",\"email\":\"ry@qq.com\",\"leader\":\"Evan\",\"orderNum\":0,\"params\":{},\"parentId\":0,\"phone\":\"15888888888\",\"status\":\"0\",\"updateBy\":\"admin\"}','{\"msg\":\"操作成功\",\"code\":200}',0,NULL,'2025-12-11 14:50:14',43),
	(119,'部门管理',2,'com.ruoyi.web.controller.system.SysDeptController.edit()','PUT',1,'admin','科技研发部','/system/dept','127.0.0.1','内网IP','{\"ancestors\":\"0,100\",\"children\":[],\"deptId\":101,\"deptName\":\"深圳总公司\",\"email\":\"ry@qq.com\",\"leader\":\"Evan\",\"orderNum\":1,\"params\":{},\"parentId\":100,\"parentName\":\"科技集团\",\"phone\":\"15888888888\",\"status\":\"0\",\"updateBy\":\"admin\"}','{\"msg\":\"操作成功\",\"code\":200}',0,NULL,'2025-12-11 14:50:22',71),
	(120,'部门管理',2,'com.ruoyi.web.controller.system.SysDeptController.edit()','PUT',1,'admin','科技研发部','/system/dept','127.0.0.1','内网IP','{\"ancestors\":\"0\",\"children\":[],\"deptId\":100,\"deptName\":\"科技集团\",\"email\":\"ry@qq.com\",\"leader\":\"Evan\",\"orderNum\":0,\"params\":{},\"parentId\":0,\"phone\":\"15888888888\",\"status\":\"0\",\"updateBy\":\"admin\"}','{\"msg\":\"操作成功\",\"code\":200}',0,NULL,'2025-12-11 14:50:25',27),
	(121,'部门管理',2,'com.ruoyi.web.controller.system.SysDeptController.edit()','PUT',1,'admin','科技研发部','/system/dept','127.0.0.1','内网IP','{\"ancestors\":\"0,100,101\",\"children\":[],\"deptId\":103,\"deptName\":\"科技研发部\",\"email\":\"evan@ai-quick.dev\",\"leader\":\"Evan\",\"orderNum\":1,\"params\":{},\"parentId\":101,\"parentName\":\"深圳总公司\",\"phone\":\"15888888888\",\"status\":\"0\",\"updateBy\":\"admin\"}','{\"msg\":\"操作成功\",\"code\":200}',0,NULL,'2025-12-11 14:50:28',40),
	(122,'部门管理',2,'com.ruoyi.web.controller.system.SysDeptController.edit()','PUT',1,'admin','科技研发部','/system/dept','127.0.0.1','内网IP','{\"ancestors\":\"0,100,101\",\"children\":[],\"deptId\":104,\"deptName\":\"市场部门\",\"email\":\"ry@qq.com\",\"leader\":\"Evan\",\"orderNum\":2,\"params\":{},\"parentId\":101,\"parentName\":\"深圳总公司\",\"phone\":\"15888888888\",\"status\":\"0\",\"updateBy\":\"admin\"}','{\"msg\":\"操作成功\",\"code\":200}',0,NULL,'2025-12-11 14:50:31',32),
	(123,'部门管理',2,'com.ruoyi.web.controller.system.SysDeptController.edit()','PUT',1,'admin','科技研发部','/system/dept','127.0.0.1','内网IP','{\"ancestors\":\"0,100,101\",\"children\":[],\"deptId\":105,\"deptName\":\"测试部门\",\"email\":\"ry@qq.com\",\"leader\":\"Evan\",\"orderNum\":3,\"params\":{},\"parentId\":101,\"parentName\":\"深圳总公司\",\"phone\":\"15888888888\",\"status\":\"0\",\"updateBy\":\"admin\"}','{\"msg\":\"操作成功\",\"code\":200}',0,NULL,'2025-12-11 14:50:35',32),
	(124,'部门管理',2,'com.ruoyi.web.controller.system.SysDeptController.edit()','PUT',1,'admin','科技研发部','/system/dept','127.0.0.1','内网IP','{\"ancestors\":\"0,100,101\",\"children\":[],\"deptId\":106,\"deptName\":\"财务部门\",\"email\":\"ry@qq.com\",\"leader\":\"Evan\",\"orderNum\":4,\"params\":{},\"parentId\":101,\"parentName\":\"深圳总公司\",\"phone\":\"15888888888\",\"status\":\"0\",\"updateBy\":\"admin\"}','{\"msg\":\"操作成功\",\"code\":200}',0,NULL,'2025-12-11 14:50:39',44);

/*!40000 ALTER TABLE `sys_oper_log` ENABLE KEYS */;
UNLOCK TABLES;


# Dump of table sys_post
# ------------------------------------------------------------

DROP TABLE IF EXISTS `sys_post`;

CREATE TABLE `sys_post` (
  `post_id` bigint NOT NULL AUTO_INCREMENT COMMENT '岗位ID',
  `post_code` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '岗位编码',
  `post_name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '岗位名称',
  `post_sort` int NOT NULL COMMENT '显示顺序',
  `status` char(1) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '状态（0正常 1停用）',
  `create_by` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT '' COMMENT '创建者',
  `create_time` datetime DEFAULT NULL COMMENT '创建时间',
  `update_by` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT '' COMMENT '更新者',
  `update_time` datetime DEFAULT NULL COMMENT '更新时间',
  `remark` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '备注',
  PRIMARY KEY (`post_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='岗位信息表';

LOCK TABLES `sys_post` WRITE;
/*!40000 ALTER TABLE `sys_post` DISABLE KEYS */;

INSERT INTO `sys_post` (`post_id`, `post_code`, `post_name`, `post_sort`, `status`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`)
VALUES
	(1,'ceo','董事长',1,'0','admin','2025-12-01 04:31:32','',NULL,''),
	(2,'se','项目经理',2,'0','admin','2025-12-01 04:31:32','',NULL,''),
	(3,'hr','人力资源',3,'0','admin','2025-12-01 04:31:32','',NULL,''),
	(4,'user','普通员工',4,'0','admin','2025-12-01 04:31:32','',NULL,'');

/*!40000 ALTER TABLE `sys_post` ENABLE KEYS */;
UNLOCK TABLES;


# Dump of table sys_role
# ------------------------------------------------------------

DROP TABLE IF EXISTS `sys_role`;

CREATE TABLE `sys_role` (
  `role_id` bigint NOT NULL AUTO_INCREMENT COMMENT '角色ID',
  `role_name` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '角色名称',
  `role_key` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '角色权限字符串',
  `role_sort` int NOT NULL COMMENT '显示顺序',
  `data_scope` char(1) COLLATE utf8mb4_unicode_ci DEFAULT '1' COMMENT '数据范围（1：全部数据权限 2：自定数据权限 3：本部门数据权限 4：本部门及以下数据权限）',
  `menu_check_strictly` tinyint(1) DEFAULT '1' COMMENT '菜单树选择项是否关联显示',
  `dept_check_strictly` tinyint(1) DEFAULT '1' COMMENT '部门树选择项是否关联显示',
  `status` char(1) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '角色状态（0正常 1停用）',
  `del_flag` char(1) COLLATE utf8mb4_unicode_ci DEFAULT '0' COMMENT '删除标志（0代表存在 2代表删除）',
  `create_by` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT '' COMMENT '创建者',
  `create_time` datetime DEFAULT NULL COMMENT '创建时间',
  `update_by` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT '' COMMENT '更新者',
  `update_time` datetime DEFAULT NULL COMMENT '更新时间',
  `remark` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '备注',
  PRIMARY KEY (`role_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='角色信息表';

LOCK TABLES `sys_role` WRITE;
/*!40000 ALTER TABLE `sys_role` DISABLE KEYS */;

INSERT INTO `sys_role` (`role_id`, `role_name`, `role_key`, `role_sort`, `data_scope`, `menu_check_strictly`, `dept_check_strictly`, `status`, `del_flag`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`)
VALUES
	(1,'超级管理员','admin',1,'1',1,1,'0','0','admin','2025-12-01 04:31:32','',NULL,'超级管理员'),
	(2,'普通角色','common',2,'2',1,1,'0','0','admin','2025-12-01 04:31:32','',NULL,'普通角色');

/*!40000 ALTER TABLE `sys_role` ENABLE KEYS */;
UNLOCK TABLES;


# Dump of table sys_role_dept
# ------------------------------------------------------------

DROP TABLE IF EXISTS `sys_role_dept`;

CREATE TABLE `sys_role_dept` (
  `role_id` bigint NOT NULL COMMENT '角色ID',
  `dept_id` bigint NOT NULL COMMENT '部门ID',
  PRIMARY KEY (`role_id`,`dept_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='角色和部门关联表';

LOCK TABLES `sys_role_dept` WRITE;
/*!40000 ALTER TABLE `sys_role_dept` DISABLE KEYS */;

INSERT INTO `sys_role_dept` (`role_id`, `dept_id`)
VALUES
	(2,100),
	(2,101),
	(2,105);

/*!40000 ALTER TABLE `sys_role_dept` ENABLE KEYS */;
UNLOCK TABLES;


# Dump of table sys_role_menu
# ------------------------------------------------------------

DROP TABLE IF EXISTS `sys_role_menu`;

CREATE TABLE `sys_role_menu` (
  `role_id` bigint NOT NULL COMMENT '角色ID',
  `menu_id` bigint NOT NULL COMMENT '菜单ID',
  PRIMARY KEY (`role_id`,`menu_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='角色和菜单关联表';

LOCK TABLES `sys_role_menu` WRITE;
/*!40000 ALTER TABLE `sys_role_menu` DISABLE KEYS */;

INSERT INTO `sys_role_menu` (`role_id`, `menu_id`)
VALUES
	(2,1),
	(2,2),
	(2,4),
	(2,100),
	(2,101),
	(2,102),
	(2,103),
	(2,104),
	(2,105),
	(2,106),
	(2,107),
	(2,108),
	(2,109),
	(2,110),
	(2,111),
	(2,112),
	(2,113),
	(2,114),
	(2,500),
	(2,501),
	(2,1000),
	(2,1001),
	(2,1002),
	(2,1003),
	(2,1004),
	(2,1005),
	(2,1006),
	(2,1007),
	(2,1008),
	(2,1009),
	(2,1010),
	(2,1011),
	(2,1012),
	(2,1013),
	(2,1014),
	(2,1015),
	(2,1016),
	(2,1017),
	(2,1018),
	(2,1019),
	(2,1020),
	(2,1021),
	(2,1022),
	(2,1023),
	(2,1024),
	(2,1025),
	(2,1026),
	(2,1027),
	(2,1028),
	(2,1029),
	(2,1030),
	(2,1031),
	(2,1032),
	(2,1033),
	(2,1034),
	(2,1035),
	(2,1036),
	(2,1037),
	(2,1038),
	(2,1039),
	(2,1040),
	(2,1041),
	(2,1042),
	(2,1043),
	(2,1044),
	(2,1045),
	(2,1046),
	(2,1047),
	(2,1048),
	(2,1049),
	(2,1050),
	(2,1051),
	(2,1052),
	(2,1053),
	(2,1054);

/*!40000 ALTER TABLE `sys_role_menu` ENABLE KEYS */;
UNLOCK TABLES;


# Dump of table sys_user
# ------------------------------------------------------------

DROP TABLE IF EXISTS `sys_user`;

CREATE TABLE `sys_user` (
  `user_id` bigint NOT NULL AUTO_INCREMENT COMMENT '用户ID',
  `dept_id` bigint DEFAULT NULL COMMENT '部门ID',
  `user_name` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '用户账号',
  `nick_name` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '用户昵称',
  `user_type` varchar(2) COLLATE utf8mb4_unicode_ci DEFAULT '00' COMMENT '用户类型（00系统用户）',
  `email` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT '' COMMENT '用户邮箱',
  `phonenumber` varchar(11) COLLATE utf8mb4_unicode_ci DEFAULT '' COMMENT '手机号码',
  `sex` char(1) COLLATE utf8mb4_unicode_ci DEFAULT '0' COMMENT '用户性别（0男 1女 2未知）',
  `avatar` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT '' COMMENT '头像地址',
  `password` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT '' COMMENT '密码',
  `status` char(1) COLLATE utf8mb4_unicode_ci DEFAULT '0' COMMENT '账号状态（0正常 1停用）',
  `del_flag` char(1) COLLATE utf8mb4_unicode_ci DEFAULT '0' COMMENT '删除标志（0代表存在 2代表删除）',
  `login_ip` varchar(128) COLLATE utf8mb4_unicode_ci DEFAULT '' COMMENT '最后登录IP',
  `login_date` datetime DEFAULT NULL COMMENT '最后登录时间',
  `pwd_update_date` datetime DEFAULT NULL COMMENT '密码最后更新时间',
  `create_by` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT '' COMMENT '创建者',
  `create_time` datetime DEFAULT NULL COMMENT '创建时间',
  `update_by` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT '' COMMENT '更新者',
  `update_time` datetime DEFAULT NULL COMMENT '更新时间',
  `remark` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '备注',
  PRIMARY KEY (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户信息表';

LOCK TABLES `sys_user` WRITE;
/*!40000 ALTER TABLE `sys_user` DISABLE KEYS */;

INSERT INTO `sys_user` (`user_id`, `dept_id`, `user_name`, `nick_name`, `user_type`, `email`, `phonenumber`, `sex`, `avatar`, `password`, `status`, `del_flag`, `login_ip`, `login_date`, `pwd_update_date`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`)
VALUES
	(1,103,'admin','Quick Demo','00','ai-quick@dev.com','15888888888','1','/profile/avatar/2025/12/11/6f13ca471822454ea62b5748434574b7.png','$2a$10$7JB720yubVSZvUI0rEqK/.VqGOZTH.ulu33dHOiBE8ByOhJIrdAu2','0','0','127.0.0.1','2025-12-11 22:43:26','2025-12-01 04:31:32','admin','2025-12-01 04:31:32','','2025-12-11 14:19:03','管理员'),
	(2,105,'test','test','00','ai-quick@dev.com','15666666666','1','','$2a$10$7JB720yubVSZvUI0rEqK/.VqGOZTH.ulu33dHOiBE8ByOhJIrdAu2','0','0','127.0.0.1','2025-12-01 04:31:32','2025-12-01 04:31:32','admin','2025-12-01 04:31:32','',NULL,'测试员'),
	(100,228,'zhangsan','张三','00','zhangsan@ai-quick.dev','13800001001','0','','$2a$10$7JB720yubVSZvUI0rEqK/.VqGOZTH.ulu33dHOiBE8ByOhJIrdAu2','0','0','',NULL,NULL,'admin','2025-12-11 14:55:43','',NULL,'前端开发工程师'),
	(101,229,'lisi','李四','00','lisi@ai-quick.dev','13800001002','0','','$2a$10$7JB720yubVSZvUI0rEqK/.VqGOZTH.ulu33dHOiBE8ByOhJIrdAu2','0','0','',NULL,NULL,'admin','2025-12-11 14:55:43','',NULL,'后端开发工程师'),
	(102,230,'wangwu','王五','00','wangwu@ai-quick.dev','13800001003','0','','$2a$10$7JB720yubVSZvUI0rEqK/.VqGOZTH.ulu33dHOiBE8ByOhJIrdAu2','0','0','',NULL,NULL,'admin','2025-12-11 14:55:43','',NULL,'移动端开发工程师'),
	(103,231,'zhaoliu','赵六','00','zhaoliu@ai-quick.dev','13800001004','0','','$2a$10$7JB720yubVSZvUI0rEqK/.VqGOZTH.ulu33dHOiBE8ByOhJIrdAu2','0','0','',NULL,NULL,'admin','2025-12-11 14:55:43','',NULL,'AI算法工程师'),
	(104,232,'sunqi','孙七','00','sunqi@ai-quick.dev','13800001005','1','','$2a$10$7JB720yubVSZvUI0rEqK/.VqGOZTH.ulu33dHOiBE8ByOhJIrdAu2','0','0','',NULL,NULL,'admin','2025-12-11 14:55:43','',NULL,'市场推广专员'),
	(105,233,'zhouba','周八','00','zhouba@ai-quick.dev','13800001006','0','','$2a$10$7JB720yubVSZvUI0rEqK/.VqGOZTH.ulu33dHOiBE8ByOhJIrdAu2','0','0','',NULL,NULL,'admin','2025-12-11 14:55:43','',NULL,'商务拓展经理'),
	(106,234,'wujiu','吴九','00','wujiu@ai-quick.dev','13800001007','0','','$2a$10$7JB720yubVSZvUI0rEqK/.VqGOZTH.ulu33dHOiBE8ByOhJIrdAu2','0','0','',NULL,NULL,'admin','2025-12-11 14:55:43','',NULL,'功能测试工程师'),
	(107,235,'zhengshi','郑十','00','zhengshi@ai-quick.dev','13800001008','1','','$2a$10$7JB720yubVSZvUI0rEqK/.VqGOZTH.ulu33dHOiBE8ByOhJIrdAu2','0','0','',NULL,NULL,'admin','2025-12-11 14:55:43','',NULL,'性能测试工程师'),
	(108,236,'wangshiyi','王十一','00','wangshiyi@ai-quick.dev','13800001009','0','','$2a$10$7JB720yubVSZvUI0rEqK/.VqGOZTH.ulu33dHOiBE8ByOhJIrdAu2','0','0','',NULL,NULL,'admin','2025-12-11 14:55:43','',NULL,'自动化测试工程师'),
	(109,237,'lixiaoli','李小丽','00','lixiaoli@ai-quick.dev','13800001010','1','','$2a$10$7JB720yubVSZvUI0rEqK/.VqGOZTH.ulu33dHOiBE8ByOhJIrdAu2','0','0','',NULL,NULL,'admin','2025-12-11 14:55:43','',NULL,'系统运维工程师'),
	(110,238,'zhangming','张明','00','zhangming@ai-quick.dev','13800001011','0','','$2a$10$7JB720yubVSZvUI0rEqK/.VqGOZTH.ulu33dHOiBE8ByOhJIrdAu2','0','0','',NULL,NULL,'admin','2025-12-11 14:55:43','',NULL,'网络运维工程师'),
	(111,239,'liufang','刘芳','00','liufang@ai-quick.dev','13800001012','1','','$2a$10$7JB720yubVSZvUI0rEqK/.VqGOZTH.ulu33dHOiBE8ByOhJIrdAu2','0','0','',NULL,NULL,'admin','2025-12-11 14:55:43','',NULL,'安全运维工程师'),
	(112,225,'chenwei','陈伟','00','chenwei@ai-quick.dev','13800001013','0','','$2a$10$7JB720yubVSZvUI0rEqK/.VqGOZTH.ulu33dHOiBE8ByOhJIrdAu2','0','0','',NULL,NULL,'admin','2025-12-11 14:55:43','',NULL,'产品经理'),
	(113,226,'yangli','杨丽','00','yangli@ai-quick.dev','13800001014','1','','$2a$10$7JB720yubVSZvUI0rEqK/.VqGOZTH.ulu33dHOiBE8ByOhJIrdAu2','0','0','',NULL,NULL,'admin','2025-12-11 14:55:43','',NULL,'人事专员'),
	(114,227,'huangqiang','黄强','00','huangqiang@ai-quick.dev','13800001015','0','','$2a$10$7JB720yubVSZvUI0rEqK/.VqGOZTH.ulu33dHOiBE8ByOhJIrdAu2','0','0','',NULL,NULL,'admin','2025-12-11 14:55:43','',NULL,'法务专员'),
	(115,106,'qianjing','钱静','00','qianjing@ai-quick.dev','13800001016','1','','$2a$10$7JB720yubVSZvUI0rEqK/.VqGOZTH.ulu33dHOiBE8ByOhJIrdAu2','0','0','',NULL,NULL,'admin','2025-12-11 14:55:43','',NULL,'财务专员'),
	(116,242,'sunlei','孙磊','00','sunlei@ai-quick.dev','13800001017','0','','$2a$10$7JB720yubVSZvUI0rEqK/.VqGOZTH.ulu33dHOiBE8ByOhJIrdAu2','0','0','',NULL,NULL,'admin','2025-12-11 14:55:43','',NULL,'北京技术部工程师'),
	(117,243,'zhoumei','周梅','00','zhoumei@ai-quick.dev','13800001018','1','','$2a$10$7JB720yubVSZvUI0rEqK/.VqGOZTH.ulu33dHOiBE8ByOhJIrdAu2','0','0','',NULL,NULL,'admin','2025-12-11 14:55:43','',NULL,'北京市场部专员'),
	(118,244,'wuxin','吴欣','00','wuxin@ai-quick.dev','13800001019','0','','$2a$10$7JB720yubVSZvUI0rEqK/.VqGOZTH.ulu33dHOiBE8ByOhJIrdAu2','0','0','',NULL,NULL,'admin','2025-12-11 14:55:43','',NULL,'北京销售部经理'),
	(119,246,'xujing','徐静','00','xujing@ai-quick.dev','13800001020','1','','$2a$10$7JB720yubVSZvUI0rEqK/.VqGOZTH.ulu33dHOiBE8ByOhJIrdAu2','0','0','',NULL,NULL,'admin','2025-12-11 14:55:43','',NULL,'上海技术部工程师'),
	(120,247,'maohui','毛慧','00','maohui@ai-quick.dev','13800001021','1','','$2a$10$7JB720yubVSZvUI0rEqK/.VqGOZTH.ulu33dHOiBE8ByOhJIrdAu2','0','0','',NULL,NULL,'admin','2025-12-11 14:55:43','',NULL,'上海市场部专员'),
	(121,240,'liuyang','刘洋','00','liuyang@ai-quick.dev','13800001022','0','','$2a$10$7JB720yubVSZvUI0rEqK/.VqGOZTH.ulu33dHOiBE8ByOhJIrdAu2','0','0','',NULL,NULL,'admin','2025-12-11 14:55:43','',NULL,'长沙技术部工程师'),
	(122,241,'zhaoyan','赵燕','00','zhaoyan@ai-quick.dev','13800001023','1','','$2a$10$7JB720yubVSZvUI0rEqK/.VqGOZTH.ulu33dHOiBE8ByOhJIrdAu2','0','0','',NULL,NULL,'admin','2025-12-11 14:55:43','',NULL,'长沙运营部专员');

/*!40000 ALTER TABLE `sys_user` ENABLE KEYS */;
UNLOCK TABLES;


# Dump of table sys_user_post
# ------------------------------------------------------------

DROP TABLE IF EXISTS `sys_user_post`;

CREATE TABLE `sys_user_post` (
  `user_id` bigint NOT NULL COMMENT '用户ID',
  `post_id` bigint NOT NULL COMMENT '岗位ID',
  PRIMARY KEY (`user_id`,`post_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户与岗位关联表';

LOCK TABLES `sys_user_post` WRITE;
/*!40000 ALTER TABLE `sys_user_post` DISABLE KEYS */;

INSERT INTO `sys_user_post` (`user_id`, `post_id`)
VALUES
	(1,1),
	(2,2),
	(100,4),
	(101,4),
	(102,4),
	(103,4),
	(104,4),
	(105,2),
	(106,4),
	(107,4),
	(108,4),
	(109,4),
	(110,4),
	(111,4),
	(112,2),
	(113,3),
	(114,4),
	(115,4),
	(116,4),
	(117,4),
	(118,2),
	(119,4),
	(120,4),
	(121,4),
	(122,4);

/*!40000 ALTER TABLE `sys_user_post` ENABLE KEYS */;
UNLOCK TABLES;


# Dump of table sys_user_role
# ------------------------------------------------------------

DROP TABLE IF EXISTS `sys_user_role`;

CREATE TABLE `sys_user_role` (
  `user_id` bigint NOT NULL COMMENT '用户ID',
  `role_id` bigint NOT NULL COMMENT '角色ID',
  PRIMARY KEY (`user_id`,`role_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户和角色关联表';

LOCK TABLES `sys_user_role` WRITE;
/*!40000 ALTER TABLE `sys_user_role` DISABLE KEYS */;

INSERT INTO `sys_user_role` (`user_id`, `role_id`)
VALUES
	(1,1),
	(2,2),
	(100,2),
	(101,2),
	(102,2),
	(103,2),
	(104,2),
	(105,2),
	(106,2),
	(107,2),
	(108,2),
	(109,2),
	(110,2),
	(111,2),
	(112,2),
	(113,2),
	(114,2),
	(115,2),
	(116,2),
	(117,2),
	(118,2),
	(119,2),
	(120,2),
	(121,2),
	(122,2);

/*!40000 ALTER TABLE `sys_user_role` ENABLE KEYS */;
UNLOCK TABLES;



/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
