# Advanced Workflows

This document contains complex multi-step patterns and advanced techniques for collaborating with Claude Code.

---

## Workflow 1: Full-Stack Feature Development

### Phase 1: Planning

```bash
# Have Claude Code plan the feature
claude -p "I need to implement a user authentication system with:
1. Login with email/password
2. JWT token validation
3. Password reset via email
4. Rate limiting
5. Two-factor authentication

Plan the architecture, file structure, and implementation steps." \
  --model opus \
  --output-format json > auth-plan.json
```

### Phase 2: Backend Implementation

```bash
# Iterate through implementation
claude -c -p "Now implement Phase 1: Database schema and models" \
  --output-format json

claude -c -p "Now implement Phase 2: Authentication API endpoints" \
  --output-format json

claude -c -p "Now implement Phase 3: JWT token generation and validation" \
  --output-format json
```

### Phase 3: Testing

```bash
# Generate tests
claude -c -p "Write comprehensive unit tests for the authentication module with 100% coverage" \
  --output-format json

# Run and fix tests
exec("npm test 2>&1 | claude -c -p 'Analyze test failures and fix them' --output-format json");
```

### Phase 4: Documentation

```bash
# Generate API documentation
claude -c -p "Generate OpenAPI/Swagger documentation for the authentication endpoints" \
  --output-format json
```

---

## Workflow 2: Gradual Refactoring of Large Codebase

### Step 1: Analysis

```bash
# Analyze codebase structure
claude -p "Analyze this codebase's architecture, identify technical debt, and prioritize refactoring opportunities" \
  --model opus \
  --output-format json
```

### Step 2: Incremental Refactoring

```bash
# Refactor one module at a time
claude -c -p "Refactor the authentication module to follow SOLID principles" \
  --append-system-prompt "Ensure existing tests pass after changes" \
  --output-format json

# Verify
exec("npm test", function(err, stdout) {
  if (!err) {
    claude -c -p "Refactor the payment processing module" \
      --append-system-prompt "Ensure existing tests pass after changes" \
      --output-format json
  }
});
```

### Step 3: Validation

```bash
# Run comprehensive tests
exec("npm run test:all", function(err) {
  if (err) {
    claude -c -p "Fix all test failures caused by refactoring" \
      --output-format json
  }
});
```

---

## Workflow 3: CI/CD Integration

### Pre-commit Hook

```bash
# .git/hooks/pre-commit
#!/bin/bash
# Get staged files
STAGED_FILES=$(git diff --cached --name-only | grep '\.ts$')

if [ -n "$STAGED_FILES" ]; then
  echo "Running Claude Code pre-commit checks..."

  # Code review
  git diff --cached | claude -p '
    Review these staged changes for:
    1. Security vulnerabilities
    2. Performance issues
    3. Code quality violations
    4. Missing error handling

    Return JSON with { "approved": true/false, "comments": ["..."] }
  ' --output-format json --max-turns 3

  # If not approved, block commit
fi
```

### Automated Test Generation

```bash
# CI pipeline step
claude -p "
  Given the recent PR changes in:
  $(git diff HEAD~1 refs/origin/main -- '*.ts')

  Generate missing unit tests to achieve 100% coverage.
  Focus on edge cases and error conditions.
" --output-format json --max-turns 5
```

### Automatic Bug Fixing in CI

```bash
# When tests fail in CI
if [ $? -ne 0 ]; then
  claude -p "
    Tests are failing. Analyze the test output:
    $TEST_OUTPUT

    Identify the root cause and provide a fix.
    Ensure the fix doesn't break other tests.
  " --output-format json --max-turns 5

  # Apply fix and re-run tests
  npm test
fi
```

---

## Workflow 4: Multi-Agent Coordination

### Define Specialized Agents

```bash
# agents.json
{
  "architect": {
    "description": "Software architect focused on design patterns and scalability",
    "prompt": "You are a software architect with 15 years of experience. Focus on SOLID principles, DDD patterns, and scalability.",
    "model": "opus"
  },
  "security-auditor": {
    "description": "Security specialist for vulnerability assessment",
    "prompt": "You are a security expert. Identify OWASP Top 10 vulnerabilities, injection risks, and authentication flaws.",
    "model": "opus"
  },
  "performance-tuner": {
    "description": "Performance optimization specialist",
    "prompt": "You are a performance engineer. Focus on database queries, caching strategies, and response times.",
    "model": "sonnet"
  }
}
```

### Coordinated Workflow

```bash
# Step 1: Architecture review
claude --agents ./agents.json -p "@architect Review this authentication system design and suggest improvements" \
  --output-format json > architecture-review.json

# Step 2: Security audit
claude --agents ./agents.json -p "@security-auditor Audit these authentication endpoints for vulnerabilities" \
  --output-format json > security-audit.json

# Step 3: Performance optimization
claude --agents ./agents.json -p "@performance-tuner Optimize these database queries" \
  --output-format json > performance-optimization.json

# Step 4: Apply recommendations
# (Agent processes JSON results and applies changes)
```

---

## Workflow 5: Progressive Enhancement

### Phase 1: MVP

