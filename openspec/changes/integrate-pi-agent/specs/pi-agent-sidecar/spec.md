## ADDED Requirements

### Requirement: Sidecar binds localhost only

The Pi Agent sidecar SHALL listen only on `127.0.0.1` and SHALL NOT be exposed as a public ingress.

#### Scenario: Health check on loopback

- **WHEN** a client requests `GET /v1/health` on the configured loopback port
- **THEN** the sidecar returns HTTP 200 with a JSON body indicating healthy status

### Requirement: Session workspace sandbox

Each session SHALL use a dedicated workspace directory under `data/ai-workspaces/{userId}/{sessionId}/`, and tool execution cwd SHALL be restricted to that directory.

#### Scenario: Create session creates workspace

- **WHEN** `POST /v1/sessions` is called with a `userId`
- **THEN** the sidecar creates a session id, ensures the sandbox directory exists, and returns the session id

### Requirement: Read-only tools only

The sidecar SHALL enable only read-oriented tools (`read`, `grep`, `find`, `ls` or SDK equivalents) and SHALL NOT enable `bash`, `write`, or `edit` in the MVP.

#### Scenario: Prompt can use read tools

- **WHEN** a prompt requires inspecting a file inside the sandbox
- **THEN** the agent MAY emit tool events for allowed read tools and SHALL NOT invoke disabled write/execute tools

### Requirement: Prompt streams agent events

`POST /v1/sessions/:id/prompt` SHALL stream Server-Sent Events representing Pi `AgentSessionEvent` updates (at least text deltas, tool lifecycle, and errors).

#### Scenario: Text delta streaming

- **WHEN** the model produces assistant text
- **THEN** the client receives SSE events containing text delta payloads until the turn completes
