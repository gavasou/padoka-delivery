# GitHub Secrets and Variables Setup

## Step 1: Configure GitHub Secrets

1. **Go to your repository on GitHub**
2. **Navigate to:** Settings → Secrets and variables → Actions
3. **Click "New repository secret"**

### Add NEON_API_KEY:
- **Name:** `NEON_API_KEY`
- **Value:** Your Neon API key (from https://neon.tech/ (NEO) /API Keys)

### Add Variable:
- **Click "Variables" tab**
- **Click "New repository variable"**

### Add NEON_PROJECT_ID:
- **Name:** `NEON_PROJECT_ID`
- **Value:** Your Neon project ID (from project settings)

## Step 2: Test Workflow

1. **Create a new branch:**
   ```bash
   git checkout -b test-neon-integration
   ```

2. **Create a dummy commit** (add a space anywhere in README.md)

3. **Push and create PR:**
   ```bash
   git add .
   git commit -m "Test: trigger neon workflow"
   git push origin test-neon-integration
   ```

4. **Open Pull Request** on GitHub

5. **Check Actions tab** - you should see:
   - Workflow runs for your PR
   - New branch created in Neon (named: `preview/pr-{number}-{branch}`)
   - Branch expires in 14 days

## Step 3: Verify Integration

After PR is created:
1. **Check Actions** for successful workflow runs
2. **Verify branch exists** in Neon dashboard
3. **Close PR** to test automatic deletion
4. **Confirm branch deleted** from Neon after closing

## Expected Workflow Behavior:

### On PR Opened:
- Creates: `preview/pr-{PR_NUMBER}-{BRANCH_NAME}`
- Expires: 14 days from creation

### On PR Closed:
- Deletes: `preview/pr-{PR_NUMBER}-{BRANCH_NAME}`

## Troubleshooting:

If workflow fails:
1. Check Actions logs for errors
2. Verify secrets are correctly set
3. Confirm `NEON_PROJECT_ID` is a variable (not secret)
4. Ensure NEON_API_KEY has proper permissions
