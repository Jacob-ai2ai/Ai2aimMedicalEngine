#!/usr/bin/env node

/**
 * Setup Verification Script
 * Checks if the project is properly configured
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying AI2AIM RX Setup...\n');

let errors = [];
let warnings = [];

// Check .env.local exists
const envLocalPath = path.join(process.cwd(), '.env.local');
if (!fs.existsSync(envLocalPath)) {
  errors.push('❌ .env.local file not found. Create it from .env.local.example');
} else {
  console.log('✅ .env.local file exists');
  
  // Check for placeholder values
  const envContent = fs.readFileSync(envLocalPath, 'utf8');
  if (envContent.includes('placeholder')) {
    warnings.push('⚠️  .env.local contains placeholder values. Update with real credentials.');
  } else {
    console.log('✅ .env.local appears to be configured');
  }
}

// Check node_modules
const nodeModulesPath = path.join(process.cwd(), 'node_modules');
if (!fs.existsSync(nodeModulesPath)) {
  errors.push('❌ node_modules not found. Run: npm install');
} else {
  console.log('✅ Dependencies installed');
}

// Check key directories
const requiredDirs = [
  'src/app',
  'src/components',
  'src/lib',
  'supabase/migrations'
];

requiredDirs.forEach(dir => {
  const dirPath = path.join(process.cwd(), dir);
  if (!fs.existsSync(dirPath)) {
    errors.push(`❌ Required directory missing: ${dir}`);
  }
});

if (requiredDirs.every(dir => fs.existsSync(path.join(process.cwd(), dir)))) {
  console.log('✅ Project structure is correct');
}

// Check migration files
const migrationsPath = path.join(process.cwd(), 'supabase/migrations');
if (fs.existsSync(migrationsPath)) {
  const migrations = fs.readdirSync(migrationsPath).filter(f => f.endsWith('.sql'));
  if (migrations.length > 0) {
    console.log(`✅ Found ${migrations.length} migration file(s)`);
  } else {
    warnings.push('⚠️  No migration files found');
  }
}

// Summary
console.log('\n📊 Summary:\n');

if (errors.length === 0 && warnings.length === 0) {
  console.log('✅ Setup looks good! You can proceed with:\n');
  console.log('   1. Set up Supabase project');
  console.log('   2. Run database migrations');
  console.log('   3. Create first user');
  console.log('   4. Run: npm run dev\n');
  console.log('See QUICK_START.md for detailed instructions.');
} else {
  if (errors.length > 0) {
    console.log('❌ Errors found:');
    errors.forEach(err => console.log(`   ${err}`));
    console.log('');
  }
  
  if (warnings.length > 0) {
    console.log('⚠️  Warnings:');
    warnings.forEach(warn => console.log(`   ${warn}`));
    console.log('');
  }
}

process.exit(errors.length > 0 ? 1 : 0);
