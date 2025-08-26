const { Client } = require('pg');

const client = new Client({
  host: 'localhost',
  port: 5433,
  database: 'system_db',
  user: 'postgres',
  password: 'password',
});

async function testConnection() {
  try {
    await client.connect();
    console.log('✅ Database connection successful!');
    const result = await client.query('SELECT version()');
    console.log('Database version:', result.rows[0].version);
    await client.end();
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
  }
}

testConnection();