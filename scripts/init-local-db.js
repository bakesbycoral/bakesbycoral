// Initialize local SQLite database with schema
const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '..', '.dev.db');
const schemaPath = path.join(__dirname, '..', 'src', 'lib', 'db', 'schema.sql');
const seedPath = path.join(__dirname, '..', 'src', 'lib', 'db', 'seed.sql');

console.log('Initializing local database at:', dbPath);

// Delete existing database to start fresh
if (fs.existsSync(dbPath)) {
  fs.unlinkSync(dbPath);
  console.log('Removed existing database');
}

// Create or open database
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Read and execute schema
if (fs.existsSync(schemaPath)) {
  console.log('Applying schema...');
  const schema = fs.readFileSync(schemaPath, 'utf-8');

  // Remove comments and split carefully
  const cleanSchema = schema
    .replace(/--.*$/gm, '') // Remove single-line comments
    .replace(/\n\s*\n/g, '\n') // Remove empty lines
    .trim();

  // Use better-sqlite3's exec for running the whole script at once
  try {
    db.exec(cleanSchema);
    console.log('Schema applied successfully');
  } catch (error) {
    console.error('Schema error:', error.message);
    process.exit(1);
  }
} else {
  console.error('Schema file not found:', schemaPath);
  process.exit(1);
}

// Optionally seed with test data
if (process.argv.includes('--seed') && fs.existsSync(seedPath)) {
  console.log('Applying seed data...');
  const seed = fs.readFileSync(seedPath, 'utf-8');

  const cleanSeed = seed
    .replace(/--.*$/gm, '')
    .replace(/\n\s*\n/g, '\n')
    .trim();

  try {
    db.exec(cleanSeed);
    console.log('Seed data applied');
  } catch (error) {
    // Some seed data might fail on duplicate keys
    if (!error.message.includes('UNIQUE constraint failed')) {
      console.error('Seed error:', error.message);
    } else {
      console.log('Seed data applied (some duplicates skipped)');
    }
  }
}

// Show tables
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").all();
console.log('\nTables in database:');
tables.forEach(t => console.log('  -', t.name));

// Show row counts
console.log('\nRow counts:');
for (const table of tables) {
  if (table.name.startsWith('sqlite_')) continue;
  const count = db.prepare(`SELECT COUNT(*) as count FROM ${table.name}`).get();
  console.log(`  - ${table.name}: ${count.count} rows`);
}

db.close();
console.log('\nLocal database ready!');
