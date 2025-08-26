const { Client } = require('pg');

const client = new Client({
  host: 'localhost',
  port: 5433,
  database: 'system_db',
  user: 'postgres'
});

client.connect()
  .then(() => {
    console.log('✅ Connected!');
    return client.query('SELECT version()');
  })
  .then(result => {
    console.log('Version:', result.rows[0].version);
    client.end();
  })
  .catch(err => {
    console.error('❌ Error:', err.message);
  });