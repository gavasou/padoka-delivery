#!/usr/bin/env node

/**
 * Setup script to help configure Supabase to Neon migration
 */

const readline = require('readline');
const fs = require('fs');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.log(`
🚀 Supabase to Neon Migration Setup
===================================

This script will help you set up the migration from Supabase to Neon.

Let's get your connection details step by step:

`);

async function askQuestion(question) {
    return new Promise(resolve => {
        rl.question(question, answer => {
            resolve(answer.trim());
        });
    });
}

async function setup() {
    console.log('📋 STEP 1: Supabase Connection Details\n');
    
    const supabaseHost = await askQuestion('Supabase Host (e.g., abc123.supabase.co): ');
    const supabaseDb = await askQuestion('Supabase Database (usually "postgres"): ');
    const supabaseUser = await askQuestion('Supabase User (usually "postgres"): ');
    const supabasePassword = await askQuestion('Supabase Password: ');
    const supabasePort = await askQuestion('Supabase Port (usually 5432): ') || '5432';

    console.log('\n📋 STEP 2: Neon Connection Details\n');
    
    const neonHost = await askQuestion('Neon Host (e.g., your-db.aws.neon.tech): ');
    const neonDb = await askQuestion('Neon Database name: ');
    const neonUser = await askQuestion('Neon User: ');
    const neonPassword = await askQuestion('Neon Password: ');
    const neonPort = await askQuestion('Neon Port (usually 5432): ') || '5432';

    console.log('\n📋 STEP 3: Creating configuration files...\n');

    // Create .env file
    const envContent = `# Supabase Configuration
SUPABASE_HOST=${supabaseHost}
SUPABASE_DATABASE=${supabaseDb}
SUPABASE_USER=${supabaseUser}
SUPABASE_PASSWORD=${supabasePassword}
SUPABASE_PORT=${supabasePort}

# Neon Configuration
NEON_HOST=${neonHost}
NEON_DATABASE=${neonDb}
NEON_USER=${neonUser}
NEON_PASSWORD=${neonPassword}
NEON_PORT=${neonPort}
`;

    fs.writeFileSync('.env', envContent);
    console.log('✅ Created .env file with your credentials');

    // Create migration package.json
    const packageContent = `{
  "name": "supabase-to-neon-migration",
  "version": "1.0.0",
  "main": "migrate_supabase_to_neon.js",
  "scripts": {
    "migrate": "node migrate_supabase_to_neon.js"
  },
  "dependencies": {
    "pg": "^8.11.3"
  }
}`;
    
    fs.writeFileSync('package.json', packageContent);
    console.log('✅ Created package.json');

    console.log(`
🎯 SETUP COMPLETE!

Next steps:

1. Install dependencies:
   npm install

2. Run the migration:
   npm run migrate

3. The script will:
   - Connect to both databases
   - Create tables in Neon
   - Transfer all your data
   - Report progress for each table

⚠️  IMPORTANT NOTES:
   - Make sure your Neon database is empty (or we use ON CONFLICT)
   - Test with a small table first
   - Backup your Supabase data before starting

Ready to proceed? The migration will start automatically after installation.
`);

    rl.close();
}

setup().catch(console.error);