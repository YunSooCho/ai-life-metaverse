# Integration Examples

Real-world integration scenarios for Claude Code collaboration with OpenClaw agents.

---

## Example 1: Automated Feature Development Pipeline

### Scenario

User requests: "Add user authentication with email/password and remember me functionality"

### Agent Workflow

```javascript
// Step 1: Analyze requirements
const complexity = "medium"; // Email/password is straightforward
const hasDatabase = true;
const framework = "Express.js";

// Step 2: Generate authentication code
exec(`claude -p "
  Implement user authentication with:
  - Email and password login
  - JWT token generation
  - Remember me functionality with persistent cookies
  - Input validation and error handling
  - Password hashing with bcrypt

  Use Express.js framework.
" --append-system-prompt "Use TypeScript" --output-format json`, function(err, stdout) {
  
  const result = JSON.parse(stdout);
  
  // Step 3: Apply generated files
  result.files_created.forEach(file => {
    write(file.path, file.content);
    console.log(`✓ Created ${file.path}`);
  });
  
  result.files_modified.forEach(file => {
    write(file.path, file.content);
    console.log(`✓ Modified ${file.path}`);
  });
  
  // Step 4: Install dependencies
  result.commands.forEach(cmd => {
    exec(cmd, function(cmdErr, cmdOut) {
      console.log(`✓ Executed: ${cmd}`);
    });
  });
  
  // Step 5: Update documentation
  write("./AUTH_API.md", result.documentation || "# Auth API Documentation");
  
  // Step 6: Report to user
  message(`
    ✅ Authentication feature added!
    
    Created files: ${result.files_created.map(f => f.path).join(', ')}
    Modified files: ${result.files_modified.map(f => f.path).join(', ')}
    
    Next steps:
    1. Create database migrations (${result.migrations || 'see code comments'})
    2. Update environment variables
    3. Test the endpoints
  `);
});
```

---

## Example 2: Bug Fixing with Context

### Scenario

User reports: "Login endpoint returns 500 error when password contains special characters"

### Agent Workflow

```javascript
// Step 1: Gather context
const errorLogs = read("./logs/error.log");
const authCode = read("./src/auth.ts");

