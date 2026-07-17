## ADDED Requirements

### Requirement: Agent workbench UI

The management UI SHALL provide an Agent workbench that can create a session, send prompts, stream responses, and abort an in-flight turn.

#### Scenario: Streamed assistant reply

- **WHEN** the user sends a prompt
- **THEN** the UI appends streaming assistant text as SSE events arrive

### Requirement: Tool event visibility

The workbench SHALL render tool call events (name, args summary, result summary) in the conversation timeline.

#### Scenario: Read tool shown

- **WHEN** the agent invokes an allowed read tool
- **THEN** the UI shows a tool card for that invocation

### Requirement: Abort support

The user SHALL be able to abort the current streaming turn.

#### Scenario: Stop button

- **WHEN** the user clicks stop during streaming
- **THEN** the client cancels the SSE request and the UI exits loading state
