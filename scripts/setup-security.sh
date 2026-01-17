#!/bin/bash

# AI2AIM RX Security Setup Script
# This script automates the security setup process

set -e

echo "🔐 AI2AIM RX Security Setup"
echo "================================"
echo ""

# Check if running from project root
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Step 1: Create environment file if it doesn't exist
echo "📝 Step 1: Setting up environment variables..."
if [ ! -f ".env.local" ]; then
    if [ -f ".env.local.example" ]; then
        cp .env.local.example .env.local
        echo "✅ Created .env.local from template"
        echo "⚠️  IMPORTANT: Please edit .env.local with your actual credentials"
    else
        echo "❌ Error: .env.local.example not found"
        exit 1
    fi
else
    echo "ℹ️  .env.local already exists, skipping..."
fi

# Step 2: Generate security secrets
echo ""
echo "🔑 Step 2: Generating security secrets..."

if command -v openssl &> /dev/null; then
    CSRF_SECRET=$(openssl rand -base64 32)
    SESSION_SECRET=$(openssl rand -base64 32)
    
    echo "✅ Generated CSRF_SECRET: $CSRF_SECRET"
    echo "✅ Generated SESSION_SECRET: $SESSION_SECRET"
    echo ""
    echo "Add these to your .env.local file:"
    echo "CSRF_SECRET=$CSRF_SECRET"
    echo "SESSION_SECRET=$SESSION_SECRET"
else
    echo "⚠️  OpenSSL not found. Please manually generate secrets:"
    echo "   Run: openssl rand -base64 32"
fi

# Step 3: Check Supabase configuration
echo ""
echo "🗄️  Step 3: Checking Supabase configuration..."

if grep -q "your-supabase-url" .env.local 2>/dev/null; then
    echo "⚠️  WARNING: Supabase URL not configured in .env.local"
    echo "   Please update NEXT_PUBLIC_SUPABASE_URL with your actual Supabase URL"
else
    echo "✅ Supabase appears to be configured"
fi

# Step 4: Install dependencies
echo ""
echo "📦 Step 4: Checking dependencies..."

if [ -f "package.json" ]; then
    if [ ! -d "node_modules" ]; then
        echo "Installing dependencies..."
        npm install
    else
        echo "✅ Dependencies already installed"
    fi
fi

# Step 5: Check for required directories
echo ""
echo "📁 Step 5: Verifying directory structure..."

REQUIRED_DIRS=(
    "src/lib/security"
    "src/lib/validation"
    "src/app/api"
    "supabase/migrations"
    "scripts"
    "plans"
)

for dir in "${REQUIRED_DIRS[@]}"; do
    if [ -d "$dir" ]; then
        echo "✅ $dir exists"
    else
        echo "⚠️  Creating $dir..."
        mkdir -p "$dir"
    fi
done

# Step 6: Summary and next steps
echo ""
echo "================================"
echo "✅ Security Setup Complete!"
echo "================================"
echo ""
echo "📋 Next Steps:"
echo ""
echo "1. Edit .env.local with your credentials:"
echo "   - NEXT_PUBLIC_SUPABASE_URL"
echo "   - NEXT_PUBLIC_SUPABASE_ANON_KEY"
echo "   - SUPABASE_SERVICE_ROLE_KEY"
echo "   - CSRF_SECRET (generated above)"
echo "   - SESSION_SECRET (generated above)"
echo ""
echo "2. Run database migration:"
echo "   - Open Supabase SQL Editor"
echo "   - Run: supabase/migrations/003_comprehensive_rls_policies.sql"
echo "   - Or use: supabase db push"
echo ""
echo "3. Verify setup:"
echo "   npm run verify:security"
echo ""
echo "4. Start development server:"
echo "   npm run dev"
echo ""
echo "📚 Documentation:"
echo "   - Security details: SECURITY_IMPLEMENTATION.md"
echo "   - Roadmap: plans/innovation-and-fixes-plan.md"
echo ""