// Step 2: Analyze and fix
exec(`claude -c -p "
  I'm debugging a login endpoint issue. Here's the error log:
  ${errorLogs}

  Here's the authentication code:
  ${authCode}

  The error occurs when passwords contain special characters (!@#$%^&*).
  
  Tasks:
  1. Identify the root cause
  2. Provide a fix
  3. Suggest tests to prevent regression
" --output-format json`, function(err, stdout) {
  
  const result = JSON.parse(stdout);
  
  // Apply fix
  if (result.files_modified) {
    result.files_modified.forEach(file => {
      write(file.path, file.content);
      console.log(`✓ Fixed ${file.path}`);
    });
  }
  
  // Generate tests
  if (result.recommended_tests) {
    write("./src/auth.spec.ts", result.recommended_tests);
    console.log("✓ Created tests");
  }
  
  message(`
    🔧 Bug fixed!
    
    Root cause: ${result.root_cause}
    Fix applied to: ${result.files_modified?.map(f => f.path).join(', ')}
    Tests created: ./src/auth.spec.ts
    
    Run 'npm test' to verify.
  `);
});
```

---

## Example 3: Code Review Automation

### Scenario

Before committing, automatically review changes for security issues

### Agent Workflow

```javascript
// On pre-commit hook
exec(`git diff --cached | claude -p "
  Review these staged changes for:
  
  CRITICAL:
  1. Security vulnerabilities (SQL injection, XSS, etc.)
  2. Authentication/authorization issues
  3. Sensitive data exposure
  4. Third-party package vulnerabilities
  
  IMPORTANT:
  1. Performance issues
  2. Code quality violations
  3. Missing error handling
  
  Return JSON:
  {
    'approved': true/false,
    'blockers': ['critical issues that must be fixed'],
    'warnings': ['important but not blocking'],
    'suggestions': ['optional improvements']
  }
" --output-format json`, function(err, stdout) {
  
  const review = JSON.parse(stdout);
  
  if (!review.approved) {
    message(`
      🚫 Commit blocked! Critical issues found:

      Blockers:
      ${review.blockers.map(b => `- ${b}`).join('\n')}

      Please fix these before committing.
    `);
    
    // Block the commit
    process.exit(1);
  } else if (review.warnings.length > 0) {
    message(`
      ⚠️ Code review warnings:
      
      ${review.warnings.map(w => `- ${w}`).join('\n')}
      
      Commit allowed, but consider fixing these.
    `);
  } else {
    message("✅ Code review passed - no issues found");
  }
});
```

---

## Example 4: API Documentation Generation

### Scenario

Generate OpenAPI documentation for all API endpoints

### Agent Workflow

```javascript
// Step 1: Identify API endpoints
exec(`claude -p "
  Scan this codebase and identify all REST API endpoints.
  For each endpoint, document:
  1. HTTP method and path
  2. Request parameters (query, path, body)
  3. Response schema
  4. Authentication requirements
  5. Error responses
  
  Generate OpenAPI 3.0 specification.
" --output-format json`, function(err, stdout) {
  
  const result = JSON.parse(stdout);
  
  // Write OpenAPI spec
  write("./openapi.yaml", result.openapi_spec);
  
  // Write human-readable docs
  write("./API_DOCS.md", `
    # API Documentation
    
    ${result.endpoints.map(ep => `
    ## ${ep.method.toUpperCase()} ${ep.path}
    
    ${ep.description}
    
    ### Request
    **Body:** \`${JSON.stringify(ep.request_schema, null, 2)}\`
    
    ### Response
    **200 OK:** \`${JSON.stringify(ep.response_schema, null, 2)}\`
    
    **401 Unauthorized:** Token invalid or expired
    **400 Bad Request:** ${ep.error_400}
    **500 Internal Server Error:** Server error
    `).join('\n')}
  `);
  
  message(`
    📄 API documentation generated!
    
    - OpenAPI spec: ./openapi.yaml
    - Human-readable docs: ./API_DOCS.md
    - Total endpoints: ${result.endpoints.length}
  `);
});
```

---

## Example 5: Database Schema Migration

### Scenario

Add user preferences field to users table

### Agent Workflow

```javascript
// Step 1: Generate migration
exec(`claude -p "
  I need to add a 'preferences' JSONB column to the 'users' table.
  The preferences should include:
  - theme (light/dark/system)
  - email_notifications (boolean)
  - language (string, default 'en')
  
  Generate:
  1. SQL migration script (PostgreSQL)
  2. TypeScript interface update
  3. Example usage code
" --output-format json`, function(err, stdout) {
  
  const result = JSON.parse(stdout);
  
  // Write migration
  const timestamp = Date.now();
  write(`./migrations/${timestamp}_add_preferences.sql`, result.migration_sql);
  
  // Update TypeScript types
  write("./src/types/user.ts", result.typescript_interface);
  
  // Write example usage
  write("./src/examples/preferences-example.ts", result.example_code);
  
  // Run migration
  exec(`psql $DATABASE_URL -f ./migrations/${timestamp}_add_preferences.sql`, {
    env: { DATABASE_URL: process.env.DATABASE_URL }
  }, function(migErr, migOut) {
    if (!migErr) {
      message(`
        ✅ Migration completed!
        
        - Migration file: ./migrations/${timestamp}_add_preferences.sql
        - Type definitions updated
        - Example code created
        
        Preferences field added with:
        - theme (light/dark/system)
        - email_notifications (boolean)
        - language (string)
      `);
    }
  });
});
```

---

## Example 6: Performance Optimization

### Scenario

Optimize slow API endpoint

### Agent Workflow

```javascript
// Step 1: Profile the endpoint
exec(`claude -c -p "
  I have an API endpoint that takes 5+ seconds to respond.
  Endpoint: GET /api/analytics/monthly
  
  Here's the code:
  ${read('./src/analytics.ts')}
  
  Tasks:
  1. Identify performance bottlenecks
  2. Suggest optimizations (caching, database queries, etc.)
  3. Implement the optimizations
  4. Provide before/after comparison
" --output-format json`, function(err, stdout) {
  
  const result = JSON.parse(stdout);
  
  // Apply optimizations
  result.files_modified.forEach(file => {
    write(file.path, file.content);
  });
  
  // Write optimization report
  write("./PERFORMANCE_REPORT.md", `
    # Performance Optimization Report
    
    ## Bottlenecks Identified
    ${result.bottlenecks.map(b => `- ${b}`).join('\n')}
    
    ## Optimizations Applied
    ${result.optimizations.map(o => `- ${o}`).join('\n')}
    
    ## Expected Performance Improvement
    **Before:** ${result.before_metrics.avg_response_time}ms avg
    **After:** ${result.after_metrics.avg_response_time}ms avg
    **Improvement:** ${result.improvement_percentage}%
    
    ## Recommendations
    ${result.recommendations.map(r => `- ${r}`).join('\n')}
  `);
  
  message(`
    ⚡ Performance optimized!
    
    Improvements applied to: ${result.files_modified.map(f => f.path).join('\n')}
    
    Performance gain: ${result.improvement_percentage}
    
    See ./PERFORMANCE_REPORT.md for details.
  `);
});
```

---

## Example 7: Test Generation for Existing Code

### Scenario

Generate comprehensive tests for untested module

### Agent Workflow

```javascript
// Step 1: Analyze untested code
const untestedCode = read("./src/payment.ts");

