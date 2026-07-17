## ADDED Requirements

### Requirement: Authenticated agent API

All `/ai/agent/**` endpoints SHALL require an authenticated login user before proxying to the sidecar.

#### Scenario: Unauthenticated request rejected

- **WHEN** a client calls `/ai/agent/sessions` without a valid JWT
- **THEN** the gateway rejects the request and does not call the sidecar

### Requirement: Inject user identity into sidecar

When creating sessions or prompting, the gateway SHALL inject the current user's id into the sidecar request and SHALL NOT trust a client-supplied user id for ownership.

#### Scenario: Session owned by login user

- **WHEN** an authenticated user creates a session
- **THEN** the gateway stores session metadata with that user's id in `ai_session_context`

### Requirement: SSE proxy

Prompt responses SHALL be proxied as `text/event-stream` from the sidecar to the browser without buffering the full turn.

#### Scenario: Sidecar unavailable

- **WHEN** the sidecar is unreachable
- **THEN** the gateway returns a clear failure (HTTP 503 or equivalent error payload) to the client

### Requirement: Menu and permission

The product menu SHALL expose an AI Agent entry with permission `ai:agent:view` pointing to component `ai/agent/index`.

#### Scenario: Authorized menu access

- **WHEN** a role has `ai:agent:view`
- **THEN** the user can open the Agent workbench route
