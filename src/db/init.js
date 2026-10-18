// One-time database setup: creates the tables from schema.sql.
// Run with: npm run init-db
const fs = require('fs');
const path = require('path');
const db = require('./db');

try {
  const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
  db.exec(schema);
  console.log('✅  Database and tables ready.');
} catch (err) {
  console.error('❌  Failed to initialise database:', err.message);
  process.exitCode = 1;
}
