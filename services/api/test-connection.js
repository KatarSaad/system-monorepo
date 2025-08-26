const { Client } = require('pg');

const client = new Client({
  host: 'localhost',
  port: 5433,
  database: 'system_db',
  user: 'postgres',
  password: 'password',
});

async function test() {
  try {
    await client.connect();
    console.log('✅ Connected successfully');
    const result = await client.query('SELECT version()');
    console.log('Version:', result.rows[0].version);
    await client.end();
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.error('Error code:', error.code);
  }
}

test();