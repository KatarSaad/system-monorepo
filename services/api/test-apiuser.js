const { Client } = require('pg');

const client = new Client({
  host: 'localhost',
  port: 5433,
  database: 'system_db',
  user: 'apiuser',
  password: 'password',
});

async function test() {
  try {
    await client.connect();
    console.log('✅ Connected successfully with apiuser');
    await client.end();
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
  }
}

test();