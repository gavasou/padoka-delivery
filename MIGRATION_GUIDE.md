# 🔄 Supabase to Neon Migration Guide

This guide will help you transfer all your data from Supabase to Neon (Netlify extension).

## 📋 What You Need

- Your **Supabase project** connection details
- A **Neon database** (created via Netlify extension)
- Node.js 16+ installed on your computer

## 🚀 Quick Start (Automated)

### Option 1: Interactive Setup (Recommended)
```bash
# 1. Run the interactive setup
node setup.js

# 2. Follow the prompts to enter your connection details
# 3. Install dependencies
npm install

# 4. Run the migration
npm run migrate
```

### Option 2: Manual Setup
```bash
# 1. Copy the migration files to your project
cp migrate_supabase_to_neon.js your-project/
cp migration_package.json your-project/package.json

# 2. Install dependencies
npm install pg

# 3. Create .env file with your credentials (see .env.example)
# 4. Run the migration
node migrate_supabase_to_neon.js
```

## 📖 Step-by-Step Manual Process

### Step 1: Create Neon Database on Netlify

1. **Go to your Netlify project dashboard**
2. **Install Neon Extension:**
   - Extensions tab → Find "Neon" → Install
3. **Create Database:**
   - Click "Create Database"
   - Choose your plan (free tier available)
   - Name your database

### Step 2: Get Connection Strings

#### Supabase Connection String:
1. Go to your Supabase project
2. Settings → Database
3. Copy the **Connection string** (without the prompt)
4. Extract these details:
   - Host: `abc123.supabase.co`
   - Database: `postgres`
   - User: `postgres`
   - Password: `[your-password]`

#### Neon Connection String:
1. Go to your Neon database dashboard
2. Settings → Connection string
3. Copy the **Connection string** (without the prompt)
4. Extract these details:
   - Host: `xyz789.aws.neon.tech`
   - Database: `[your-db-name]`
   - User: `[your-user]`
   - Password: `[your-password]`

### Step 3: Configure Environment Variables

Create a `.env` file:
```env
# Supabase Configuration
SUPABASE_HOST=abc123.supabase.co
SUPABASE_DATABASE=postgres
SUPABASE_USER=postgres
SUPABASE_PASSWORD=your-supabase-password
SUPABASE_PORT=5432

# Neon Configuration
NEON_HOST=xyz789.aws.neon.tech
NEON_DATABASE=your-neon-database
NEON_USER=your-neon-user
NEON_PASSWORD=your-neon-password
NEON_PORT=5432
```

### Step 4: Run Migration

```bash
# Install dependencies
npm install pg

# Run the migration
node migrate_supabase_to_neon.js
```

## 📊 What the Migration Does

The script will:

1. **Connect to both databases**
2. **Get list of all tables** from Supabase
3. **For each table:**
   - Create the table in Neon (if it doesn't exist)
   - Transfer all data from Supabase to Neon
   - Handle data type conversion automatically
   - Show progress for each table

4. **Handle conflicts:** Uses `ON CONFLICT (id) DO NOTHING` to skip duplicates

## 🔍 Connection String Formats

### Supabase Format:
```
postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres
```

### Neon Format:
```
postgresql://[USER]:[PASSWORD]@[HOST]/[DATABASE]?sslmode=require
```

## 🛠️ Troubleshooting

### Common Issues:

**❌ "Connection refused"**
- Check your firewall settings
- Verify the connection strings are correct
- Make sure your IP is allowed (Neon)

**❌ "Database does not exist"**
- Verify the database name in your connection string
- Make sure the database was created properly

**❌ "Permission denied"**
- Check your username and password
- Verify you have read/write access to both databases

**❌ "SSL required"**
- Add `?sslmode=require` to your Neon connection string
- Or add `ssl: { rejectUnauthorized: false }` to the config

### Data Type Mappings:

| Supabase Type | Neon Type | Auto-Converted |
|---------------|-----------|----------------|
| `text`        | `TEXT`    | ✅ Yes         |
| `integer`     | `INTEGER` | ✅ Yes         |
| `numeric`     | `DECIMAL` | ✅ Yes         |
| `boolean`     | `BOOLEAN` | ✅ Yes         |
| `timestamp`   | `TIMESTAMP` | ✅ Yes       |
| `date`        | `DATE`    | ✅ Yes         |
| `json`        | `JSON`    | ✅ Yes         |

## ⚡ Performance Tips

1. **Large Databases:** For very large databases (>100k rows), consider:
   - Running migration during off-peak hours
   - Migrating tables one by one
   - Using database backup tools for very large datasets

2. **Network Issues:** If connection drops:
   - The script will show which tables succeeded
   - Re-run for tables that failed
   - Use `ON CONFLICT` to prevent duplicates

3. **Testing:** Always test with a small table first:
   - Create a test table in both databases
   - Migrate just that table to verify everything works

## 🔒 Security Notes

- ✅ Your credentials are stored locally in `.env`
- ✅ Passwords are never logged or exposed
- ✅ All connections use SSL when available
- ✅ The script uses prepared statements for safety

## 📞 Need Help?

If you encounter issues:

1. **Check the console output** for specific error messages
2. **Verify connection strings** are correct
3. **Test connections individually** before running migration
4. **Contact support** if you need additional help

## 🎉 After Migration

Once migration is complete:

1. **Update your application** to use Neon connection string
2. **Update environment variables** in Netlify
3. **Test your application** thoroughly
4. **Keep Supabase backup** for a few days as backup

---

**Created by MiniMax Agent** | Ready to migrate your data! 🚀