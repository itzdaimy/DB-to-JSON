const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

const files = fs.readdirSync(__dirname);
const dbFile = files.find(file => path.extname(file) === '.db');

if (!dbFile) {
    console.error('❌ No .db file found in the current directory.');
    process.exit(1);
}

console.log(`📁 Found database: ${dbFile}`);

const db = new Database(path.join(__dirname, dbFile));

const tables = db.prepare(`
    SELECT name FROM sqlite_master
    WHERE type='table' AND name NOT LIKE 'sqlite_%';
`).all();

if (tables.length === 0) {
    console.error('❌ No tables found in the database.');
    process.exit(1);
}

const output = {};

for (const { name } of tables) {
    const rows = db.prepare(`SELECT * FROM "${name}"`).all();
    output[name] = rows;
    console.log(`✅ Exported table: ${name} (${rows.length} rows)`);
}

fs.writeFileSync('db.json', JSON.stringify(output, null, 2));
console.log('💾 Exported database to db.json');
