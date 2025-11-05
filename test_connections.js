#!/usr/bin/env node

/**
 * Database Connection Test Script
 * Tests connections to both Supabase and Neon before migration
 */

const { Client } = require('pg');

async function testConnection(config, name) {
    console.log(`\n🔗 Testing ${name} connection...`);
    
    const client = new Client({
        host: config.host,
        database: config.database,
        user: config.user,
        password: config.password,
        port: config.port || 5432,
        ssl: config.ssl || false
    });

    try {
        await client.connect();
        console.log(`✅ ${name} connection successful!`);
        
        // Test with a simple query
        const result = await client.query('SELECT current_database(), current_user, version();');
        console.log(`   Database: ${result.rows[0].current_database}`);
        console.log(`   User: ${result.rows[0].current_user}`);
        console.log(`   Version: ${result.rows[0].version.split(',')[0]}`);
        
        return true;
    } catch (error) {
        console.error(`❌ ${name} connection failed:`, error.message);
        return false;
    } finally {
        await client.end();
    }
}

async function testSupabase() {
    const supabaseConfig = {
        host: process.env.SUPABASE_HOST,
        database: process.env.SUPABASE_DATABASE || 'postgres',
        user: process.env.SUPABASE_USER || 'postgres',
        password: process.env.SUPABASE_PASSWORD,
        port: process.env.SUPABASE_PORT || 5432,
    };

    return testConnection(supabaseConfig, 'Supabase');
}

async function testNeon() {
    const neonConfig = {
        host: process.env.NEON_HOST,
        database: process.env.NEON_DATABASE,
        user: process.env.NEON_USER,
        password: process.env.NEON_PASSWORD,
        port: process.env.NEON_PORT || 5432,
        ssl: { rejectUnauthorized: false }
    };

    return testConnection(neonConfig, 'Neon');
}

async function runTests() {
    console.log('🧪 Database Connection Tests');
    console.log('===========================\n');

    // Check if environment variables are set
    const requiredEnvVars = [
        'SUPABASE_HOST', 'SUPABASE_PASSWORD',
        'NEON_HOST', 'NEON_DATABASE', 'NEON_USER', 'NEON_PASSWORD'
    ];

    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
        console.log('❌ Missing environment variables:');
        missingVars.forEach(varName => console.log(`   - ${varName}`));
        console.log('\nPlease set all required variables in your .env file');
        process.exit(1);
    }

    // Test both connections
    const supabaseOk = await testSupabase();
    const neonOk = await testNeon();

    console.log('\n📊 Test Results:');
    console.log('================');
    console.log(`Supabase: ${supabaseOk ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Neon:     ${neonOk ? '✅ PASS' : '❌ FAIL'}`);

    if (supabaseOk && neonOk) {
        console.log('\n🎉 All connections successful! You can now run the migration.');
        console.log('Run: npm run migrate');
    } else {
        console.log('\n⚠️  Some connections failed. Please fix the issues before migrating.');
        process.exit(1);
    }
}

// Show usage if run directly
if (require.main === module) {
    if (!process.env.SUPABASE_HOST) {
        console.log('🔧 Usage:');
        console.log('1. Copy .env.example to .env');
        console.log('2. Fill in your connection details');
        console.log('3. Run: node test_connections.js');
        console.log('');
    }
    
    runTests().catch(console.error);
}

module.exports = { testSupabase, testNeon };