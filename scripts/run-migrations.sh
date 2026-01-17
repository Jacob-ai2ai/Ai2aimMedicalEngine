#!/bin/bash

# Migration Runner Script
# This script helps run migrations manually if needed

echo "🚀 AI2AIM RX - Database Migration Runner"
echo "========================================"
echo ""

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "⚠️  Supabase CLI not found."
    echo "   Install with: npm install -g supabase"
    echo ""
    echo "📝 Alternative: Run migrations via Supabase Dashboard SQL Editor"
    echo "   1. Go to: https://avmoqiwlgkshdyrqxddl.supabase.co"
    echo "   2. Navigate to SQL Editor"
    echo "   3. Run each migration file in order:"
    echo "      - supabase/migrations/001_initial_schema.sql"
    echo "      - supabase/migrations/002_ai_agents_data.sql"
    echo "      - supabase/migrations/004_rag_functions.sql"
    echo ""
    exit 1
fi

echo "✅ Supabase CLI found"
echo ""
echo "📋 Migration files:"
ls -1 supabase/migrations/*.sql
echo ""

echo "To run migrations:"
echo "  1. Link your project: supabase link --project-ref avmoqiwlgkshdyrqxddl"
echo "  2. Push migrations: supabase db push"
echo ""
