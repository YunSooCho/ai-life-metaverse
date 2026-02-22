# Troubleshooting

Common issues, error scenarios, and solutions for Claude Code collaboration.

---

## Installation Issues

### Error: "command not found: claude"

**Cause:** Claude Code not installed or not in PATH

**Solution:**
```bash
# Verify installation
which claude

# If not found, reinstall
curl -fsSL https://claude.ai/install.sh | bash

# Or with Homebrew
brew install --cask claude-code

# Verify installation
claude --version
```

### Error: "Permission denied" during installation

**Cause:** Insufficient permissions

**Solution:**
```bash
# Use sudo (not recommended)
sudo curl -fsSL https://claude.ai/install.sh | bash

# Better: Install to user directory
curl -fsSL https://claude.ai/install.sh | INSTALL_DIR="$HOME/.local/claude" bash
```

---

## Authentication Issues

### Error: "Not logged in"

**Cause:** No active Claude Code session

**Solution:**
```bash
# Start Claude Code and follow login prompts
claude

# Use /login command in Claude Code
/login

# Verify login
claude -p "Am I logged in?"
```

### Error: "Authentication failed: Invalid API key"

**Cause:** Invalid or expired credentials

**Solution:**
```bash
# Re-login
claude
/login

# Or specify different account via command line
claude --session-id <new-session-id>
```

---

## Execution Issues

### Error: "No TTY for interactive mode"

**Cause:** Trying to use interactive mode (`claude` or `claude "query"`) in non-interactive environment

**Solution:**
```bash
# ❌ Doesn't work in scripts
claude
claude "what's in this file?"

# ✅ Works in scripts
claude -p "what's in this file?"
```

### Error: "Claude Code exited with status 1"

**Cause:** Task failed or error in execution

**Solution:**
```bash
# Run with verbose output
claude -p "task" --verbose

# Check the actual error
claude -p "task" 2>&1 | tail -50

# Try with model fallback
claude -p "task" --fallback-model sonnet

# Reduce task complexity
claude -p "simpler task" --max-turns 3
```

### Error: "Claude API error: 429 Rate limit exceeded"

**Cause:** Too many requests or budget exceeded

**Solution:**
```bash
# Set budget limit
claude -p "task" --max-budget-usd 5.00

# Reduce task frequency
sleep 5  # Add delays between requests

# Use faster model for simple tasks
claude -p "simple task" --model haiku
```

---

## JSON Output Issues

### Error: "JSON parse failed"

**Cause:** Output not valid JSON

**Solution:**
```javascript
// Always wrap with try-catch
try {
  const result = JSON.parse(stdout);
  // Process result
} catch (error) {
  console.error("JSON parse error:", error.message);
  console.error("Raw output:", stdout);
  
  // Fallback to text mode
  exec("claude -p 'task' --output-format text");
}
```

### JSON returns unexpected structure

**Cause:** Claude Code returned different JSON format

**Solution:**
```javascript
const result = JSON.parse(stdout);

// Validate structure
if (!result.files_created && !result.files_modified) {
  console.warn("Unexpected JSON structure:", result);
  console.warn("Expected: { files_created: [], files_modified: [] }");
  console.warn("Got:", JSON.stringify(result, null, 2));
}
```

---

## File Access Issues

### Error: "Permission denied: cannot open file"

**Cause:** File permissions or ownership issues

**Solution:**
```bash
# Check file permissions
ls -la target-file.ts

# Fix permissions
chmod 644 target-file.ts

# Or run with elevated permissions (not recommended)
sudo chmod 644 target-file.ts
```

### Error: "No such file or directory"

**Cause:** File doesn't exist

**Solution:**
```bash
# Check if file exists
[ -f target-file.ts ] && echo "exists" || echo "not exists"

# Create file if needed
touch target-file.ts

# Or verify path
pwd
ls -la
```

---

## Budget & Cost Issues

### Error: "Budget exceeded"

**Cause:** Task cost exceeded limit

