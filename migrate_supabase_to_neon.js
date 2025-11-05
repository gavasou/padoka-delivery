#!/usr/bin/env node

/**
 * Supabase to Neon Migration Script
 * This script helps transfer data from Supabase to Neon (Netlify extension)
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

class SupabaseToNeonMigrator {
    constructor() {
        this.supabaseConfig = {
            host: process.env.SUPABASE_HOST,
            database: process.env.SUPABASE_DATABASE || 'postgres',
            user: process.env.SUPABASE_USER || 'postgres',
            password: process.env.SUPABASE_PASSWORD,
            port: process.env.SUPABASE_PORT || 5432,
        };

        this.neonConfig = {
            host: process.env.NEON_HOST,
            database: process.env.NEON_DATABASE,
            user: process.env.NEON_USER,
            password: process.env.NEON_PASSWORD,
            port: process.env.NEON_PORT || 5432,
            ssl: { rejectUnauthorized: false }
        };
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
            this.neonClient = new Client(this.neonConfig);
            await this.neonClient.connect();
            console.log('✅ Connected to Neon');
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

        // Get column info from first row
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
        const values = data.map(row => {
            return '(' + columns.map(col => {
                const value = row[col];
                if (value === null || value === undefined) {
                    return 'NULL';
                } else if (typeof value === 'string') {
                    return `'${value.replace(/'/g, "''")}'`;
                } else if (typeof value === 'boolean') {
                    return value ? 'TRUE' : 'FALSE';
                } else {
                    return value;
                }
            }).join(', ') + ')';
        }).join(', ');

        const insertQuery = `
            INSERT INTO "${tableName}" (${columns.join(', ')})
            VALUES ${values}
            ON CONFLICT (id) DO NOTHING;
        `;

        try {
            await this.neonClient.query(insertQuery);
            console.log(`✅ Inserted ${data.length} rows into ${tableName}`);
        } catch (error) {
            console.error(`❌ Failed to insert data into ${tableName}:`, error.message);
            throw error;
        }
    }

    async migrateTable(tableName) {
        try {
            console.log(`🔄 Migrating table: ${tableName}`);
            
            // Get data from Supabase
            const data = await this.getTableData(tableName);
            
            if (data.length === 0) {
                console.log(`⚠️  No data found in table: ${tableName}`);
                return;
            }

            // Create table in Neon
            await this.createTableInNeon(tableName, data);

            // Insert data into Neon
            await this.insertDataIntoNeon(tableName, data);
            
            console.log(`✅ Successfully migrated table: ${tableName}`);
        } catch (error) {
            console.error(`❌ Failed to migrate table ${tableName}:`, error.message);
            throw error;
        }
    }

    async migrateAllTables() {
        try {
            console.log('🚀 Starting migration from Supabase to Neon...\n');

            // Connect to both databases
            await this.connectToSupabase();
            await this.connectToNeon();

            // Get list of tables
            const tables = await this.getTableList();
            console.log(`📋 Found ${tables.length} tables to migrate\n`);

            // Migrate each table
            for (const table of tables) {
                await this.migrateTable(table);
                console.log(''); // Empty line for readability
            }

            console.log('🎉 Migration completed successfully!');
            
        } catch (error) {
            console.error('💥 Migration failed:', error.message);
            throw error;
        } finally {
            // Close connections
            if (this.supabaseClient) {
                await this.supabaseClient.end();
            }
            if (this.neonClient) {
                await this.neonClient.end();
            }
        }
    }
}

// Environment setup script
function createEnvExample() {
    const envExample = `# Supabase Configuration
SUPABASE_HOST=your-supabase-host.supabase.co
SUPABASE_DATABASE=postgres
SUPABASE_USER=postgres
SUPABASE_PASSWORD=your-supabase-password
SUPABASE_PORT=5432

# Neon Configuration (Netlify Extension)
NEON_HOST=your-neon-host.aws.neon.tech
NEON_DATABASE=your-neon-database
NEON_USER=your-neon-user
NEON_PASSWORD=your-neon-password
NEON_PORT=5432
`;

    fs.writeFileSync('.env.example', envExample);
    console.log('📝 Created .env.example file - please fill in your credentials');
}

// Usage instructions
function showUsage() {
    console.log(`
🔧 Usage Instructions:

1. First, create your Neon database on Netlify:
   - Go to your Netlify project
   - Extensions → Neon → Install
   - Create a new database

2. Get your connection strings:
   - Supabase: Project Settings → Database → Connection String
   - Neon: Database Settings → Connection String

3. Set up environment variables:
   - Copy .env.example to .env
   - Fill in your actual credentials

4. Install dependencies:
   npm install pg

5. Run the migration:
   node migrate_supabase_to_neon.js

⚠️  Make sure to:
   - Backup your Supabase data first
   - Test with a small database first
   - Verify all data after migration
`);
}

// Main execution
if (require.main === module) {
    showUsage();
    createEnvExample();
    
    const migrator = new SupabaseToNeonMigrator();
    
    // Check if environment variables are set
    if (!process.env.SUPABASE_HOST || !process.env.NEON_HOST) {
        console.log('\n❌ Please set your environment variables first');
        console.log('Check .env.example for required variables');
        process.exit(1);
    }
    
    migrator.migrateAllTables().catch(console.error);
}

module.exports = SupabaseToNeonMigrator;