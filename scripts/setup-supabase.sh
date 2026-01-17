#!/bin/bash

# Supabase Setup Script
# This script helps set up your Supabase project

echo "🚀 AI2AIM RX - Supabase Setup"
echo "=============================="
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "❌ .env.local file not found!"
    echo "Creating .env.local from template..."
    cp .env.local.example .env.local
    echo "✅ Created .env.local"
    echo ""
    echo "⚠️  Please edit .env.local and add your Supabase credentials"
    echo ""
fi

echo "📋 Next Steps:"
echo ""
echo "1. Create a Supabase project at https://supabase.com"
echo "2. Get your credentials from Project Settings → API"
echo "3. Update .env.local with your credentials"
echo "4. Run the migrations in Supabase SQL Editor:"
echo "   - supabase/migrations/001_initial_schema.sql"
echo "   - supabase/migrations/002_ai_agents_data.sql"
echo "   - supabase/migrations/004_rag_functions.sql"
echo "5. Enable pgvector extension: CREATE EXTENSION IF NOT EXISTS vector;"
echo "6. Create your first user in Authentication → Users"
echo ""
echo "For detailed instructions, see SETUP.md"
echo ""