**Solution:**
```bash
# Check current budget usage
claude -p "task" --max-budget-usd 5.00 --verbose

# Reduce task scope
claude -p "smaller task" --max-budget-usd 2.00

# Use cheaper model
claude -p "task" --model sonnet --max-budget-usd 2.00
```

### Unexpected high costs

**Cause:** Complex task or large context

**Solution:**
```bash
# Limit context
claude -p "task" --max-turns 3

# Reduce files processed
# Only include essential files in prompt

# Use more focused prompts
claude -p "Specific question about specific file" instead of comprehensive audit
```

---

## Model Issues

### Error: "Model not available"

**Cause:** Specified model not accessible for account

**Solution:**
```bash
# Check available models
claude --models

# Use fallback model
claude -p "task" --fallback-model sonnet

# Use default model
claude -p "task" --model claude-sonnet-4-5-20250929
```

### Claude Code using wrong model

**Cause:** Default model setting incorrect

**Solution:**
```bash
# Specify model explicitly
claude --model opus -p "complex task"

# Or set in settings
# Create ~/.claude/settings.json with default model
{
  "defaultModel": "claude-opus-4-5-20250929"
}
```

---

## Session Issues

### Error: "Session not found"

**Cause:** Trying to resume non-existent session

**Solution:**
```bash
# List available sessions
claude

# Use correct session ID
claude -r "correct-session-name"

# Or start fresh
claude -c -p "continue task"
```

### Session context lost

**Cause:** Session timed out or got corrupted

**Solution:**
```bash
# Clear and start fresh
claude /clear
claude -p "restart task"

# Or resume with fresh context
cd /project/directory
claude -p "task"
```

---

## Tool/Permission Issues

### Error: "Tool not allowed: Bash"

**Cause**: Tool restrictions in settings

**Solution**:
```bash
# Allow specific tools
claude --allowedTools "Bash,Read,Edit"

# Check current restrictions
# Open ~/.claude/settings.json
# Verify "restrictedTools" field

# Or disable all restrictions (not recommended for CI)
# claude --dangerously-skip-permissions
```

### Error: "Permission required for Write operation"

**Cause**: Write permission denied

**Solution**:
```bash
# Check file permissions
ls -la

# Fix file permissions
chmod u+w target-file.ts

# Or create file first
touch target-file.ts
```

---

## Network Issues

### Error: "Connection timeout"

**Cause**: Network connectivity or firewall issues

**Solution**:
```bash
# Check internet connection
curl -I https://api.anthropic.com

# Check DNS
nslookup api.anthropic.com

# Try again (might be temporary)
claude -p "task"

# Use proxy if needed
export HTTP_PROXY=http://proxy.example.com:8080
export HTTPS_PROXY=https://proxy.example.com:8080
claude -p "task"
```

### Error: "SSL certificate verify failed"

**Cause**: SSL/TLS certificate issues

**Solution**:
```bash
# Update certificates (macOS)
brew install ca-certificates

# Temporary.disable SSL verification (not recommended)
export NODE_TLS_REJECT_UNAUTHORIZED=0
claude -p "task"
```

---

## Performance Issues

### Slow execution

**Cause**: Large codebase, complex task, or slow model

**Solution**:
```bash
# Use faster model for simple tasks
claude -p "simple task" --model haiku

# Reduce context (fewer files)
claude -p "task about specific-file.ts" instead of entire codebase

# Limit turns
claude -p "task" --max-turns 3

# Use streaming updates for progress
claude -p "task" --output-format stream-json
```

### Memory issues

**Cause**: Large output or context

**Solution**:
```bash
# Reduce output size
claude -p "task" --limit 100

# Process files in batches instead of all at once

# Use streaming output
claude -p "task" --output-format stream-json | head -1000
```

---

## Version Issues

### Error: "Claude Code version outdated"

**Cause**: Using old version with deprecated features

**Solution**:
```bash
# Update Claude Code
claude update

# Or reinstall
curl -fsSL https://claude.ai/install.sh | bash

# Check version
claude -v
```

### Breaking changes after update

**Cause**: Claude Code API changes

