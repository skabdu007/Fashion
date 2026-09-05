const { sequelize } = require('../config/sequelize');
const fs = require('fs');
const path = require('path');

async function dump() {
  const [tables] = await sequelize.query("SHOW FULL TABLES WHERE Table_type = 'BASE TABLE'");
  let sql = '-- Fashion E-Commerce & Live Auction Platform Database Dump\n';
  sql += '-- Generated for Cloud Hosting & phpMyAdmin Parity\n\n';
  sql += 'SET FOREIGN_KEY_CHECKS = 0;\n\n';

  for (const tableObj of tables) {
    const tableName = Object.values(tableObj)[0];
    const [[createRes]] = await sequelize.query(`SHOW CREATE TABLE \`${tableName}\``);
    const createSql = createRes['Create Table'];
    sql += '-- --------------------------------------------------------\n';
    sql += `-- Table structure for table \`${tableName}\`\n`;
    sql += '-- --------------------------------------------------------\n';
    sql += `DROP TABLE IF EXISTS \`${tableName}\`;\n`;
    sql += createSql + ';\n\n';

    const [rows] = await sequelize.query(`SELECT * FROM \`${tableName}\``);
    if (rows.length > 0) {
      sql += `-- Dumping data for table \`${tableName}\`\n`;
      const keys = Object.keys(rows[0]);
      const keyList = keys.map((k) => `\`${k}\``).join(', ');

      const valLines = rows.map((row) => {
        const vals = keys.map((k) => {
          const v = row[k];
          if (v === null || v === undefined) return 'NULL';
          if (typeof v === 'number') return v;
          if (typeof v === 'boolean') return v ? 1 : 0;
          if (v instanceof Date) return `'${v.toISOString().slice(0, 19).replace('T', ' ')}'`;
          const escaped = String(v).replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n');
          return `'${escaped}'`;
        });
        return `(${vals.join(', ')})`;
      });

      sql += `INSERT INTO \`${tableName}\` (${keyList}) VALUES\n${valLines.join(',\n')};\n\n`;
    }
  }

  sql += 'SET FOREIGN_KEY_CHECKS = 1;\n';
  const outPath = path.join(__dirname, '..', 'fashion_schema.sql');
  fs.writeFileSync(outPath, sql, 'utf8');
  console.log(`Saved SQL dump to ${outPath} (${sql.length} bytes)`);
  process.exit(0);
}

dump().catch((err) => {
  console.error(err);
  process.exit(1);
});
