import { createClient } from "@/utils/supabase/supabase";
import { withPermission } from "@/utils/auth";
import { NextResponse } from "next/server";

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
