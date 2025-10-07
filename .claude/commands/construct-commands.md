# Comandos Slash Personalizados para Plane.SO
# Guardar este archivo en .claude/commands/

## /implement-feature
Implement a complete feature for Plane.SO following our established patterns and architecture.

**Arguments**: Feature description and requirements

**Process**:
1. Use plane-fullstack-architect to analyze requirements and create implementation plan
2. Use plane-database-architect to design any needed Django model changes
3. Use plane-ui-specialist to create React components with proper accessibility and real-time features
4. Use test-specialist to write comprehensive tests including collaboration scenarios
5. Generate complete implementation with API documentation

**Example**: `/implement-feature Issue bulk operations with optimistic updates and real-time sync`

---

## /review-code
Perform a comprehensive code review focusing on Plane.SO standards.

**Arguments**: File paths or commit hash to review

**Process**:
1. Use plane-fullstack-architect to review architectural patterns
2. Use test-specialist to verify test coverage including real-time scenarios
3. Use plane-ui-specialist to check component patterns, accessibility, and collaboration features
4. Check for workspace-based security patterns and permission isolation
5. Verify project management domain logic correctness

**Example**: `/review-code web/components/issues/issue-board-view.tsx`

---

## /debug-issue
Debug and fix issues in Plane.SO codebase with systematic approach.

**Arguments**: Issue description, error messages, or reproduction steps

**Process**:
1. Use test-specialist to create reproduction test case
2. Use appropriate specialist (plane-database-architect, plane-ui-specialist, etc.) based on error type
3. Use plane-fullstack-architect to assess system-wide impact on collaborative features
4. Implement fix with proper testing including real-time scenarios
5. Verify fix doesn't break existing functionality or workspace isolation

**Example**: `/debug-issue Issue drag-and-drop not working in kanban board with WebSocket updates`

---

## /optimize-performance
Analyze and optimize performance bottlenecks in the project management platform.

**Arguments**: Specific area to optimize (database, frontend, real-time features, etc.)

**Process**:
1. Use plane-database-architect to analyze Django ORM query performance
2. Use plane-ui-specialist to check React component rendering and virtual scrolling
3. Use plane-fullstack-architect to review API performance and caching strategies
4. Implement optimizations with before/after metrics for large workspaces
5. Add performance monitoring for collaborative features

**Example**: `/optimize-performance Issue listing slow for workspaces with 10,000+ issues`

---

## /create-component
Create a new UI component following Plane.SO design system and collaboration patterns.

**Arguments**: Component name and requirements

**Process**:
1. Use plane-ui-specialist to design component API with real-time and workspace-aware features
2. Create component with proper TypeScript typing and optimistic updates
3. Add Storybook stories with collaboration scenarios
4. Implement comprehensive tests including keyboard navigation and accessibility
5. Add to component library and update documentation

**Example**: `/create-component CycleProgressChart with real-time burndown updates`

---

## /deploy-feature
Deploy a feature to production with full CI/CD pipeline for Plane.SO.

**Arguments**: Feature branch or deployment target

**Process**:
1. Use test-specialist to run full test suite including real-time collaboration tests
2. Use devops-specialist to review deployment strategy for collaborative features
3. Create deployment plan with WebSocket service considerations and rollback strategy
4. Execute deployment with proper monitoring of real-time features
5. Verify production functionality including collaboration and workspace isolation

**Example**: `/deploy-feature feature/advanced-issue-filtering to staging`

---

## /setup-monitoring
Set up monitoring and alerting for specific Plane.SO functionality.

**Arguments**: Feature or component to monitor

**Process**:
1. Use devops-specialist to design monitoring strategy for collaborative platform
2. Use plane-database-architect to add Django ORM query performance monitoring
3. Use plane-fullstack-architect to add WebSocket and real-time feature metrics
4. Configure alerts for critical thresholds (workspace limits, collaboration latency)
5. Create monitoring dashboard for project management workflows

**Example**: `/setup-monitoring Real-time collaboration performance and WebSocket connection health`

---

## /generate-migration
Create Django database migration for schema changes in Plane.SO.

**Arguments**: Migration description or Django model changes needed

**Process**:
1. Use plane-database-architect to analyze current Django models
2. Design migration with proper indexes for workspace-scoped queries
3. Create migration scripts with workspace data isolation considerations
4. Test migration on development database with realistic data volumes
5. Generate documentation for schema changes and workspace impact

**Example**: `/generate-migration Add issue template system with workspace-specific templates`

---

## /create-api
Create new Django REST API endpoints for Plane.SO.

**Arguments**: API description and requirements

**Process**:
1. Use plane-database-architect to design Django model access patterns
2. Use plane-fullstack-architect to design REST API schema with workspace scoping
3. Implement Django REST Framework views with proper serializers and permissions
4. Add workspace-based authentication and authorization checks
5. Create comprehensive API tests and OpenAPI documentation

**Example**: `/create-api Cycle management endpoints with burndown chart data and real-time updates`

---

## /security-audit
Perform security audit of specific features in the collaborative platform.

**Arguments**: Area to audit (authentication, workspace isolation, API endpoints, etc.)

