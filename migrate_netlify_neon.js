#!/usr/bin/env node

/**
 * Supabase to Neon Migration (Netlify Neon Integration)
 * Optimized for @netlify/neon package
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

class SupabaseToNetlifyNeonMigrator {
    constructor() {
        // Only need Supabase config for migration
        this.supabaseConfig = {
            host: process.env.SUPABASE_HOST,
            database: process.env.SUPABASE_DATABASE || 'postgres',
            user: process.env.SUPABASE_USER || 'postgres',
            password: process.env.SUPABASE_PASSWORD,
            port: process.env.SUPABASE_PORT || 5432,
        };

        // Get Neon connection from Netlify environment
        this.neonUrl = process.env.NETLIFY_DATABASE_URL || process.env.DATABASE_URL;
        if (this.neonUrl) {
            console.log('✅ Found Netlify Database URL');
            console.log(`   Using: ${this.neonUrl.split('@')[1] || 'Neon database'}`);
        } else {
            console.log('⚠️  NETLIFY_DATABASE_URL not found, using manual config');
        }
    }

    async connectToSupabase() {
        try {
            this.supabaseClient = new Client(this.supabaseConfig);
            await this.supabaseClient.connect();
            console.log('✅ Connected to Supabase');
        } catch (error) {
            console.error('❌ Failed to connect to Supabase:', error.message);
            throw error;
        }
    }

    async connectToNeon() {
        try {
            // Parse NETLIFY_DATABASE_URL or use manual config
            let neonConfig;
            
            if (this.neonUrl) {
                // Parse the URL format: postgresql://user:password@host/database
                const urlMatch = this.neonUrl.match(/postgresql:\/\/([^:]+):([^@]+)@([^:]+):?(\d+)?\/([^?]+)/);
                if (urlMatch) {
                    const [, user, password, host, port = '5432', database] = urlMatch;
                    neonConfig = {
                        host,
                        database,
                        user,
                        password,
                        port: parseInt(port),
                        ssl: { rejectUnauthorized: false }
                    };
                } else {
                    throw new Error('Invalid NETLIFY_DATABASE_URL format');
                }
            } else {
                // Fallback to manual config
                neonConfig = {
                    host: process.env.NEON_HOST,
                    database: process.env.NEON_DATABASE,
                    user: process.env.NEON_USER,
                    password: process.env.NEON_PASSWORD,
                    port: process.env.NEON_PORT || 5432,
                    ssl: { rejectUnauthorized: false }
                };
            }

            this.neonClient = new Client(neonConfig);
            await this.neonClient.connect();
            console.log('✅ Connected to Neon (Netlify)');
        } catch (error) {
            console.error('❌ Failed to connect to Neon:', error.message);
            throw error;
        }
    }

    async getTableList() {
        try {
            const query = `
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_type = 'BASE TABLE'
                ORDER BY table_name;
            `;
            
            const result = await this.supabaseClient.query(query);
            return result.rows.map(row => row.table_name);
        } catch (error) {
            console.error('❌ Failed to get table list:', error.message);
            throw error;
        }
    }

    async getTableData(tableName) {
        try {
            const query = `SELECT * FROM ${tableName};`;
            const result = await this.supabaseClient.query(query);
            return result.rows;
        } catch (error) {
            console.error(`❌ Failed to get data from ${tableName}:`, error.message);
            throw error;
        }
    }

    async createTableInNeon(tableName, data) {
        if (data.length === 0) return;

        const columns = Object.keys(data[0]);
        const columnDefinitions = columns.map(col => {
            const value = data[0][col];
            let type = 'TEXT';
            
            if (typeof value === 'number') {
                type = Number.isInteger(value) ? 'INTEGER' : 'DECIMAL';
            } else if (typeof value === 'boolean') {
                type = 'BOOLEAN';
            } else if (value instanceof Date) {
                type = 'TIMESTAMP';
            } else if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)) {
                type = 'DATE';
            } else if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(value)) {
                type = 'TIMESTAMP';
            } else if (typeof value === 'string' && /^\{.*\}$/.test(value)) {
                type = 'JSONB';
            }
            
            return `"${col}" ${type}`;
        }).join(', ');

        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS "${tableName}" (
                ${columnDefinitions}
            );
        `;

        try {
            await this.neonClient.query(createTableQuery);
            console.log(`✅ Created table: ${tableName}`);
        } catch (error) {
            console.error(`❌ Failed to create table ${tableName}:`, error.message);
            throw error;
        }
    }

    async insertDataIntoNeon(tableName, data) {
        if (data.length === 0) return;

        const columns = Object.keys(data[0]);
        
        // Batch insert for better performance
        const batchSize = 100;
        for (let i = 0; i < data.length; i += batchSize) {
            const batch = data.slice(i, i + batchSize);
            
            const values = batch.map(row => {
                return '(' + columns.map(col => {
                    const value = row[col];
                    if (value === null || value === undefined) {
                        return 'NULL';
                    } else if (typeof value === 'string') {
                        return `'${value.replace(/'/g, "''")}'`;
                    } else if (typeof value === 'boolean') {
                        return value ? 'TRUE' : 'FALSE';
                    } else if (typeof value === 'object') {
                        return `'${JSON.stringify(value).replace(/'/g, "''")}'::jsonb`;
                    } else {
                        return value;
                    }
                }).join(', ') + ')';
            }).join(', ');

            const insertQuery = `
                INSERT INTO "${tableName}" (${columns.join(', ')})
                VALUES ${values}
                ON CONFLICT (id) DO UPDATE SET
                ${columns.map(col => `"${col}" = EXCLUDED."${col}"`).join(', ')};
            `;

            try {
                await this.neonClient.query(insertQuery);
            } catch (error) {
                // If conflict handling fails, use simpler approach
                const simpleInsert = `
                    INSERT INTO "${tableName}" (${columns.join(', ')})
                    VALUES ${values}
                    ON CONFLICT (id) DO NOTHING;
                `;
                await this.neonClient.query(simpleInsert);
            }
        }

        console.log(`✅ Inserted ${data.length} rows into ${tableName}`);
    }

    async migrateTable(tableName) {
        try {
            console.log(`🔄 Migrating table: ${tableName}`);
            
            const data = await this.getTableData(tableName);
            
            if (data.length === 0) {
                console.log(`⚠️  No data found in table: ${tableName}`);
                return;
            }

            await this.createTableInNeon(tableName, data);
            await this.insertDataIntoNeon(tableName, data);
            
            console.log(`✅ Successfully migrated table: ${tableName}`);
        } catch (error) {
            console.error(`❌ Failed to migrate table ${tableName}:`, error.message);
            throw error;
        }
    }

    async migrateAllTables() {
        try {
            console.log('🚀 Starting Supabase to Netlify Neon migration...\n');

            await this.connectToSupabase();
            await this.connectToNeon();

            const tables = await this.getTableList();
            console.log(`📋 Found ${tables.length} tables to migrate\n`);

            let successCount = 0;
            let failCount = 0;

            for (const table of tables) {
                try {
                    await this.migrateTable(table);
                    successCount++;
                } catch (error) {
                    console.error(`❌ Failed to migrate ${table}:`, error.message);
                    failCount++;
                }
                console.log(''); // Empty line for readability
            }

            console.log('🎉 Migration Summary:');
            console.log('====================');
            console.log(`✅ Successfully migrated: ${successCount} tables`);
            console.log(`❌ Failed migrations: ${failCount} tables`);
            
            if (failCount === 0) {
                console.log('\n🎉 All data migrated successfully to Netlify Neon!');
                console.log('Your app will now use @netlify/neon with the migrated data.');
            }
            
        } catch (error) {
            console.error('💥 Migration failed:', error.message);
            throw error;
        } finally {
            if (this.supabaseClient) {
                await this.supabaseClient.end();
            }
            if (this.neonClient) {
                await this.neonClient.end();
            }
        }
    }
}

// Show usage
function showUsage() {
    console.log(`
🔧 Usage for @netlify/neon migration:

1. Set up environment variables:
   SUPABASE_HOST=your-supabase-host
   SUPABASE_DATABASE=postgres
   SUPABASE_USER=postgres
   SUPABASE_PASSWORD=your-supabase-password
   
   # Netlify will set NETLIFY_DATABASE_URL automatically

2. Run migration:
   node migrate_netlify_neon.js

The migration will:
- Connect to Supabase and Netlify Neon
- Transfer all your data
- Use @netlify/neon compatible schema
- Handle JSON/JSONB properly
`);
}

// Main execution
if (require.main === module) {
    if (!process.env.SUPABASE_HOST) {
        showUsage();
        process.exit(1);
    }
    
    const migrator = new SupabaseToNetlifyNeonMigrator();
    migrator.migrateAllTables().catch(console.error);
}

module.exports = SupabaseToNetlifyNeonMigrator;