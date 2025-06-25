# File-Based Session Store Configuration

## 📁 What is File-Based Session Store?

Instead of storing sessions in memory (which gets wiped on server restart) or requiring external databases like Redis/MongoDB, the file-based session store saves session data directly to files on your server's filesystem.

## 🔧 How It Works

```typescript
// Your current configuration in session.ts
const sessionsDir = path.join(process.cwd(), 'sessions');

sessionConfig.store = new SessionFileStore({
    path: sessionsDir,              // Store sessions in ./sessions/ folder
    ttl: 24 * 60 * 60,             // 24 hours expiry
    retries: 3,                    // Retry failed operations 3 times
    reapInterval: 60 * 60,         // Clean up expired sessions every hour
    reapAsync: true,               // Non-blocking cleanup
});
```

## 📂 File Structure

When your app runs, it will create:

```
Backend/
├── sessions/           ← New folder created automatically
│   ├── sess_abc123.json
│   ├── sess_def456.json
│   └── sess_xyz789.json
├── src/
├── package.json
└── ...
```

Each session file contains:
```json
{
  "cookie": {
    "originalMaxAge": 86400000,
    "expires": "2025-06-27T10:30:00.000Z",
    "secure": true,
    "httpOnly": true,
    "sameSite": "none"
  },
  "csrfToken": "a1b2c3d4e5f6...",
  "user": { "userId": "123", "email": "user@example.com" }
}
```

## ✅ Benefits

1. **No External Dependencies**: No Redis, MongoDB, or other services needed
2. **Survives Server Restarts**: Sessions persist across deployments
3. **Simple Setup**: Just works out of the box
4. **Easy Debugging**: You can actually see the session files
5. **Low Resource Usage**: Minimal memory footprint

## ⚠️ Considerations

1. **File System Access**: Your server needs write permissions to create the sessions folder
2. **Scaling**: For multiple servers, each will have its own session files (use load balancer sticky sessions)
3. **Cleanup**: Expired sessions are automatically cleaned up every hour
4. **Backup**: Session files are just regular files, easy to backup

## 🚀 Production Ready

Your current configuration is production-ready because:

- ✅ Sessions persist across server restarts
- ✅ CSRF tokens remain valid after deployment
- ✅ Automatic cleanup of expired sessions
- ✅ No external service dependencies
- ✅ Proper error handling and retries

## 🔍 Monitoring Session Files

You can monitor your sessions with simple file system commands:

```bash
# See how many active sessions
ls -la sessions/ | wc -l

# Check session file contents (for debugging)
cat sessions/sess_[session-id].json

# Clean up sessions manually if needed
find sessions/ -name "sess_*" -mtime +1 -delete
```

## 🛡️ Security

File-based sessions are secure because:
- Files are stored server-side (not accessible via web)
- Session IDs are cryptographically secure
- Files have proper file system permissions
- Automatic expiry removes old sessions

## 📊 Compared to Other Solutions

| Feature | File Store | In-Memory | Redis | MongoDB |
|---------|------------|-----------|-------|---------|
| Survives Restart | ✅ | ❌ | ✅ | ✅ |
| External Service | ❌ | ❌ | ✅ | ✅ |
| Setup Complexity | Low | None | Medium | Medium |
| Scaling | Good* | Poor | Excellent | Good |
| Performance | Good | Excellent | Excellent | Good |

*With sticky sessions or shared filesystem

## 🎯 Perfect for Your Use Case

File-based sessions are ideal for your situation because:
1. You can't configure Redis on your server
2. You want sessions to survive server restarts
3. You need a simple, reliable solution
4. You don't need complex scaling (yet)

Your CSRF protection will now work reliably across deployments! 🎉
