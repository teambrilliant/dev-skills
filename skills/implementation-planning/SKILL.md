---
name: implementation-planning
description: Create technical implementation plans from groomed tickets. Use when someone says "create a plan", "plan this ticket", "how should we implement this", "technical design", or has a ticket that needs a detailed technical approach before implementation begins.
allowed-tools: Read, Grep, Glob, Task, Write, Edit, AskUserQuestion
---

# Implementation Planning

Take a groomed ticket and create a detailed technical implementation plan that any developer or agent can follow.

## Plan Mode Integration

**If plan mode is active**:
1. Research using sub-agents (see below)
2. Write plan to BOTH locations:
   - The internal plan file (path in system message)
   - `thoughts/shared/plans/YYYY-MM-DD-descriptive-name.md` (persistent)
3. Call `ExitPlanMode` when done

**If plan mode is NOT active**:
1. First, call `EnterPlanMode` to request plan mode from the user
2. Once in plan mode, follow the process below
3. Write your final plan to BOTH locations
4. Call `ExitPlanMode` to request approval

## Plan File Storage (CRITICAL)

**You MUST save plans to `thoughts/shared/plans/`** - this is the persistent, shareable location.

The internal Claude Code plan file is temporary. Always copy/write to:
```
thoughts/shared/plans/YYYY-MM-DD-descriptive-name.md
```

Use TODAY'S DATE from the system as prefix:
- **IMPORTANT**: Get current date from system context (e.g., "Today's date" in env info)
- Example: If today is 2026-01-18 → `2026-01-18-shopify-client.md`

## Research with Sub-Agents (REQUIRED)

**Before writing any plan, you MUST use Task sub-agents to research:**

```
# Launch parallel research agents
Task(subagent_type="Explore", prompt="Find existing patterns for X in this codebase")
Task(subagent_type="codebase-analyzer", prompt="How is Y implemented?")
Task(subagent_type="codebase-locator", prompt="Find files related to Z")
```

**Minimum research before planning:**
1. Use `Explore` agent to understand codebase structure
2. Use `codebase-pattern-finder` to find similar implementations to follow
3. Read any related docs in `thoughts/shared/research/`

Do NOT skip sub-agent research. Quick grep/glob is not sufficient for planning.

## Principles

- **Research first** - Understand the codebase before proposing solutions
- **Be specific** - Include file paths, function names, code snippets
- **Be skeptical** - Question assumptions, identify risks early
- **Be practical** - Focus on incremental, testable changes
- **Agent-agnostic** - Plan should work for any implementer
- **Follow patterns** - Match existing codebase conventions

## Process

### 1. Gather Context (Use Sub-Agents)

Before planning, launch parallel research agents:

```typescript
// Launch these in parallel (single message with multiple Task calls)
Task(subagent_type="Explore", prompt="Explore codebase structure, find patterns for [feature type]")
Task(subagent_type="codebase-pattern-finder", prompt="Find similar implementations to [what we're building]")
```

**Required research:**
- Read related research docs in `thoughts/shared/research/`
- Use sub-agents to find existing implementation patterns
- Identify the tech stack (frameworks, libraries, patterns in use)
- Understand constraints and dependencies

**For monorepo projects (use Explore agent):**
- Package structure from `pnpm-workspace.yaml`
- Build configuration from `turbo.json`
- Existing packages for patterns to follow
- Catalog versions for dependencies

Ask clarifying questions if requirements are ambiguous.

### 2. Present Options (If Multiple Approaches Exist)

Present trade-offs clearly:
- Option A: [approach] - Pros/Cons
- Option B: [approach] - Pros/Cons
- Recommendation: [which and why]

Get alignment before detailed planning.

### 3. Write the Plan

Create a structured plan following the output format below.

## Output Format

```markdown
# [Ticket Title] - Implementation Plan

## Overview
[1-2 sentences: what we're building and why]

## Current State
[What exists now, what's missing, relevant code locations]

## Desired End State
[What should work when done, how to verify - include example commands/usage]

## Out of Scope
[Explicitly list what we're NOT doing - prevents scope creep]

## Implementation Approach
[High-level strategy and reasoning]

---

## Phase 1: [Descriptive Name]

### What This Accomplishes
[Summary of this phase's goal]

### Changes

**File**: `path/to/file.ext`

```[language]
// Complete code to add or modify
// Not snippets - full implementation
```

**File**: `path/to/another.ext`

```[language]
// Complete code
```

### Verification
- [ ] [Specific command to run]
- [ ] [Expected output or behavior]

---

## Phase 2: [Descriptive Name]
[Same structure as Phase 1]

---

## Testing Strategy

### Manual Verification
```bash
# Step-by-step commands to verify everything works
command1
command2
```

### Automated (if applicable)
- [ ] Unit tests: [what to test]
- [ ] Integration tests: [what scenarios]

## File Summary
```
directory/
├── file1.ext           # Purpose
├── file2.ext           # Purpose
└── subdirectory/
    └── file3.ext       # Purpose
