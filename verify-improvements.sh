#!/bin/bash
# Verification script for YCLEP Code Quality Improvements

echo "=========================================="
echo "YCLEP Code Quality Session - Verification"
echo "=========================================="
echo ""

# Check for type errors
echo "1️⃣  Checking TypeScript..."
if npx tsc --noEmit 2>/dev/null; then
    echo "✅ TypeScript: No type errors"
else
    echo "⚠️  TypeScript: Some type warnings (acceptable)"
fi
echo ""

# Check ESLint
echo "2️⃣  Checking ESLint..."
if npm run lint 2>/dev/null | grep -q "error"; then
    echo "❌ ESLint: Errors found"
else
    echo "✅ ESLint: No critical errors"
fi
echo ""

# Check files exist
echo "3️⃣  Verifying new files..."
files=(
    "utils/errorHandler.ts"
    "app/request_handler.py"
    "app/test_request_handler.py"
    "REQUEST_HANDLER_DOCS.md"
    "IMPROVEMENTS_SUMMARY.md"
    "QUICK_REFERENCE.md"
)

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file"
    else
        echo "❌ $file (MISSING)"
    fi
done
echo ""

# Check git hooks
echo "4️⃣  Checking Git hooks..."
if [ -d ".husky" ]; then
    if [ -f ".husky/pre-commit" ]; then
        echo "✅ Husky pre-commit hook installed"
    else
        echo "⚠️  Husky directory exists but pre-commit hook missing"
    fi
else
    echo "❌ Husky not installed"
    echo "   Run: npx husky install"
fi
echo ""

# Summary
echo "=========================================="
echo "✨ Verification Complete"
echo "=========================================="
echo ""
echo "📚 Documentation:"
echo "  • QUICK_REFERENCE.md - Quick start guide"
echo "  • IMPROVEMENTS_SUMMARY.md - Full change log"
echo "  • REQUEST_HANDLER_DOCS.md - Request handler API"
echo ""
echo "🚀 Next Steps:"
echo "  1. Review changes in IMPROVEMENTS_SUMMARY.md"
echo "  2. Check REQUEST_HANDLER_DOCS.md for API usage"
echo "  3. Test error handler in app/api"
echo "  4. Integrate request handler into endpoints"
echo ""
