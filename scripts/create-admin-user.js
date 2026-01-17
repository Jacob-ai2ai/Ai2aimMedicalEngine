/**
 * Script to create an admin user in Supabase
 * Run with: node scripts/create-admin-user.js
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local')
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

// Use service role key for admin operations
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function createAdminUser() {
  const email = 'admin@ai2aimrx.com'
  const password = 'admin123'
  const fullName = 'Admin User'

  try {
    console.log('🔐 Creating admin user...')
    
    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email
    })

    if (authError) {
      if (authError.message.includes('already registered')) {
        console.log('⚠️  User already exists, fetching user ID...')
        const { data: existingUser } = await supabase.auth.admin.listUsers()
        const user = existingUser.users.find(u => u.email === email)
        
        if (!user) {
          console.error('❌ User exists but could not find ID')
          process.exit(1)
        }
        
        // Create profile for existing user
        const { error: profileError } = await supabase
          .from('user_profiles')
          .upsert({
            id: user.id,
            email,
            full_name: fullName,
            role: 'admin'
          })

        if (profileError) {
          console.error('❌ Error creating profile:', profileError.message)
          process.exit(1)
        }

        console.log('✅ User profile updated successfully!')
        console.log(`📧 Email: ${email}`)
        console.log(`🔑 Password: ${password}`)
        console.log(`🆔 User ID: ${user.id}`)
        return
      }
      
      console.error('❌ Error creating user:', authError.message)
      process.exit(1)
    }

    if (!authData.user) {
      console.error('❌ No user data returned')
      process.exit(1)
    }

    console.log('✅ Auth user created!')
    console.log(`🆔 User ID: ${authData.user.id}`)

    // Create user profile
    const { error: profileError } = await supabase
      .from('user_profiles')
      .insert({
        id: authData.user.id,
        email,
        full_name: fullName,
        role: 'admin'
      })

    if (profileError) {
      console.error('❌ Error creating profile:', profileError.message)
      // Try to delete the auth user if profile creation fails
      await supabase.auth.admin.deleteUser(authData.user.id)
      process.exit(1)
    }

    console.log('✅ User profile created!')
    console.log('\n🎉 Admin user created successfully!')
    console.log(`📧 Email: ${email}`)
    console.log(`🔑 Password: ${password}`)
    console.log(`👤 Role: admin`)
    console.log('\n🚀 You can now login at http://localhost:3000/login')

  } catch (error) {
    console.error('❌ Unexpected error:', error.message)
    process.exit(1)
  }
}

createAdminUser()