```

**Total new files:** N files

## Open Questions
[List any unresolved questions - or "None" if all resolved]
```

## Phase Guidelines

**Good phases:**
- Each phase is independently verifiable
- Earlier phases don't break existing functionality
- Later phases build on earlier ones
- Can pause between phases if needed

**Phase sizing:**
- Small enough to verify quickly
- Large enough to be meaningful
- Typically 1-3 files per phase
- Each phase should have clear verification steps

**Code in phases:**
- Include COMPLETE code, not snippets
- Show the full file content or the full function
- Never use "..." or "// rest of code"
- Someone should be able to copy-paste and have it work

## Tech Stack Research

Before planning, identify and document:

```markdown
## Tech Stack Reference

**Package manager:** pnpm/npm/yarn
**Build tool:** turbo/nx/none
**Language:** TypeScript (strict mode?)
**Runtime:** Node.js/Bun/Deno
**Framework:** Fastify/Express/Hono
**Database:** Postgres + Drizzle/Prisma
**Testing:** Vitest/Jest
**Patterns to follow:** [reference existing implementations]
```

## Integration with Research Docs

Plans should reference research docs when available:

```markdown
## Related Research
- `thoughts/shared/research/2026-01-18_data-model.md` - Data model design decisions
- `thoughts/shared/research/2026-01-16_use-cases.md` - Use cases being addressed
```

## Example

**Input ticket**: "Add database package with Drizzle ORM"

**Output plan** (abbreviated):

```markdown
# Database Package - Implementation Plan

## Overview
Create `packages/db` with Drizzle ORM for PostgreSQL, following monorepo patterns from jp-partner-platform.

## Current State
- Monorepo exists with Fastify API + Temporal worker
- Postgres in docker-compose (port 5462)
- No database package yet

## Desired End State
```bash
# Package builds successfully
pnpm --filter=@repo/db build

# Migrations work
pnpm --filter=@repo/db generate
pnpm --filter=@repo/db migrate

# Types available in other packages
import { users } from "@repo/db/schema"
```

## Out of Scope
- API endpoints using the database
- Seed data
- Production deployment config

---

## Phase 1: Package Setup

### What This Accomplishes
Create the package skeleton with Drizzle configuration.

### Changes

**File**: `packages/db/package.json`
```json
{
  "name": "@repo/db",
  "type": "module",
  "exports": {
    ".": { "default": "./dist/index.js" },
    "./schema": { "default": "./dist/schema/index.js" }
  },
  "scripts": {
    "build": "tsc",
    "generate": "drizzle-kit generate",
    "migrate": "drizzle-kit migrate"
  },
  "dependencies": {
    "drizzle-orm": "^0.44.0",
    "postgres": "^3.4.7"
  },
  "devDependencies": {
    "drizzle-kit": "^0.31.0"
  }
}
```

**File**: `packages/db/drizzle.config.ts`
```typescript
import { defineConfig } from "drizzle-kit"

export default defineConfig({
  schema: "./src/schema/index.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "postgresql://postgres:postgres@localhost:5462/mydb",
  },
})
```

### Verification
- [ ] `pnpm install` succeeds
- [ ] `pnpm --filter=@repo/db build` succeeds

---

## Phase 2: Schema Definition
[...]
```

## What Makes a Good Plan

**Good** (specific, actionable):
- File paths exist or clearly describe where to create
- Code snippets show COMPLETE implementation
- Verification steps are concrete commands
- Expected outputs documented

**Bad** (vague, hand-wavy):
- "Update the relevant components"
- "Add appropriate error handling"
- "Test thoroughly"
- Code snippets with "..." placeholders

## After Plan Approval

When the user approves the plan:
1. **Verify plan is saved to `thoughts/shared/plans/`** - if not, save it now
2. Begin implementation phase by phase
3. Use TodoWrite to track progress through phases
4. Mark verification checkboxes as you complete them

The plan in `thoughts/shared/plans/` serves as the source of truth during implementation.

## Workflow Summary

```
1. User requests plan → Enter plan mode
2. Launch Explore/codebase-analyzer sub-agents (parallel)
3. Read research docs in thoughts/shared/research/
4. Draft plan based on findings
5. Write plan to:
   - Internal plan file (for Claude Code)
   - thoughts/shared/plans/YYYY-MM-DD-name.md (persistent)
6. Exit plan mode → User approves
7. Implement using plan as guide
```
