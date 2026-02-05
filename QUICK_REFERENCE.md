# YCLEP Code Quality Quick Reference

## 🎯 What Changed This Session

### 1️⃣ Git Hooks Activated ✅
```bash
npx husky install
```
**What it does**: Runs ESLint before every commit

### 2️⃣ CI/CD Faster ✅
- Lint, type-check, build, test run in parallel
- Multi-version testing (Node 18.x, 20.x)
- npm dependencies cached

### 3️⃣ Types Fixed ✅
- Removed 10 `any` types from UI code
- Added `tempId` to content types
- Created `CommandBarResult` interface

### 4️⃣ Error Handling ✅
```typescript
// NEW: utils/errorHandler.ts
buildErrorResponse(error) -> { success: false, error: {...} }
buildSuccessResponse(data) -> { success: true, data: {...} }

// Validators:
isString(), isNumber(), isEmail(), isUrl(), isArray(), isObject()
```

### 5️⃣ Request Handler Complete ✅
```python
handler = RequestHandler(max_concurrent_tasks=5)
handler.submit_task("type", {"data": ...}, priority=1)
await handler.process_tasks(processor, max_retries=3)
stats = handler.get_stats()
```

---

## 📚 New Files to Know

| File | Purpose |
|------|---------|
| `utils/errorHandler.ts` | Centralized error handling |
| `app/request_handler.py` | Async task queue manager |
| `app/test_request_handler.py` | Tests for request handler |
| `REQUEST_HANDLER_DOCS.md` | Full documentation |
| `IMPROVEMENTS_SUMMARY.md` | This session's changes |

---

## 🚀 Quick Start Examples

### Using Error Handler
```typescript
import { buildErrorResponse, buildSuccessResponse, isEmail } from '@/utils/errorHandler';

// Validate
if (!isEmail(userEmail)) {
    return buildErrorResponse(new ValidationError('email', 'Invalid email format'));
}

// Success
return buildSuccessResponse({ userId: user.id, name: user.name });
```

### Using Request Handler
```python
from app.request_handler import RequestHandler

async def process_data(task):
    result = await expensive_operation(task.payload)
    return result

handler = RequestHandler(max_concurrent_tasks=5)

# Submit tasks
for item in items:
    handler.submit_task(
        task_type="process",
        payload={"item": item},
        priority=1,
        callback=on_complete
    )

# Process
await handler.process_tasks(process_data, max_retries=3)

# Monitor
stats = handler.get_stats()
print(f"Success: {stats['success_rate']}%")
```

---

## 🔍 Finding Things

**Command Bar Type**
```typescript
import type { CommandBarResult } from '@/types';
```

**Content Types with tempId**
```typescript
interface Product extends BaseContent {
    tempId?: string;  // Now available!
    affiliate_url: string;
    // ...
}
```

**Error Classes**
```typescript
import { 
    ValidationError, 
    NotFoundError, 
    UnauthorizedError,
    buildErrorResponse 
} from '@/utils/errorHandler';
```

---

## ⚠️ Important Changes to Existing Code

### Before
```typescript
const product = { id: -1, tempId, ... } as any;
setProducts(prev => prev.map(p => (p as any).tempId === tempId ? ... : p));
```

### After
```typescript
const product: Product = { id: -1, tempId, ... };
setProducts(prev => prev.map(p => p.tempId === tempId ? ... : p));
```

**Why**: Better TypeScript support, no more unsafe type casts

---

## 📋 Pre-Commit Now Checks

✅ ESLint validation runs automatically
✅ Fails if code has syntax errors
✅ Fails if code violates ESLint rules
✅ Prevents bad code from entering repo

**Skip check (last resort):**
```bash
git commit --no-verify
```

---

## 🎓 Best Practices Going Forward

### ✅ DO:
- Use explicit types instead of `any`
- Use type guards from `errorHandler.ts` for validation
- Use `tempId` for optimistic UI updates
- Use request handler for background tasks
- Use `CommandBarResult` for command bar callbacks

### ❌ DON'T:
- Don't cast with `as any`
- Don't throw raw strings, use error classes
- Don't mix error handling patterns
- Don't skip pre-commit hooks
- Don't commit broken types

---

## 🐛 Troubleshooting

**Pre-commit hook fails?**
```bash
# Fix ESLint issues
npm run lint -- --fix

# Then commit
git add .
git commit -m "fix: linting errors"
```

**TypeScript errors?**
```bash
# Check types
npm run type-check

# Or in VSCode: Ctrl+Shift+B
```

**Request handler not processing?**
- Check `get_stats()` for queued tasks
- Ensure processor is async function
- Check logs for error details
- Verify max_concurrent_tasks not bottlenecking

---

## 📞 Need Help?

- **Error Handling**: See `utils/errorHandler.ts` source
- **Request Handler**: See `REQUEST_HANDLER_DOCS.md`
- **Types**: See `types.ts` interfaces
- **Examples**: See `app/test_request_handler.py`

---

**Last Updated**: This session
**Status**: ✅ All changes complete and tested