```bash
# Start with minimal implementation
claude -p "Implement a basic authentication system with just email/password login" \
  --append-system-prompt "Keep it simple, no bells and whistles" \
  --output-format json
```

### Phase 2: Layered Enhancement

```bash
# Add features iteratively
claude -c -p "Add password reset functionality using email tokens" \
  --output-format json

claude -c -p "Add rate limiting to prevent brute force attacks" \
  --output-format json

claude -c -p "Add two-factor authentication using TOTP" \
  --output-format json
```

### Phase 3: Optimization

```bash
# Optimize after all features work
claude -c -p "Optimize database queries and add caching where appropriate" \
  --output-format json
```

---

## Workflow 6: Context-Aware Development

### Use MCP for Context

```bash
# Load context from external sources
claude --mcp-config ./mcp.json -p "
  Using the design document from Google Drive (via MCP),
  implement the user authentication system as specified.
  Follow all design patterns and architectural guidelines.
" --output-format json
```

### Load Configuration Files

```bash
# Base behavior on configuration
export AUTH_TYPE="jwt"
export DB_TYPE="postgres"

claude -p "
  Implement authentication using ${AUTH_TYPE} and ${DB_TYPE}.
  Follow best practices for this technology stack.
" --output-format json
```

---

## Workflow 7: Debugging Complex Issues

### Systematic Debugging

```bash
# Step 1: Symptom analysis
claude -p "
  The application crashes with 'ECONNREFUSED' error when users try to login.
  Analyze the symptoms, potential causes, and create a diagnostic plan.
" --output-format json > diagnosis.json

# Step 2: Investigation
claude -c -p "
  Based on the diagnosis, check the following:
  1. Database connection configuration
  2. Environment variables
  3. Network connectivity
  4. Database service status

  Provide detailed findings.
" --output-format json

# Step 3: Root Cause Identification
claude -c -p "
  Analyze the investigation findings and identify the root cause.
  Provide a definitive fix.
" --output-format json

# Step 4: Fix and Validation
claude -c -p "Implement the fix and provide verification steps" --output-format json
```

---

## Workflow 8: Knowledge Base Building

### Document Patterns

```bash
# Extract coding patterns from codebase
claude -p "
  Scan the codebase and document:
  1. Common patterns being used
  2. Anti-patterns to avoid
  3. Architectural conventions
  4. Coding standards

  Create a comprehensive guide for new developers.
" --output-format json > patterns-guide.md
```

### Generate Changelogs

```bash
# Auto-generate changelog from commits
claude -p "
  Analyze these commits:
  $(git log --oneline -20)

  Generate a human-readable changelog organized by feature, fix, and improvement.
" --output-format json > CHANGELOG-auto.md
```

---

## Workflow 9: Test-Driven Development (TDD)

### Write Tests First

```bash
# Specify test requirements
claude -p "
  I need authentication tests that cover:
  1. Successful login with correct credentials
  2. Failed login with wrong password
  3. JWT token validation
  4. Password reset flow
  5. Rate limiting enforcement

  Write comprehensive BDD-style tests.
" --output-format json
```

### Implement Code to Pass Tests

```bash
# Run tests (will fail)
exec("npm test auth.spec.ts", function(err) {
  if (err) {
    # Implement code to make tests pass
    claude -c -p "
      The tests are failing with this output:
      $TEST_OUTPUT

      Implement the authentication system to make all tests pass.
    " --output-format json
  }
});
```

---

## Workflow 10: Legacy Code Migration

### Analyze Legacy Code

```bash
# Understanding old code
claude -p "
  Analyze this legacy authentication code:
  $(cat src/legacy/auth.js)

  Explain its design, identify issues, and propose a migration strategy.
" --model opus --output-format json > legacy-analysis.json
```

### Phased Migration

```bash
# Phase 1: Create facade
claude -c -p "Create a facade layer that wraps the legacy auth with a modern interface" \
  --output-format json

# Phase 2: Migrate feature by feature
claude -c -p "Implement new password hashing module while maintaining legacy compatibility" \
  --output-format json

# Phase 3: Remove legacy
claude -c -p "Remove legacy code after all features are migrated to new implementation" \
  --output-format json
```

---

## Key Principles

1. **Start Simple**: Begin with basic implementation, enhance iteratively
2. **Test Early**: Write tests alongside code, fix failures immediately
3. **Budget Control**: Always use `--max-turns` for automated workflows
4. **Incremental**: Refactor in small, testable steps
5. **Context**: Provide adequate context through system prompts and MCP
6. **Validation**: Verify each step before proceeding
7. **Document**: Capture decisions and patterns for future reference

---

## Performance Tips

1. **Budget Management**: Set `--max-budget-usd` for cost control
2. **Turn Limits**: Use `--max-turns` to prevent infinite loops
3. **Model Selection**: Use Opus for complexity, Sonnet for balance, Haiku for speed
4. **Output Format**: JSON for programmatic use, text for human review
5. **Session Continuation**: Use `-c` for related tasks to maintain context
6. **Parallel Tasks**: Create multiple Claude Code processes for independent tasks