**Solution**:
```bash
# Check changelog
# https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md

# Check current version features
claude --help | grep output-format

# Adjust commands accordingly
```

---

## Integration Issues

### Claude Code conflicts with other CLI tools

**Cause**: Name collision or version incompatibility

**Solution**:
```bash
# Check which "claude" is being used
which claude

# Use full path if needed
/usr/local/bin/claude -p "task"

# Or alias
alias claude-code=/path/to/claude
claude-code -p "task"
```

### Environment variable conflicts

**Cause**: Overlapping environment variables

**Solution**:
```bash
# Check environment
env | grep -i claude

# Clear conflicting variables
unset ANTHROPIC_API_KEY
claude --api-key YOUR_KEY -p "task"

# Or use specific API key
export ANTHROPIC_API_KEY="your-key"
claude -p "task"
```

---

## Debug Checklist

When Claude Code fails, check:

1. **Installation**
   - ✅ Claude Code installed? (`claude -v`)
   - ✅ In PATH? (`which claude`)

2. **Authentication**
   - ✅ Logged in? (`claude -p "who am I?"`)
   - ✅ Valid credentials? (Check account)

3. **Environment**
   - ✅ Network connectivity? (`ping api.anthropic.com`)
   - ✅ File permissions? (`ls -la`)
   - ✅ Sufficient disk space? (`df -h`)

4. **Command**
   - ✅ Correct syntax? (Check flags)
   - ✅ Valid model? (`claude --models`)
   - ✅ Output format correct? (`--output-format json`)

5. **Task**
   - ✅ Too complex? Break down
   - ✅ Too large? Reduce context
   - ✅ Ambiguous? Clarify prompt

---

## Getting Help

### Built-in Help

```bash
# Show help
claude --help

# Interactive mode: /help
claude
/help

# Ask Claude Code directly
claude -p "How do I use XYZ feature?"
```

### Documentation

- [Official Docs](https://code.claude.com/docs/en/overview)
- [CLI Reference](https://code.claude.com/docs/en/cli-reference)
- [GitHub Issues](https://github.com/anthropics/claude-code/issues)
- [Discord Community](https://www.anthropic.com/discord)

### Report Bugs

```bash
# Use /bug command in Claude Code
claude
/bug

# Or create GitHub issue
# https://github.com/anthropics/claude-code/issues
```

---

## Common Mistakes

### Forgetting `-p` flag in scripts

```bash
# ❌ Doesn't work in automation
exec("claude 'What is 2+2?'");

# ✅ Works
exec("claude -p 'What is 2+2?'");
```

### Not setting turn limits

```bash
# ❌ Can run indefinitely and cost money
claude -p "Complex task" --output-format json

# ✅ Safe limit
claude -p "Complex task" --max-turns 5 --output-format json
```

### Using interactive mode in CI/CD

```bash
# ❌ Hangs waiting for TTY
exec("claude");

# ✅ Works in automation
exec("claude -p 'Task'");
```

### Not parsing JSON errors

```javascript
// ❌ Will crash on error
const result = JSON.parse(stdout).files_created;

// ✅ Wrapped in try-catch
try {
  const result = JSON.parse(stdout);
  const files = result.files_created;
} catch (error) {
  console.error("Parse error:", error);
}
```

---

## Quick Fixes

```bash
# 1. Reinstall Claude Code
curl -fsSL https://claude.ai/install.sh | bash

# 2. Clear session cache
rm -rf ~/.claude/sessions/*

# 3. Reset settings
rm ~/.claude/settings.json

# 4. Update to latest version
claude update

# 5. Re-login
claude
/login --force

# 6. Check logs
tail -100 ~/.claude/logs/*.log

# 7. Try a different project
cd /some/other/project
claude -p "test"

# 8. Test with simple query
claude -p "What is 2+2?"

# 9. Check system resources
free -h  # Linux
df -h    # Disk space
timeout 10s claude -p "test" # Check if hanging

# 10. Report issue with details
claude -p "I'm experiencing issue: [description]" --verbose 2>&1 > claude-debug.log
```