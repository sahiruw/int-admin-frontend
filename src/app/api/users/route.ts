import { createClient } from "@/utils/supabase/supabase";
import { withPermission } from "@/utils/auth";
import { NextResponse } from "next/server";
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

export async function GET() {
  try {
    return await withPermission('users', 'read', async (user) => {
      const supabaseClient = await createClient();

      const { data, error } = await supabaseClient
        .from("user_profiles")
        .select("*")
        .order('created_at', { ascending: false });

      if (error) {
        return NextResponse.json(
          {
            message: "An error occurred while fetching users",
            error: error.message,
          },
          { status: 500 }
        );
      }

      return NextResponse.json(data);
    });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message },
      { status: error.message.includes('Authentication') ? 401 : 403 }
    );
  }
}

export async function POST(req: Request) {
  try {
    return await withPermission('users', 'create', async (currentUser) => {
      const body = await req.text();
      const { email, password, full_name, role = 'assistant' } = JSON.parse(body);

      // Create a temporary client using anon key for signup
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
      
      const tempSupabase = createSupabaseClient(supabaseUrl, supabaseAnonKey);

      // Sign up the user
      const { data: authData, error: authError } = await tempSupabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name,
            role
          }
        }
      });

      if (authError) {
        return NextResponse.json(
          {
            message: "An error occurred while creating user",
            error: authError.message,
          },
          { status: 500 }
        );
      }

      if (!authData.user) {
        return NextResponse.json(
          {
            message: "User creation failed",
            error: "No user data returned",
          },
          { status: 500 }
        );
      }

      // Poll for the trigger to create the profile with exponential backoff
      const maxRetries = 5;
      const baseDelay = 500; // Start with 500ms
      let attempt = 0;
      let profileCreated = false;

      while (attempt < maxRetries && !profileCreated) {
        const { data: existingProfile, error: fetchError } = await supabaseClient
          .from("user_profiles")
          .select("*")
          .eq('id', authData.user.id)
          .single();

        if (existingProfile) {
          profileCreated = true;
          break;
        }

        if (fetchError) {
          console.error(`Attempt ${attempt + 1} failed: ${fetchError.message}`);
        }

        attempt++;
        const delay = baseDelay * Math.pow(2, attempt - 1); // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, delay));
      }

      if (!profileCreated) {
        return NextResponse.json(
          {
            message: "User created but profile setup failed after retries",
          },
          { status: 500 }
        );
      }
      // Now update the user profile with the correct role using our server client
      const supabaseClient = await createClient();
      const { data: profileData, error: profileError } = await supabaseClient
        .from("user_profiles")
        .update({ role, full_name })
        .eq('id', authData.user.id)
        .select()
        .single();

      if (profileError) {
        // Try to fetch the profile first in case it was already created correctly
        const { data: existingProfile, error: fetchError } = await supabaseClient
          .from("user_profiles")
          .select("*")
          .eq('id', authData.user.id)
          .single();

        if (fetchError) {
          return NextResponse.json(
            {
              message: "User created but profile setup failed",
              error: profileError.message,
            },
            { status: 500 }
          );
        }

        return NextResponse.json({
          message: "User created successfully",
          data: existingProfile,
        });
      }

      return NextResponse.json({
        message: "User created successfully",
        data: profileData,
      });
    });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message },
      { status: error.message.includes('Authentication') ? 401 : 403 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    return await withPermission('users', 'update', async (currentUser) => {
      const supabaseClient = await createClient();
      const body = await req.text();
      const { id, role, full_name, avatar_url } = JSON.parse(body);

      // Prevent users from changing their own role unless they're updating other fields
      const updates: any = {};
      if (full_name !== undefined) updates.full_name = full_name;
      if (avatar_url !== undefined) updates.avatar_url = avatar_url;
      
      // Only allow role changes if user is not updating themselves
      if (role !== undefined && id !== currentUser.id) {
        updates.role = role;
      }

      const { data, error } = await supabaseClient
        .from("user_profiles")
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return NextResponse.json(
          {
            message: "An error occurred while updating user",
            error: error.message,
          },
          { status: 500 }
        );
      }

      return NextResponse.json({
        message: "User updated successfully",
        data,
      });
    });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message },
      { status: error.message.includes('Authentication') ? 401 : 403 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    return await withPermission('users', 'delete', async (currentUser) => {
      const supabaseClient = await createClient();
      const body = await req.text();
      const { id } = JSON.parse(body);

      // Prevent users from deleting themselves
      if (id === currentUser.id) {
        return NextResponse.json(
          { message: "You cannot delete your own account" },
          { status: 400 }
        );
      }

      const { data, error } = await supabaseClient
        .from("user_profiles")
        .delete()
        .eq('id', id);

      if (error) {
        return NextResponse.json(
          {
            message: "An error occurred while deleting user",
            error: error.message,
          },
          { status: 500 }
        );
      }

      return NextResponse.json({
        message: "User deleted successfully",
        data,
      });
    });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message },
      { status: error.message.includes('Authentication') ? 401 : 403 }
    );
  }
}