exec(`claude -p "
  This payment module has no tests. Here's the code:
  
  ${untestedCode}
  
  Generate comprehensive unit tests including:
  1. Happy path scenarios
  2. Edge cases (payment failures, timeouts, etc.)
  3. Input validation
  4. Error handling
  5. Mock external dependencies (Stripe, database)
  
  Use Jest and proper testing conventions.
" --output-format json`, function(err, stdout) {
  
  const result = JSON.parse(stdout);
  
  // Write test file
  write("./src/payment.spec.ts", result.test_code);
  
  // Write mocks if needed
  if (result.mocks) {
    Object.entries(result.mocks).forEach(([name, mockCode]) => {
      write(`./src/__mocks__/${name}`, mockCode);
    });
  }
  
  // Write test configuration if needed
  if (result.config_updates) {
    write("./jest.config.js", result.config_updates);
  }
  
  // Run tests
  exec("npm test -- src/payment.spec.ts", function(testErr, testOut) {
    const passed = testOut.match(/passed.*(\d+)/);
    
    message(`
      🧪 Tests generated!
      
      Test file: ./src/payment.spec.ts
      Tests created: ${passed ? passed[1] : 'unknown'}
      
      Run 'npm test src/payment.spec.ts' to execute.
    `);
  });
});
```

---

## Example 8: Dependency Upgrade Guidance

### Scenario

Upgrade Express.js from v4.x to v5.x

### Agent Workflow

```javascript
// Step 1: Analyze current usage
exec(`claude -c -p "
  I'm upgrading Express.js from v4.19.2 to v5.0.0.
  
  Current code uses these Express features:
  ${exec("grep -r 'express' src/ | head -20")}
  
  Tasks:
  1. Identify breaking changes that affect this codebase
  2. Provide migration guide specific to this codebase
  3. Update code to work with Express v5
  4. Add tests to prevent regressions
" --output-format json`, function(err, stdout) {
  
  const result = JSON.parse(stdout);
  
  // Write migration plan
  write("./EXPRESS_V5_MIGRATION_PLAN.md`, `
    # Express v4 → v5 Migration Plan
    
    ## Breaking Changes Impact
    ${result.breaking_changes.map(c => `- ${c}`).join('\n')}
    
    ## Code Changes Needed
    ${result.code_changes.map(c => `
    ### ${c.file}
    \`\`\`diff
    ${c.diff}
    \`\`\`
    `).join('\n')}
    
    ## Test Updates
    ${result.test_updates}
  `);
  
  // Apply code changes
  result.code_changes.forEach(change => {
    write(change.file, change.updated_code);
  });
  
  message(`
    📦 Express v5 migration plan created!
    
    Migration guide: ./EXPRESS_V5_MIGRATION_PLAN.md
    
    Breaking changes affecting this codebase: ${result.breaking_changes.length}
    Files to update: ${result.code_changes.length}
    
    Review the plan, then run 'npm install express@5' to upgrade.
  `);
});
```

---

## Example 9: Security Audit

### Scenario

Comprehensive security audit of authentication system

### Agent Workflow

```javascript
// Step 1: Scan authentication code
const authFiles = [
  "./src/auth.ts",
  "./src/middleware/auth.ts",
  "./src/routes/auth.ts"
];

exec(`claude -p "
  Perform a comprehensive security audit of this authentication system.
  
  Files to review:
  ${authFiles.map(f => read(f)).join('\n\n')}
  
  Check for:
  1. SQL injection vulnerabilities
  2. XSS vulnerabilities
  3. CSRF protection
  4. Session fixation
  5. JWT token security (secret strength, expiration)
  6. Password storage (hashing, salt, strength)
  7. Rate limiting on authentication attempts
  8. Brute force protection
  9. Authentication bypass possibilities
  10. Sensitive data exposure
   
  For each vulnerability found, provide:
  - Severity (Critical/High/Medium/Low)
  - Location in code
  - Explanation of risk
  - Suggested fix
  
  Return JSON with all findings.
" --model opus --output-format json`, function(err, stdout) {
  
  const audit = JSON.parse(stdout);
  
  // Write audit report
  write("./SECURITY_AUDIT_REPORT.md", `
    # Security Audit Report - Authentication System
    
    ## Executive Summary
    ${audit.summary}
    
    ## Critical Vulnerabilities
    ${audit.vulnerabilities.filter(v => v.severity === 'Critical').map(v => `
    ### ${v.title}
    **Severity:** Critical
    
    ${v.description}
    
    **Location:** \`${v.location}\`
    
    **Fix:**
    \`\`\`${v.language}
    ${v.fix_code}
    \`\`\`
    `).join('\n')}
    
    ## All Vulnerabilities by Severity
    
    ${['Critical', 'High', 'Medium', 'Low'].map(severity => `
    ### ${severity}
    ${audit.vulnerabilities.filter(v => v.severity === severity).map(v => `- **${v.title}**: ${v.description}`).join('\n')}
    `).join('\n')}
    
    ## Recommendations
    ${audit.recommendations.map(r => `- ${r}`).join('\n')}
  `);
  
  // Auto-fix low-risk issues
  audit.vulnerabilities.filter(v => v.severity === 'Low' && v.auto_fix).forEach(v => {
    write(v.location, v.fixed_code);
  });
  
  message(`
    🔒 Security audit completed!
    
    Report: ./SECURITY_AUDIT_REPORT.md
    
    Vulnerabilities found:
    - Critical: ${audit.vulnerabilities.filter(v => v.severity === 'Critical').length}
    - High: ${audit.vulnerabilities.filter(v => v.severity === 'High').length}
    - Medium: ${audit.vulnerabilities.filter(v => v.severity === 'Medium').length}
    - Low: ${audit.vulnerabilities.filter(v => v.severity === 'Low').length}
    
    Low-risk issues auto-fixed. Critical/High issues require manual review.
  `);
});
```

---

## Example 10: Documentation Auto-Update

### Scenario

Keep README.md in sync with actual API endpoints

### Agent Workflow

```javascript
// Trigger on route file changes
exec(`claude -p "
  Update the README.md to reflect the current API structure.
  
  Current routes:
  ${exec("find ./src/routes -name '*.ts' -exec cat {} \\;")}
  
  Current README:
  ${read('./README.md')}
  
  Requirements:
  1. Update API endpoints section with all current routes
  2. Add new examples if methods changed
  3. Remove deprecated endpoints
  4. Update environment variables section
  5. Keep project overview and other sections unchanged
" --output-format json`, function(err, stdout) {
  
  const result = JSON.parse(stdout);
  
  // Update README
  write("./README.md", result.updated_readme);
  
  // Commit changes
  exec("git add README.md && git commit -m 'docs: update README with current API structure'");
  
  message(`
    📝 README.md auto-updated!
    
    Changes:
    - API endpoints section updated
    - Environment variables section updated
    - ${result.changes_summary}
  `);
});
```

---

## Common Patterns

### Error Handling Wrapper

```javascript
async function delegateToClaudeCode(prompt, options = {}) {
  const defaultOptions = {
    outputFormat: 'json',
    maxTurns: 5,
    maxBudgetUsd: 2.00
  };
  
  const mergedOptions = { ...defaultOptions, ...options };
  
  return new Promise((resolve, reject) => {
    exec(`claude -p "${prompt}" \
      --output-format ${mergedOptions.outputFormat} \
      ${mergedOptions.model ? `--model ${mergedOptions.model}` : ''} \
      ${mergedOptions.maxTurns ? `--max-turns ${mergedOptions.maxTurns}` : ''} \
      ${mergedOptions.maxBudgetUsd ? `--max-budget-usd ${mergedOptions.maxBudgetUsd}` : ''}`,
      function(err, stdout, stderr) {
        if (err) {
          reject(new Error(`Claude Code execution failed: ${stderr}`));
          return;
        }
        
        try {
          const result = JSON.parse(stdout);
          resolve(result);
        } catch (parseError) {
          reject(new Error(`JSON parse failed: ${parseError.message}. Raw: ${stdout}`));
        }
      }
    );
  });
}

