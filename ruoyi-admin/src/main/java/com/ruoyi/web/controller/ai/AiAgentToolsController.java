package com.ruoyi.web.controller.ai;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import com.ruoyi.common.annotation.Log;
import com.ruoyi.common.core.controller.BaseController;
import com.ruoyi.common.core.domain.AjaxResult;
import com.ruoyi.common.core.domain.entity.SysUser;
import com.ruoyi.common.core.page.TableDataInfo;
import com.ruoyi.common.enums.BusinessType;
import com.ruoyi.common.utils.SecurityUtils;
import com.ruoyi.common.utils.ServletUtils;
import com.ruoyi.common.utils.StringUtils;
import com.ruoyi.quartz.domain.SysJob;
import com.ruoyi.quartz.service.ISysJobService;
import com.ruoyi.system.domain.SysConfig;
import com.ruoyi.system.domain.SysNotice;
import com.ruoyi.system.service.IAiAgentAuditLogService;
import com.ruoyi.system.service.ISysConfigService;
import com.ruoyi.system.service.ISysNoticeService;
import com.ruoyi.system.service.ISysUserService;
import jakarta.servlet.http.HttpServletRequest;

/**
 * AI Agent System Tool Bus（只读）
 * <p>
 * 由 Pi 侧车使用用户 JWT 回调调用，执行权限与原业务接口一致。
 *
 * @author evan
 */
@RestController
@RequestMapping("/ai/agent/tools")
public class AiAgentToolsController extends BaseController
{
    @Autowired
    private ISysUserService userService;

    @Autowired
    private ISysConfigService configService;

    @Autowired
    private ISysNoticeService noticeService;

    @Autowired
    private ISysJobService jobService;

    @Autowired
    private IAiAgentAuditLogService aiAgentAuditLogService;

    @PreAuthorize("@ss.hasPermi('system:user:list')")
    @Log(title = "AI Agent Tool", businessType = BusinessType.OTHER)
    @GetMapping("/users")
    public TableDataInfo users(
        @RequestParam(value = "userName", required = false) String userName,
        @RequestParam(value = "phonenumber", required = false) String phonenumber,
        @RequestParam(value = "status", required = false) String status)
    {
        return withAudit("sys_list_users", () -> {
            SecurityUtils.getLoginUser();
            SysUser query = new SysUser();
            query.setUserName(userName);
            query.setPhonenumber(phonenumber);
            query.setStatus(status);
            startPage();
            List<SysUser> list = userService.selectUserList(query);
            List<Map<String, Object>> rows = list.stream().map(this::slimUser).collect(Collectors.toList());
            TableDataInfo data = getDataTable(list);
            data.setRows(rows);
            return data;
        });
    }

    @PreAuthorize("@ss.hasPermi('system:config:list')")
    @Log(title = "AI Agent Tool", businessType = BusinessType.OTHER)
    @GetMapping("/config/{configKey}")
    public AjaxResult config(@PathVariable("configKey") String configKey)
    {
        return withAudit("sys_get_config", () -> {
            SecurityUtils.getLoginUser();
            if (StringUtils.isEmpty(configKey))
            {
                return error("configKey 不能为空");
            }
            String value = configService.selectConfigByKey(configKey);
            Map<String, Object> body = new HashMap<>();
            body.put("configKey", configKey);
            body.put("configValue", value);
            return success(body);
        });
    }

    @PreAuthorize("@ss.hasPermi('system:config:list')")
    @GetMapping("/configs")
    public TableDataInfo configs(@RequestParam(value = "configKey", required = false) String configKey,
        @RequestParam(value = "configName", required = false) String configName)
    {
        return withAudit("sys_list_configs", () -> {
            SecurityUtils.getLoginUser();
            SysConfig query = new SysConfig();
            query.setConfigKey(configKey);
            query.setConfigName(configName);
            startPage();
            List<SysConfig> list = configService.selectConfigList(query);
            return getDataTable(list);
        });
    }

    @PreAuthorize("@ss.hasPermi('system:notice:list')")
    @Log(title = "AI Agent Tool", businessType = BusinessType.OTHER)
    @GetMapping("/notices")
    public TableDataInfo notices(@RequestParam(value = "noticeTitle", required = false) String noticeTitle)
    {
        return withAudit("sys_list_notices", () -> {
            SecurityUtils.getLoginUser();
            SysNotice query = new SysNotice();
            query.setNoticeTitle(noticeTitle);
            startPage();
            List<SysNotice> list = noticeService.selectNoticeList(query);
            return getDataTable(list);
        });
    }

    @PreAuthorize("@ss.hasPermi('monitor:job:list')")
    @Log(title = "AI Agent Tool", businessType = BusinessType.OTHER)
    @GetMapping("/jobs")
    public TableDataInfo jobs(
        @RequestParam(value = "jobName", required = false) String jobName,
        @RequestParam(value = "status", required = false) String status)
    {
        return withAudit("sys_list_jobs", () -> {
            SecurityUtils.getLoginUser();
            SysJob query = new SysJob();
            query.setJobName(jobName);
            query.setStatus(status);
            startPage();
            List<SysJob> list = jobService.selectJobList(query);
            return getDataTable(list);
        });
    }

    private <T> T withAudit(String toolName, java.util.concurrent.Callable<T> action)
    {
        long start = System.currentTimeMillis();
        String status = "ok";
        String detail = null;
        try
        {
            return action.call();
        }
        catch (RuntimeException e)
        {
            status = "error";
            detail = e.getMessage();
            throw e;
        }
        catch (Exception e)
        {
            status = "error";
            detail = e.getMessage();
            throw new RuntimeException(e);
        }
        finally
        {
            int duration = (int) Math.min(Integer.MAX_VALUE, System.currentTimeMillis() - start);
            Long userId = null;
            try
            {
                userId = SecurityUtils.getUserId();
            }
            catch (Exception ignored)
            {
                // ignore
            }
            aiAgentAuditLogService.record(resolveCorrelationId(), userId, null, toolName, status, duration, detail);
        }
    }

    private String resolveCorrelationId()
    {
        try
        {
            HttpServletRequest request = ServletUtils.getRequest();
            if (request == null)
            {
                return null;
            }
            return request.getHeader("X-Correlation-Id");
        }
        catch (Exception e)
        {
            return null;
        }
    }

    private Map<String, Object> slimUser(SysUser user)
    {
        Map<String, Object> row = new HashMap<>();
        row.put("userId", user.getUserId());
        row.put("userName", user.getUserName());
        row.put("nickName", user.getNickName());
        row.put("phonenumber", user.getPhonenumber());
        row.put("email", user.getEmail());
        row.put("status", user.getStatus());
        row.put("deptId", user.getDeptId());
        if (user.getDept() != null)
        {
            row.put("deptName", user.getDept().getDeptName());
        }
        return row;
    }
}
