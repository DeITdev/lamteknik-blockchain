#!/usr/bin/env node

/**
 * Password Hash Generator
 * Usage: node scripts/hash-password.js <password>
 * Example: node scripts/hash-password.js mypassword123
 */

const bcrypt = require('bcryptjs');

const password = process.argv[2];

if (!password) {
  console.error('❌ Password is required');
  console.log('\nUsage:');
  console.log('  node scripts/hash-password.js <password>');
  console.log('\nExample:');
  console.log('  node scripts/hash-password.js mypassword123');
  process.exit(1);
}

try {
  const hash = bcrypt.hashSync(password, 10);
  console.log('\n✅ Generated Hash:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`Password: ${password}`);
  console.log(`Hash:     ${hash}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('\n📋 Use this hash in your INSERT statement:');
  console.log(`INSERT INTO users (name, email, password, role, isActive)`);
  console.log(`VALUES ('Your Name', 'email@example.com', '${hash}', 'USER', 1);`);
  console.log();
} catch (error) {
  console.error('❌ Error generating hash:', error.message);
  process.exit(1);
}
