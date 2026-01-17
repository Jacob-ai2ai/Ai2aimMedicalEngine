#!/usr/bin/env node

/**
 * Complete Setup Verification Script
 * Verifies all components of the AI2AIM RX platform are configured correctly
 */

const fs = require('fs');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkFile(filePath, description) {
  const exists = fs.existsSync(filePath);
  if (exists) {
    log(`  ✅ ${description}`, 'green');
    return true;
  } else {
    log(`  ❌ ${description} - MISSING`, 'red');
    return false;
  }
}

function checkEnvVar(envContent, varName, description) {
  const exists = envContent.includes(varName);
  if (exists) {
    log(`  ✅ ${description}`, 'green');
    return true;
  } else {
    log(`  ❌ ${description} - MISSING`, 'red');
    return false;
  }
}

function main() {
  log('\n🚀 AI2AIM RX - Complete Setup Verification\n', 'cyan');
  log('='.repeat(50), 'cyan');
  
  let allChecks = true;
  const checks = {
    files: 0,
    env: 0,
    config: 0,
  };

  // Check essential files
  log('\n📁 Essential Files:', 'blue');
  if (checkFile('package.json', 'package.json')) checks.files++;
  if (checkFile('next.config.js', 'next.config.js')) checks.files++;
  if (checkFile('tsconfig.json', 'tsconfig.json')) checks.files++;
  if (checkFile('tailwind.config.ts', 'tailwind.config.ts')) checks.files++;
  if (checkFile('Dockerfile', 'Dockerfile')) checks.files++;
  if (checkFile('docker-compose.yml', 'docker-compose.yml')) checks.files++;
  if (checkFile('.env.local', '.env.local')) checks.files++;
  if (checkFile('supabase/migrations/001_initial_schema.sql', 'Migration 001')) checks.files++;
  if (checkFile('supabase/migrations/002_ai_agents_data.sql', 'Migration 002')) checks.files++;
  if (checkFile('supabase/migrations/004_rag_functions.sql', 'Migration 004')) checks.files++;

  // Check environment variables
  log('\n🔐 Environment Variables:', 'blue');
  let envContent = '';
  try {
    envContent = fs.readFileSync('.env.local', 'utf8');
  } catch (e) {
    log('  ⚠️  .env.local not readable', 'yellow');
  }

  if (envContent) {
    if (checkEnvVar(envContent, 'NEXT_PUBLIC_SUPABASE_URL', 'Supabase URL')) checks.env++;
    if (checkEnvVar(envContent, 'NEXT_PUBLIC_SUPABASE_ANON_KEY', 'Supabase Anon Key')) checks.env++;
    if (checkEnvVar(envContent, 'DATABASE_URL', 'Database URL')) checks.env++;
    if (checkEnvVar(envContent, 'NEXT_PUBLIC_BUILDER_API_KEY', 'Builder.io API Key')) checks.env++;
    if (checkEnvVar(envContent, 'GEMINI_API_KEY', 'Gemini API Key')) checks.env++;
    if (checkEnvVar(envContent, 'SERP_API_KEY', 'SERP API Key')) checks.env++;
  }

  // Check configuration
  log('\n⚙️  Configuration:', 'blue');
  
  // Check Next.js config
  try {
    const nextConfig = fs.readFileSync('next.config.js', 'utf8');
    if (nextConfig.includes("output: 'standalone'")) {
      log('  ✅ Next.js standalone output enabled', 'green');
      checks.config++;
    } else {
      log('  ⚠️  Next.js standalone output not enabled', 'yellow');
    }
  } catch (e) {
    log('  ❌ Cannot read next.config.js', 'red');
  }

  // Check if node_modules exists
  if (fs.existsSync('node_modules')) {
    log('  ✅ Dependencies installed', 'green');
    checks.config++;
  } else {
    log('  ❌ Dependencies not installed - run: npm install', 'red');
    allChecks = false;
  }

  // Check source directories
  log('\n📂 Source Directories:', 'blue');
  const srcDirs = [
    'src/app',
    'src/components',
    'src/lib',
    'src/types',
  ];
  srcDirs.forEach(dir => {
    if (fs.existsSync(dir)) {
      log(`  ✅ ${dir}`, 'green');
    } else {
      log(`  ❌ ${dir} - MISSING`, 'red');
      allChecks = false;
    }
  });

  // Summary
  log('\n' + '='.repeat(50), 'cyan');
  log('\n📊 Setup Summary:', 'blue');
  log(`  Files: ${checks.files}/10`, checks.files === 10 ? 'green' : 'yellow');
  log(`  Environment: ${checks.env}/6`, checks.env === 6 ? 'green' : 'yellow');
  log(`  Configuration: ${checks.config}/2`, checks.config === 2 ? 'green' : 'yellow');
  
  const totalChecks = checks.files + checks.env + checks.config;
  const totalExpected = 10 + 6 + 2;
  
  log(`\n  Total: ${totalChecks}/${totalExpected}`, 
    totalChecks === totalExpected ? 'green' : 'yellow');

  if (allChecks && totalChecks === totalExpected) {
    log('\n✅ Setup Complete! All checks passed.', 'green');
    log('\n🚀 Next Steps:', 'cyan');
    log('  1. Create first user in Supabase Auth', 'reset');
    log('  2. Add user profile to database', 'reset');
    log('  3. Start dev server: npm run dev', 'reset');
    log('  4. Or use Docker: docker-compose up -d', 'reset');
    log('\n📖 See SETUP.md for detailed instructions\n', 'blue');
    process.exit(0);
  } else {
    log('\n⚠️  Setup incomplete. Please address the issues above.', 'yellow');
    log('\n📖 See SETUP.md for setup instructions\n', 'blue');
    process.exit(1);
  }
}

main();
