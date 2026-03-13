# ruoyi-ai-quick-starter Development Patterns

> Auto-generated skill from repository analysis

## Overview

This skill teaches development patterns for ruoyi-ai-quick-starter, a Java-based enterprise application framework with React frontend. The codebase follows conventional commit patterns and emphasizes modular architecture with separate backend services and frontend components. Key focus areas include version management, database schema evolution, frontend quality, backend reliability, and security hardening.

## Coding Conventions

### File Naming
- Use camelCase for file naming: `userService.java`, `loginController.js`
- SQL files use kebab-case: `ry-demo-postgresql.sql`
- Component files follow PascalCase: `UserManagement.jsx`

### Import Style
```java
// Java - use alias imports
import com.ruoyi.common.core.domain.AjaxResult as Result;
import com.ruoyi.system.service.ISysUserService as UserService;
```

```javascript
// React - named exports preferred
import { useState, useEffect } from 'react';
import { Button, Form, Input } from 'antd';
```

### Commit Conventions
- Use conventional commit prefixes: `feat:`, `fix:`, `chore:`, `docs:`, `style:`, `refactor:`
- Keep commit messages around 56 characters
- Examples: `feat: add user management API`, `fix: resolve NPE in user service`

## Workflows

### Version Release Management
**Trigger:** When preparing a new version release  
**Command:** `/release-version`

1. Update version numbers in all pom.xml files (parent, ruoyi-admin, ruoyi-framework, ruoyi-quartz, ruoyi-system)
2. Update CHANGELOG.md with version details and release notes
3. Update package.json versions for frontend dependencies
4. Update documentation files with version-specific information
5. Commit with message: `chore: release version x.x.x`

```xml
<!-- Example pom.xml version update -->
<version>4.7.8</version>
```

### SQL Schema Management
**Trigger:** When updating database schema or optimizing SQL performance  
**Command:** `/update-schema`

1. Update PostgreSQL schema files in the sql/ directory
2. Add or modify indexes for performance optimization
3. Update data types and constraints as needed
4. Merge or split SQL files for better organization
5. Test schema changes against existing data

```sql
-- Example schema update
ALTER TABLE sys_user ADD COLUMN last_login_ip VARCHAR(50);
CREATE INDEX idx_user_last_login ON sys_user(last_login_time);
```

### Frontend Quality Fixes
**Trigger:** When addressing frontend code quality issues or security vulnerabilities  
**Command:** `/fix-frontend-quality`

1. Refactor large components into smaller, reusable ones
2. Fix React hooks and state management issues
3. Add proper input validation and sanitization
4. Update component styling for consistency
5. Remove unused imports and variables

```jsx
// Example component refactoring
const UserForm = ({ user, onSubmit }) => {
  const [formData, setFormData] = useState(user || {});
  
  const handleSubmit = useCallback((values) => {
    // Validation logic here
    onSubmit(sanitizeInput(values));
  }, [onSubmit]);
  
  return <Form onFinish={handleSubmit}>...</Form>;
};
```

### Backend Service Fixes
**Trigger:** When addressing backend code quality and reliability issues  
**Command:** `/fix-backend-services`

1. Add null pointer exception checks in service methods
2. Update transaction annotations for proper rollback handling
3. Fix service implementation logic and error handling
4. Update controller validation and response handling
5. Optimize MyBatis mapper queries

```java
// Example service method with NPE prevention
@Transactional(rollbackFor = Exception.class)
public int updateUser(SysUser user) {
    if (user == null || user.getUserId() == null) {
        throw new ServiceException("用户信息不能为空");
    }
    return userMapper.updateUser(user);
}
```

### Security Hardening
**Trigger:** When addressing security vulnerabilities or hardening the application  
**Command:** `/harden-security`

1. Externalize credentials from configuration files to environment variables
2. Add comprehensive input validation and sanitization
3. Update security configurations for authentication and authorization
4. Fix potential security vulnerabilities in web services
5. Implement proper session management

```yaml
# Example externalized config
spring:
  datasource:
    username: ${DB_USERNAME:#{null}}
    password: ${DB_PASSWORD:#{null}}
```

### Dependency Upgrades
**Trigger:** When upgrading libraries or frameworks to newer versions  
**Command:** `/upgrade-deps`

1. Update dependency versions in package.json and pom.xml files
2. Update lock files (pnpm-lock.yaml)
3. Update version documentation (VERSIONS.md)
4. Test compatibility with existing code
5. Address any breaking changes or deprecation warnings

### UI Styling Improvements
**Trigger:** When improving visual design and user experience  
**Command:** `/improve-styling`

1. Update component SCSS files for better visual consistency
2. Refine CSS variables and theming system
3. Improve responsive design for mobile compatibility
4. Enhance layout consistency across components
5. Optimize CSS for performance

```scss
// Example styling improvement
.user-management {
  &__header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 16px;
  }
  
  &__table {
    .ant-table-tbody > tr:hover > td {
      background-color: var(--primary-color-light);
    }
  }
}
```

## Testing Patterns

Tests are written using Jest framework with the following patterns:
- Test files follow `*.test.ts` pattern
- Unit tests focus on service layer logic
- Integration tests cover API endpoints
- Frontend tests use React Testing Library

```javascript
// Example test structure
describe('UserService', () => {
  test('should create user successfully', async () => {
    const userData = { username: 'test', email: 'test@example.com' };
    const result = await userService.createUser(userData);
    expect(result.success).toBe(true);
  });
});
```

## Commands

| Command | Purpose | Frequency |
|---------|---------|-----------|
| `/release-version` | Manage version releases across all modules | ~3x/month |
| `/update-schema` | Update PostgreSQL database schemas | ~4x/month |
| `/fix-frontend-quality` | Improve React component quality and security | ~2x/month |
| `/fix-backend-services` | Fix Java service layer issues and reliability | ~2x/month |
| `/harden-security` | Implement security improvements | ~2x/month |
| `/upgrade-deps` | Update project dependencies | ~3x/month |
| `/improve-styling` | Enhance UI styling and consistency | ~4x/month |