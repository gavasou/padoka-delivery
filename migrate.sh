#!/bin/bash

echo "🚀 Supabase to Neon Migration Tool"
echo "=================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    echo "Visit: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js found: $(node --version)"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ npm found: $(npm --version)"
echo ""

# Ask user what they want to do
echo "What would you like to do?"
echo "1) Interactive setup (recommended for first-time users)"
echo "2) Test database connections"
echo "3) Run full migration"
echo "4) Exit"
echo ""
read -p "Enter your choice (1-4): " choice

case $choice in
    1)
        echo ""
        echo "🔧 Running interactive setup..."
        node setup.js
        ;;
    2)
        echo ""
        echo "🧪 Testing connections..."
        node test_connections.js
        ;;
    3)
        echo ""
        echo "🚀 Starting migration..."
        
        # Check if .env file exists
        if [ ! -f .env ]; then
            echo "❌ .env file not found. Please run setup first (option 1)"
            exit 1
        fi
        
        # Check if dependencies are installed
        if [ ! -d node_modules ]; then
            echo "📦 Installing dependencies..."
            npm install
        fi
        
        node migrate_supabase_to_neon.js
        ;;
    4)
        echo "👋 Goodbye!"
        exit 0
        ;;
    *)
        echo "❌ Invalid choice. Please run the script again."
        exit 1
        ;;
esac