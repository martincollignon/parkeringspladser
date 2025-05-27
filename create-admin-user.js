#!/usr/bin/env node

/**
 * Script to create an admin user for the parking finder app
 * Run with: node create-admin-user.js
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { readFileSync } from 'fs';

// Load environment variables
config({ path: '.env.local' });

const supabaseUrl = process.env.PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables:');
  console.error('   PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅' : '❌');
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✅' : '❌');
  console.error('\nMake sure your .env.local file contains these variables.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createAdminUser() {
  console.log('🔐 Creating admin user for Copenhagen Parking Finder');
  console.log('');
  
  // Get admin email and password from environment variables
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  
  if (!adminEmail || !adminPassword) {
    console.error('❌ Missing required environment variables:');
    console.error('   ADMIN_EMAIL:', adminEmail ? '✅' : '❌');
    console.error('   ADMIN_PASSWORD:', adminPassword ? '✅' : '❌');
    console.error('\nPlease set ADMIN_EMAIL and ADMIN_PASSWORD in your .env.local file.');
    process.exit(1);
  }
  
  console.log(`📧 Creating admin user: ${adminEmail}`);
  console.log('🔑 Using password from environment variable');
  console.log('');
  
  try {
    // Create the user using admin API
    const { data, error } = await supabase.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true // Skip email confirmation
    });

    if (error) {
      if (error.message.includes('already registered')) {
        console.log('✅ User already exists!');
        console.log(`📧 Email: ${adminEmail}`);
      } else {
        console.error('❌ Error creating user:', error.message);
        return;
      }
    } else {
      console.log('✅ Admin user created successfully!');
      console.log(`📧 Email: ${adminEmail}`);
      console.log(`👤 User ID: ${data.user.id}`);
    }
    
    console.log('');
    console.log('🎉 Setup complete!');
    console.log('');
    console.log('Next steps:');
    console.log('1. Go to http://localhost:5173/admin');
    console.log('2. Log in with your credentials');
    console.log('3. Start moderating submissions!');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the script
createAdminUser(); 