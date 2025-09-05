import { createAdminClient } from "@/utils/supabase/admin";
import { withPermission } from "@/utils/auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    return await withPermission('users', 'delete', async (currentUser) => {
      const body = await req.text();
      const { userId } = JSON.parse(body);

      // Prevent users from disabling themselves
      if (userId === currentUser.id) {
        return NextResponse.json(
          { message: "You cannot disable your own account" },
          { status: 400 }
        );
      }

      // Create admin client to disable the user
      const adminClient = createAdminClient();
      
      const { error } = await adminClient.auth.admin.updateUserById(
        userId,
        { ban_duration: '87600h' } // 10 years, effectively permanent
      );

      if (error) {
        return NextResponse.json(
          {
            message: "An error occurred while disabling user",
            error: error.message,
          },
          { status: 500 }
        );
      }

      return NextResponse.json({
        message: "User disabled successfully",
      });
    });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message },
      { status: error.message.includes('Authentication') ? 401 : 403 }
    );
  }
}
