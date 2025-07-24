# Role-Based Authentication & Authorization System

This project implements a comprehensive role-based authentication and authorization system using Supabase Auth with Next.js.

## Features

- **Two User Roles**: Administrator and Assistant
- **Access Matrix**: Granular permission control for different resources and actions
- **Route Protection**: Middleware-based protection for pages and API endpoints
- **Component-Level Authorization**: Permission guards for UI components
- **Supabase Integration**: Full authentication flow with Supabase Auth
- **Complete Auth Flow**: Sign up, sign in, password reset, profile management
- **Session Management**: Automatic session refresh and logout handling
- **Security Features**: Row Level Security (RLS), permission validation, self-protection policies

## User Roles

### Administrator
- Full access to all features and functionalities
- Can manage users (create, read, update, delete, manage roles)
- Can perform all CRUD operations on all resources
- Can access configuration settings

### Assistant
- Limited access based on the access matrix
- Can read most resources but has restricted create/update/delete permissions
- Cannot manage users or access configuration settings
- Cannot perform bulk uploads or delete operations

## Access Matrix

The system uses a detailed access matrix defined in `/src/types/auth.ts`:

```typescript
const ACCESS_MATRIX = {
  koi: {
    create: { admin: true, assistant: false },
    read: { admin: true, assistant: true },
    update: { admin: true, assistant: false },
    delete: { admin: true, assistant: false },
    export: { admin: true, assistant: true },
    bulk_upload: { admin: true, assistant: false }
  },
  customers: {
    create: { admin: true, assistant: false },
    read: { admin: true, assistant: true },
    update: { admin: true, assistant: false },
    delete: { admin: true, assistant: false },
    export: { admin: true, assistant: true }
  },
  // ... more resources
}
```

## Setup Instructions

### 1. Database Setup

Run the SQL migration in your Supabase database:

```sql
-- Run the contents of supabase-migration.sql in your Supabase SQL editor
```

This will create:
- `user_profiles` table with role management
- Row Level Security (RLS) policies
- Automatic user profile creation trigger
- Update timestamp triggers

### 2. Environment Variables

Ensure you have the following environment variables set:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Create Your First Admin User

1. Go to `/auth/login` and sign up with your email
2. In your Supabase dashboard, go to the SQL editor and run:

```sql
UPDATE user_profiles 
SET role = 'admin' 
WHERE email = 'your-admin-email@example.com';
```

## Usage

### Client-Side Authentication

```tsx
import { useAuth } from '@/hooks/use-auth'

function MyComponent() {
  const { user, isAdmin, hasPermission, signOut, signUp } = useAuth()
  
  const handleSignUp = async () => {
    const result = await signUp('user@example.com', 'password', 'Full Name')
    if (result.error) {
      console.error(result.error)
    }
  }
  
  return (
    <div>
      {isAdmin() && <AdminPanel />}
      {hasPermission('customers', 'create') && <CreateCustomerButton />}
      <button onClick={signOut}>Logout</button>
      <button onClick={handleSignUp}>Sign Up</button>
    </div>
  )
}
```

### Permission Guards

```tsx
import { PermissionGuard } from '@/components/PermissionGuard'

function MyComponent() {
  return (
    <PermissionGuard 
      resource="customers" 
      action="delete"
      fallback={<div>You don't have permission to delete customers</div>}
    >
      <DeleteCustomerButton />
    </PermissionGuard>
  )
}
```

### API Route Protection

```typescript
import { withPermission } from '@/utils/auth'

export async function GET() {
  try {
    return await withPermission('customers', 'read', async (user) => {
      // Your API logic here
      return NextResponse.json(data)
    })
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message },
      { status: error.message.includes('Authentication') ? 401 : 403 }
    )
  }
}
```

### Server-Side Authentication

```typescript
import { getServerUser, requireAuth, requireAdmin } from '@/utils/auth'

// Get current user (returns null if not authenticated)
const user = await getServerUser()

// Require authentication (throws error if not authenticated)
const user = await requireAuth()

// Require admin role (throws error if not admin)
const adminUser = await requireAdmin()
```

## File Structure

```
src/
├── hooks/
│   └── use-auth.tsx           # Auth context and hooks
├── types/
│   └── auth.ts                # Type definitions and access matrix
├── utils/
│   ├── auth.ts                # Server-side auth utilities
│   └── supabase/
│       ├── client.ts          # Browser Supabase client
│       └── supabase.ts        # Server Supabase client
├── components/
│   ├── PermissionGuard.tsx    # Permission guard component
│   └── LogoutConfirmation.tsx # Logout confirmation dialog
├── app/
│   ├── auth/
│   │   ├── login/page.tsx     # Login page
│   │   ├── signup/page.tsx    # Signup page
│   │   ├── forgot-password/page.tsx # Password reset request
│   │   ├── reset-password/page.tsx  # Password reset form
│   │   ├── auth-code-error/page.tsx # Auth error page
│   │   └── callback/route.ts  # Auth callback handler
│   ├── users/page.tsx         # User management page (admin only)
│   ├── profile/page.tsx       # User profile management
│   └── api/
│       ├── users/route.ts     # User management API
│       └── auth/
│           ├── status/route.ts    # Auth status check
│           └── signout/route.ts   # Sign out API
└── middleware.ts              # Route protection middleware
```

## Security Features

1. **Row Level Security (RLS)**: Database-level security policies
2. **Route Protection**: Middleware prevents unauthorized access
3. **API Protection**: Server-side permission checks
4. **Component Guards**: Client-side UI permission controls
5. **Self-Protection**: Users cannot delete themselves or remove their own admin rights

## Customization

### Adding New Resources

1. Update the `ACCESS_MATRIX` in `/src/types/auth.ts`
2. Add new resource type to the `ResourceType` union
3. Implement permission checks in your components and API routes

### Adding New Roles

1. Update the database check constraint
2. Update the `UserRole` type in `/src/types/auth.ts`
3. Update the access matrix with permissions for the new role

### Modifying Permissions

Simply update the `ACCESS_MATRIX` object to change what each role can access.

## Authentication Flow

1. **Sign Up**: User creates account with email/password → Profile created with 'assistant' role
2. **Email Confirmation**: User confirms email (if required by Supabase settings)
3. **Sign In**: User signs in with email/password
4. **Route Access**: Middleware checks authentication and permissions
5. **Permission Check**: Components/APIs validate user permissions using access matrix
6. **Session Management**: Automatic session refresh and logout handling

## Complete Auth Features

### Available Pages
- **`/auth/login`** - Sign in with email/password
- **`/auth/signup`** - Create new account
- **`/auth/forgot-password`** - Request password reset
- **`/auth/reset-password`** - Reset password with token
- **`/profile`** - Manage profile and change password
- **`/users`** - User management (admin only)

### Auth Functions Available
- `signIn(email, password)` - Sign in user
- `signUp(email, password, fullName)` - Create new user account
- `signOut()` - Sign out and redirect to login
- `hasPermission(resource, action)` - Check permissions
- `isAdmin()` - Check if user is admin
- `isAssistant()` - Check if user is assistant

## Error Handling

The system provides appropriate HTTP status codes:
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Authenticated but insufficient permissions
- `500 Internal Server Error`: Server-side errors

## Best Practices

1. Always use permission guards for sensitive UI components
2. Protect API routes with the `withPermission` wrapper
3. Use the access matrix to centrally manage permissions
4. Regularly audit user roles and permissions
5. Test both positive and negative authorization scenarios
