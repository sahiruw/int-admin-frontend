import { createClient } from "@/utils/supabase/supabase";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const supabaseClient = await createClient();
    
    // Get user ID from current session
    const { data: { user } } = await supabaseClient.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    // Get current user profile to get the avatar URL
    let profileError = null;
    let profile: any = null;
    try {
      profile = await prisma.user_profiles.findUnique({
        where: { id: user.id },
        select: { avatar_url: true }
      });
      if (!profile) throw new Error("Profile not found");
    } catch (err: any) {
      profileError = err;
    }
    
    if (profileError || !profile) {
      return NextResponse.json(
        { error: profileError?.message || "Profile not found" },
        { status: 404 }
      );
    }

    // If there's an avatar URL, try to delete the file from storage
    if (profile.avatar_url) {
      // Extract the filename from the URL
      // URLs are typically in the format: https://[supabase-project].supabase.co/storage/v1/object/public/avatars/[filename]
      const filenameParts = profile.avatar_url.split('/');
      const filename = filenameParts[filenameParts.length - 1];
      
      if (filename) {
        // Attempt to delete the file from storage
        const { error: deleteError } = await supabaseClient.storage
          .from('avatars')
          .remove([filename]);
        
        if (deleteError) {
          console.warn("Error deleting avatar file:", deleteError);
          // Continue anyway, as we still want to remove the URL from the profile
        }
      }
    }

    // Update user profile to remove avatar URL
    let updateError = null;
    try {
      await prisma.user_profiles.update({
        where: { id: user.id },
        data: { avatar_url: null, updated_at: new Date() }
      });
    } catch (err: any) {
      updateError = err;
    }

    if (updateError) {
      console.error("Error updating profile:", updateError);
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Avatar removed successfully"
    });
  } catch (error) {
    console.error("Error in avatar removal:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
