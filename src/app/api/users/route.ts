import { createClient } from "@/utils/supabase/supabase";
import { withPermission } from "@/utils/auth";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    return await withPermission('users', 'read', async (user) => {
      const data = await prisma.user_profiles.findMany({
        orderBy: { created_at: 'desc' }
      });
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
      
      const tempSupabase = await createClient();

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

      const maxRetries = 5;
      const baseDelay = 500; 
      let attempt = 0;
      let profileCreated = false;

      while (attempt < maxRetries && !profileCreated) {
        const existingProfile = await prisma.user_profiles.findUnique({
          where: { id: authData.user.id }
        });

        if (existingProfile) {
          profileCreated = true;
          break;
        }

        attempt++;
        const delay = baseDelay * Math.pow(2, attempt - 1); 
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

      let profileData;
      let profileError = null;
      try {
        profileData = await prisma.user_profiles.update({
          where: { id: authData.user.id },
          data: { role, full_name }
        });
      } catch (err: any) {
        profileError = err;
      }

      if (profileError) {
        try {
          const existingProfile = await prisma.user_profiles.findUnique({
            where: { id: authData.user.id }
          });
          return NextResponse.json({
            message: "User created successfully",
            data: existingProfile,
          });
        } catch (fetchError: any) {
          return NextResponse.json(
            {
              message: "User created but profile setup failed",
              error: profileError.message,
            },
            { status: 500 }
          );
        }
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
      const body = await req.text();
      const { id, role, full_name, avatar_url } = JSON.parse(body);

      const updates: any = {};
      if (full_name !== undefined) updates.full_name = full_name;
      if (avatar_url !== undefined) updates.avatar_url = avatar_url;
      
      if (role !== undefined && id !== currentUser.id) {
        updates.role = role;
      }

      let data, error;
      try {
        data = await prisma.user_profiles.update({
          where: { id },
          data: updates
        });
      } catch (err: any) {
        error = err;
      }

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
      const body = await req.text();
      const { id } = JSON.parse(body);

      if (id === currentUser.id) {
        return NextResponse.json(
          { message: "You cannot delete your own account" },
          { status: 400 }
        );
      }

      let data, error;
      try {
        data = await prisma.user_profiles.delete({
          where: { id }
        });
      } catch (err: any) {
        error = err;
      }

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
