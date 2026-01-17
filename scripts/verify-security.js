#!/usr/bin/env node

/**
 * Security Verification Script
 * Checks that all security features are properly configured
 */

const fs = require('fs');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkFile(filePath, description) {
  const exists = fs.existsSync(path.join(process.cwd(), filePath));
  if (exists) {
    log(`✅ ${description}`, 'green');
    return true;
  } else {
    log(`❌ ${description} - Missing: ${filePath}`, 'red');
    return false;
  }
}

function checkDirectory(dirPath, description) {
  const exists = fs.existsSync(path.join(process.cwd(), dirPath));
  if (exists && fs.statSync(path.join(process.cwd(), dirPath)).isDirectory()) {
    log(`✅ ${description}`, 'green');
    return true;
  } else {
    log(`❌ ${description} - Missing: ${dirPath}`, 'red');
    return false;
  }
}

function checkEnvVariable(varName) {
  // Try to load .env.local
  const envPath = path.join(process.cwd(), '.env.local');
  if (!fs.existsSync(envPath)) {
    return false;
  }
  
  const envContent = fs.readFileSync(envPath, 'utf8');
  const hasVar = envContent.includes(`${varName}=`) && !envContent.includes(`${varName}=your-`);
  return hasVar;
}

async function main() {
  log('\n🔐 AI2AIM RX Security Verification', 'cyan');
  log('=====================================\n', 'cyan');

  let totalChecks = 0;
  let passedChecks = 0;

  // Check 1: Required Files
  log('📄 Checking Required Files...', 'yellow');
  const requiredFiles = [
    ['.env.local.example', 'Environment template'],
    ['.env.local', 'Environment configuration'],
    ['src/lib/security/csrf.ts', 'CSRF protection'],
    ['src/lib/security/rate-limit.ts', 'Rate limiting'],
    ['src/lib/validation/schemas.ts', 'Input validation'],
    ['src/middleware.ts', 'Security middleware'],
    ['supabase/migrations/003_comprehensive_rls_policies.sql', 'RLS policies migration'],
    ['SECURITY_IMPLEMENTATION.md', 'Security documentation'],
  ];

  requiredFiles.forEach(([file, desc]) => {
    totalChecks++;
    if (checkFile(file, desc)) passedChecks++;
  });

  // Check 2: Required Directories
  log('\n📁 Checking Directory Structure...', 'yellow');
  const requiredDirs = [
    ['src/lib/security', 'Security library'],
    ['src/lib/validation', 'Validation library'],
    ['src/app/api', 'API routes'],
    ['supabase/migrations', 'Database migrations'],
    ['scripts', 'Setup scripts'],
    ['plans', 'Planning documents'],
  ];

  requiredDirs.forEach(([dir, desc]) => {
    totalChecks++;
    if (checkDirectory(dir, desc)) passedChecks++;
  });

  // Check 3: Environment Variables
  log('\n🔑 Checking Environment Variables...', 'yellow');
  const requiredEnvVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'CSRF_SECRET',
    'SESSION_SECRET',
  ];

  requiredEnvVars.forEach((varName) => {
    totalChecks++;
    if (checkEnvVariable(varName)) {
      log(`✅ ${varName} is configured`, 'green');
      passedChecks++;
    } else {
      log(`❌ ${varName} is not configured`, 'red');
    }
  });

  // Check 4: Optional but Recommended
  log('\n⭐ Checking Optional Configuration...', 'yellow');
  const optionalEnvVars = [
    'UPSTASH_REDIS_REST_URL',
    'NEXT_PUBLIC_SENTRY_DSN',
    'OPENAI_API_KEY',
  ];

  optionalEnvVars.forEach((varName) => {
    if (checkEnvVariable(varName)) {
      log(`✅ ${varName} is configured`, 'green');
    } else {
      log(`⚠️  ${varName} is not configured (optional)`, 'yellow');
    }
  });

  // Check 5: Security Features in Code
  log('\n🛡️  Checking Security Features...', 'yellow');
  
  // Check middleware has security headers
  const middlewarePath = path.join(process.cwd(), 'src/middleware.ts');
  if (fs.existsSync(middlewarePath)) {
    const middlewareContent = fs.readFileSync(middlewarePath, 'utf8');
    
    totalChecks++;
    if (middlewareContent.includes('X-Frame-Options')) {
      log('✅ Security headers configured', 'green');
      passedChecks++;
    } else {
      log('❌ Security headers missing in middleware', 'red');
    }

    totalChecks++;
    if (middlewareContent.includes('checkRateLimit')) {
      log('✅ Rate limiting enabled', 'green');
      passedChecks++;
    } else {
      log('❌ Rate limiting not enabled', 'red');
    }

    totalChecks++;
    if (middlewareContent.includes('verifyCsrfToken')) {
      log('✅ CSRF protection enabled', 'green');
      passedChecks++;
    } else {
      log('❌ CSRF protection not enabled', 'red');
    }
  }

  // Summary
  log('\n=====================================', 'cyan');
  log(`Security Score: ${passedChecks}/${totalChecks} (${Math.round((passedChecks/totalChecks)*100)}%)`, 
    passedChecks === totalChecks ? 'green' : passedChecks > totalChecks * 0.7 ? 'yellow' : 'red');
  log('=====================================\n', 'cyan');

  if (passedChecks === totalChecks) {
    log('🎉 All security checks passed!', 'green');
    log('✅ Your application is ready for development\n', 'green');
    process.exit(0);
  } else if (passedChecks > totalChecks * 0.7) {
    log('⚠️  Most security checks passed, but some items need attention', 'yellow');
    log('📚 See SECURITY_IMPLEMENTATION.md for details\n', 'yellow');
    process.exit(0);
  } else {
    log('❌ Critical security issues detected', 'red');
    log('🔧 Please run: bash scripts/setup-security.sh\n', 'red');
    process.exit(1);
  }
}

main().catch(error => {
  console.error('Error running verification:', error);
  process.exit(1);
});
