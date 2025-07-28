# Supabase Service Role Key Setup

## What You Need to Do

To enable admin user registration functionality, you need to add the Supabase Service Role Key to your environment variables.

## Steps to Get the Service Role Key

1. **Go to your Supabase Dashboard**
   - Visit: https://app.supabase.com
   - Navigate to your project: `hljdzxdmcfyfuzkymqej`

2. **Access Project Settings**
   - Click on the "Settings" icon in the sidebar (gear icon)
   - Go to "API" section

3. **Find the Service Role Key**
   - Look for the "Project API keys" section
   - You'll see different keys:
     - `anon` key (you already have this)
     - `service_role` key ⭐ **This is what you need**

4. **Copy the Service Role Key**
   - Click the "Copy" button next to the `service_role` key
   - This key starts with `eyJ...` and is much longer than the anon key

## Add to Environment File

Once you have the service role key, add it to your `.env` file:

```env
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

## Security Important Notes

⚠️ **CRITICAL SECURITY INFORMATION:**

1. **Never commit the service role key to git**
   - The `.env` file should be in your `.gitignore`
   - This key has admin privileges and can bypass RLS policies

2. **Keep it secure**
   - Don't share this key in chat, email, or screenshots
   - Don't use it in client-side code (only server-side)

3. **What this key does**
   - Allows creating/deleting users
   - Bypasses Row Level Security (RLS)
   - Has full database access

## After Adding the Key

1. Restart your development server:
   ```bash
   npm run dev
   ```

2. The user registration functionality should now work!

## Current Environment File Location

Your environment file is located at:
```
f:\Projects\TAROKOI\int-admin-frontend\.env
```

## Example of What to Add

Add this line to your `.env` file (replace with your actual key):

```env
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhsamR6eGRtY2Z5ZnV6a3ltcWVqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY4ODEyMzQ1NiwiZXhwIjoyMDAzNjk5NDU2fQ.your_actual_service_role_key_signature_here
```

## Test the Functionality

After adding the key and restarting the server:

1. Log in as an admin user
2. Go to the Users page (`/users`)
3. Click "Register New User"
4. Fill out the form and submit
5. The new user should be created successfully!
