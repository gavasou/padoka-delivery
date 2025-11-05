#!/bin/bash

echo "🚀 Quick Netlify Neon Migration"
echo "==============================="
echo ""

# Check if Supabase credentials are provided
if [ -z "$SUPABASE_HOST" ]; then
    echo "❌ Please set your Supabase environment variables:"
    echo ""
    echo "export SUPABASE_HOST='your-supabase-host'"
    echo "export SUPABASE_PASSWORD='your-supabase-password'"
    echo ""
    echo "Or create a .env file with:"
    echo "SUPABASE_HOST=your-host"
    echo "SUPABASE_PASSWORD=your-password"
    echo ""
    echo "Then run: source .env && bash quick_migrate.sh"
    exit 1
fi

echo "✅ Supabase credentials found"
echo "📋 Using host: $SUPABASE_HOST"
echo ""

# Check if migration script exists
if [ ! -f "migrate_netlify_neon.js" ]; then
    echo "❌ migrate_netlify_neon.js not found"
    echo "Please ensure you have the migration files"
    exit 1
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install pg --silent
fi

# Check NETLIFY_DATABASE_URL
if [ -z "$NETLIFY_DATABASE_URL" ]; then
    echo "⚠️  NETLIFY_DATABASE_URL not found"
    echo "Make sure your Netlify Neon extension is properly set up"
    echo "Continuing anyway..."
fi

echo "🚀 Starting migration..."
echo "========================"
echo ""

# Run the migration
node migrate_netlify_neon.js

echo ""
echo "🎉 Migration complete!"
echo ""
echo "Your app is now ready to use:"
echo "import { neon } from '@netlify/neon'"
echo "const sql = neon() // uses your migrated data!"
echo ""