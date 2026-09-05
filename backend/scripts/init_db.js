require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { sequelize } = require('../config/sequelize');

async function initDb() {
  console.log('[init_db] Connecting to database...');
  await sequelize.authenticate();
  console.log('[init_db] Connected successfully.');

  const sqlPath = path.join(__dirname, '..', 'fashion_schema.sql');
  if (!fs.existsSync(sqlPath)) {
    console.error('[init_db] fashion_schema.sql not found at', sqlPath);
    process.exit(1);
  }

  const rawSql = fs.readFileSync(sqlPath, 'utf8');
  // Split statements by semicolon while ignoring comments and empty lines
  const statements = rawSql
    .replace(/--.*$/gm, '')
    .split(';')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  console.log(`[init_db] Executing ${statements.length} SQL statements...`);
  await sequelize.query('SET FOREIGN_KEY_CHECKS = 0;');

  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i];
    try {
      await sequelize.query(stmt);
    } catch (err) {
      console.warn(`[init_db] Warning on statement #${i + 1}: ${err.message}`);
    }
  }

  await sequelize.query('SET FOREIGN_KEY_CHECKS = 1;');
  console.log('[init_db] Database schema and seed data initialized successfully!');
  process.exit(0);
}

initDb().catch((err) => {
  console.error('[init_db] Fatal initialization error:', err);
  process.exit(1);
});