**Process**:
1. Use plane-fullstack-architect to review security patterns and workspace isolation
2. Use plane-database-architect to check Django model permissions and row-level security
3. Use devops-specialist to review infrastructure security for collaborative features
4. Identify vulnerabilities in workspace data isolation and permission systems
5. Implement security improvements with comprehensive testing

**Example**: `/security-audit Workspace data isolation in issue queries and real-time updates`

---

## /project-management-workflow
Implement project management industry-specific workflows and business logic.

**Arguments**: Workflow description (issue lifecycle, sprint planning, etc.)

**Process**:
1. Use plane-fullstack-architect to define agile workflow requirements
2. Use plane-database-architect to model workflow state machines and issue transitions
3. Use plane-ui-specialist to create workflow interface components with drag-and-drop
4. Implement state management with real-time sync across team members
5. Add comprehensive activity tracking and audit trails

**Example**: `/project-management-workflow Custom issue workflow with approval gates and automated transitions`

---

## /load-test
Perform load testing and capacity planning for collaborative features.

**Arguments**: Feature or endpoint to test, expected concurrent users and workspaces

**Process**:
1. Use test-specialist to create realistic load test scenarios with multiple concurrent users
2. Use devops-specialist to set up load testing infrastructure for WebSocket connections
3. Use plane-database-architect to monitor Django ORM and PostgreSQL performance
4. Execute tests simulating real-time collaboration scenarios
5. Recommend scaling strategies for large enterprise workspaces

**Example**: `/load-test Issue board with 100 concurrent users editing simultaneously`

---

## /setup-integration
Set up external tool integration for Plane.SO workflows.

**Arguments**: Integration type (GitHub, Slack, webhooks, etc.)

**Process**:
1. Use plane-fullstack-architect to design integration architecture with workspace scoping
2. Use plane-database-architect to model integration data and webhook storage
3. Implement OAuth flows and webhook handling with proper error recovery
4. Add integration management UI with workspace admin controls  
5. Create comprehensive tests for integration scenarios and edge cases

**Example**: `/setup-integration GitHub bidirectional sync with issue linking and PR status updates`

---

## /optimize-realtime
Optimize real-time collaboration features and WebSocket performance.

**Arguments**: Specific real-time feature to optimize

**Process**:
1. Use plane-fullstack-architect to analyze WebSocket connection patterns
2. Use plane-ui-specialist to optimize optimistic updates and conflict resolution
3. Review Django Channels configuration and Redis performance
4. Implement connection pooling and message queuing optimizations
5. Add real-time performance monitoring and alerting

**Example**: `/optimize-realtime Issue comment real-time sync for workspaces with 1000+ active users`

---

## /workspace-migration
Handle workspace data migration or organizational restructuring.

**Arguments**: Migration type and requirements

**Process**:
1. Use plane-database-architect to design data migration strategy
2. Create backup and rollback procedures for workspace data
3. Implement migration scripts with progress tracking and error handling
4. Use plane-fullstack-architect to handle API compatibility during migration
5. Verify data integrity and workspace isolation after migration

**Example**: `/workspace-migration Split large workspace into multiple workspaces while preserving issue history`

---

## Common Usage Patterns

### Feature Development Workflow
```bash
# 1. Implement new feature
/implement-feature Advanced issue filtering with saved views and real-time updates

# 2. Review implementation  
/review-code web/components/issues/filters/

# 3. Test and debug collaboration
/debug-issue Filter changes not syncing in real-time across team members

# 4. Deploy to staging
/deploy-feature feature/advanced-filtering to staging
```

### Performance Optimization Workflow  
```bash
# 1. Identify bottleneck
/optimize-performance Issue board loading slowly with 5000+ issues

# 2. Set up monitoring
/setup-monitoring Issue board performance and real-time update latency

# 3. Load test improvements  
/load-test Issue board with 50 concurrent users and real-time updates
```

### Security Review Workflow
```bash
# 1. Security audit
/security-audit Workspace data isolation in API endpoints

# 2. Fix identified issues
/debug-issue Potential workspace data leak in issue search API

# 3. Verify fixes
/review-code apiserver/plane/api/views/issue.py
```

### Integration Development Workflow
```bash
# 1. Set up new integration
/setup-integration Slack notifications for issue mentions and status changes

# 2. Create related APIs
/create-api Webhook management endpoints for workspace admins

# 3. Test integration scenarios
/debug-issue GitHub sync failing for private repositories
```

### Real-time Feature Workflow
```bash
# 1. Implement collaborative feature
/implement-feature Real-time cursor tracking for issue description editing

# 2. Optimize performance
/optimize-realtime Cursor position updates causing high WebSocket traffic

# 3. Load test collaboration
/load-test 20 users simultaneously editing same issue description
```

### Workspace Management Workflow
```bash
# 1. Handle workspace scaling
/workspace-migration Archive completed projects while preserving analytics

# 2. Monitor workspace health
/setup-monitoring Workspace storage usage and performance metrics

# 3. Optimize for large teams
/optimize-performance Workspace with 1000+ members and complex permission hierarchy
```

All commands automatically engage the appropriate specialized agents based on the task requirements and maintain consistency with Plane.SO's architectural patterns, workspace-based multi-tenancy, and project management domain requirements.