// Usage
try {
  const result = await delegateToClaudeCode("Refactor auth module", {
    model: 'opus',
    maxTurns: 3
  });
  
  // Process result...
} catch (error) {
  message(`❌ Error: ${error.message}`);
}
```

### Progress Tracking

```bash
# Long-running tasks with continuous updates
claude -p "Migrate entire codebase to TypeScript" \
  --output-format stream-json --include-partial-messages
# Output will stream updates as they happen
```

### Rollback Safety

```javascript
// Before applying Claude Code changes
const originalFiles = {};

// Backup all files that might be changed
const filesToWatch = ['./src/auth.ts', './package.json'];
filesToWatch.forEach(file => {
  originalFiles[file] = read(file);
});

// Apply Claude Code changes
const result = await delegateToClaudeCode("Add 2FA");

try {
  // Apply changes
  result.files_modified.forEach(file => {
    write(file.path, file.content);
  });
  
  // Test
  exec("npm test", (testErr) => {
    if (testErr) {
      // Rollback
      Object.entries(originalFiles).forEach(([file, content]) => {
        write(file, content);
      });
      message("❌ Tests failed, changes rolled back");
    }
  });
} catch (error) {
  // Rollback on error
  Object.entries(originalFiles).forEach(([file, content]) => {
    write(file, content);
  });
  message(`❌ Error: ${error.message}, changes rolled back`);
}
```

---

## Best Practices

1. **Always set turn and budget limits** for automated workflows
2. **Parse JSON outputs carefully** with error handling
3. **Backup files before applying changes** for easy rollback
4. **Validate results** after each operation
5. **Provide clear context** in system prompts
6. **Use appropriate models** (Opus for complexity, Sonnet for balance)
7. **Chain related tasks** using `-c` for session continuity
8. **Document decisions** generated by Claude Code
9. **Test changes** before committing
10. **Review critical changes** manually before applying

---

## Troubleshooting

If Claude Code returns unexpected results:

1. **Check context window:** The task might be too complex for one prompt
2. **Simplify the request:** Break down into smaller tasks
3. **Add explicit constraints:** Use `--append-system-prompt` for specific requirements
4. **Increase budget:** Raise `--max-budget-usd` if hitting limits
5. **Review JSON structure:** Errors might indicate malformed input
6. **Check session state:** Use `-c` to maintain context across steps
7. **Verify permissions:** Ensure Claude Code has necessary file access