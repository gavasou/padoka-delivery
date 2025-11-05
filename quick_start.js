#!/usr/bin/env node

/**
 * Quick Start Migration - For users who have both databases ready
 */

const readline = require('readline');
const fs = require('fs');
const { exec } = require('child_process');
const path = require('path');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.log(`
🚀 Quick Start: Supabase to Neon Migration
==========================================

Since you have both databases ready, let's get started!

`);

async function askQuestion(question) {
    return new Promise(resolve => {
        rl.question(question, answer => {
            resolve(answer.trim());
        });
    });
}

async function quickSetup() {
    console.log('📋 Let\'s get your connection details...\n');

    // Supabase connection
    console.log('🔗 SUPABASE CONNECTION:');
    const supabaseHost = await askQuestion('Supabase Host (e.g., abc123.supabase.co): ');
    const supabasePassword = await askQuestion('Supabase Password: ');

    // Neon connection  
    console.log('\n🔗 NEON CONNECTION:');
    const neonHost = await askQuestion('Neon Host (e.g., xyz789.aws.neon.tech): ');
    const neonDb = await askQuestion('Neon Database name: ');
    const neonUser = await askQuestion('Neon User: ');
    const neonPassword = await askQuestion('Neon Password: ');

    console.log('\n⚙️  Creating configuration...');

    // Create .env file
    const envContent = `# Supabase Configuration
SUPABASE_HOST=${supabaseHost}
SUPABASE_DATABASE=postgres
SUPABASE_USER=postgres
SUPABASE_PASSWORD=${supabasePassword}
SUPABASE_PORT=5432

# Neon Configuration  
NEON_HOST=${neonHost}
NEON_DATABASE=${neonDb}
NEON_USER=${neonUser}
NEON_PASSWORD=${neonPassword}
NEON_PORT=5432
`;

    fs.writeFileSync('.env', envContent);
    console.log('✅ Configuration created!');

    // Create package.json for migration
    const packageContent = `{
  "name": "padoka-migration",
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
    console.log('✅ Package configuration created!');

    console.log(`
🎯 READY TO MIGRATE!

Your Padoka Delivery data will be transferred from Supabase to Neon.

Next steps:
1. Install dependencies: npm install
2. Test connections: node test_connections.js  
3. Start migration: npm run migrate

Would you like to continue with the installation and migration now? (y/n)
`);

    const continue = await askQuestion('Continue? ');

    if (continue.toLowerCase() === 'y' || continue.toLowerCase() === 'yes') {
        console.log('\n📦 Installing dependencies...');
        
        exec('npm install pg', (error, stdout, stderr) => {
            if (error) {
                console.error('❌ Installation failed:', error.message);
                return;
            }
            
            console.log('✅ Dependencies installed successfully!');
            console.log('\n🧪 Testing connections...');
            
            // Test connections first
            exec('node test_connections.js', (error, stdout, stderr) => {
                if (error) {
                    console.error('❌ Connection test failed:', error.message);
                    console.log('Please check your credentials and try again.');
                    rl.close();
                    return;
                }
                
                console.log(stdout);
                
                console.log('\n🚀 Starting migration...');
                
                // Run migration
                exec('node migrate_supabase_to_neon.js', (error, stdout, stderr) => {
                    if (error) {
                        console.error('❌ Migration failed:', error.message);
                    } else {
                        console.log('✅ Migration completed successfully!');
                        console.log(stdout);
                    }
                    
                    console.log(`
🎉 Migration Complete!

Your Padoka Delivery data has been transferred to Neon.
Next steps:
1. Update your Netlify environment variables to use Neon
2. Update your application's connection string
3. Test your application thoroughly
`);

                    rl.close();
                });
            });
        });
    } else {
        console.log(`
📋 MANUAL STEPS:
1. npm install pg
2. node test_connections.js
3. npm run migrate

Thanks for using the migration tool!
`);
        rl.close();
    }
}

quickSetup().catch(console.error);