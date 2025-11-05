# Quick Commands for GitHub Setup

## 1. Fix the Google AI Import

Edit `services/api.ts`:

**Line 2:** Change to:
```typescript
import { GoogleGenerativeAI } from "@google/generative-ai";
```

**Lines 335-345:** Change Type references to strings:
```typescript
type: "array",           // was: Type.ARRAY
type: "object",          // was: Type.OBJECT  
title: { type: "string" },      // was: Type.STRING
description: { type: "string" }, // was: Type.STRING
productName: { type: "string" }, // was: Type.STRING
```

## 2. Git Commands (after making the fix)

```bash
# Add changes
git add services/api.ts

# Commit fix
git commit -m "Fix: Replace Type enums with string literals for @google/generative-ai compatibility"

# Push to main
git push origin main

# Create test branch
git checkout -b test-neon-integration

# Make dummy change
echo " " >> README.md

# Commit and push
git add README.md
git commit -m "Test: trigger neon workflow"
git push origin test-neon-integration
```

## 3. GitHub Secrets Setup

**Settings → Secrets and variables → Actions:**

### Secrets (encrypted):
- `NEON_API_KEY` = Your Neon API key

### Variables (visible):
- `NEON_PROJECT_ID` = Your Neon project ID

## 4. Find Your Neon Details

**API Key:**
1. Go to https://neon.tech/
2. Click your project
3. Go to Settings → API Keys
4. Copy the key

**Project ID:**
1. Go to your project dashboard
2. Copy the project ID from the URL or settings

## 5. Check Workflow Success

After creating PR:
1. **GitHub Actions tab** → Should see green checkmarks
2. **Neon dashboard** → Should see new branch created
3. **Actions log** → Should show successful completion

## 6. Expected Results

✅ Netlify build succeeds  
✅ GitHub Actions create Neon branch  
✅ 14-day expiration set  
✅ Auto-cleanup on PR close  

## 7. If Something Goes Wrong

**Netlify still failing:**
- Confirm changes pushed to repository
- Check that fix was applied correctly

**GitHub Actions failing:**
- Verify secrets are set correctly
- Check Actions logs for specific errors
- Ensure `NEON_PROJECT_ID` is a variable (not secret)

**Neon branch not created:**
- Verify NEON_API_KEY has correct permissions
- Check NEON_PROJECT_ID value
- Look at workflow logs for details
