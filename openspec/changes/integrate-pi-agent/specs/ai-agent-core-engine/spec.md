## ADDED Requirements

### Requirement: System Tool Bus read-only tools

The platform SHALL expose authenticated read-only tool endpoints under `/ai/agent/tools/**` for users, config, notices, and jobs, enforcing the same permission keys as the corresponding business APIs.

#### Scenario: List users via tool bus

- **WHEN** an authenticated caller with `system:user:list` requests `GET /ai/agent/tools/users`
- **THEN** the system returns a paged user list without password fields

### Requirement: Sidecar binds user JWT for tools

When creating or prompting a session, the gateway SHALL forward the caller's access token to the sidecar so system tools can call the Tool Bus as that user.

#### Scenario: Tool call uses caller permissions

- **WHEN** the agent invokes `sys_list_users` during a session
- **THEN** the sidecar calls the Tool Bus with the bound Bearer token and the call succeeds or fails according to that user's permissions

### Requirement: Global Agent Shell

The management UI SHALL provide a global Agent Shell reachable from the navbar and via Ctrl/Cmd+K, embedding the agent workbench without leaving the current page.

#### Scenario: Open shell shortcut

- **WHEN** a logged-in user presses Ctrl/Cmd+K
- **THEN** the Agent Shell drawer toggles open or closed
