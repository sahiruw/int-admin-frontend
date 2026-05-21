import { createClient } from "@/utils/supabase/supabase";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const supabaseClient = await createClient();
    const formData = await req.formData();
    const file = formData.get('avatar') as File;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Get user ID from current session
    const { data: { user } } = await supabaseClient.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    // Generate a unique file name using user id and timestamp
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}-${Date.now()}.${fileExt}`;

    // Upload file to avatars bucket
    const { data: uploadData, error: uploadError } = await supabaseClient.storage
      .from('avatars')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (uploadError) {
      console.error("Error uploading file:", uploadError);
      return NextResponse.json(
        { error: uploadError.message },
        { status: 500 }
      );
    }

    // Get public URL of the uploaded avatar
    const { data: { publicUrl } } = supabaseClient.storage
      .from('avatars')
      .getPublicUrl(fileName);

    // Update user profile with new avatar URL
    let updateError = null;
    try {
      await prisma.user_profiles.update({
        where: { id: user.id },
        data: { avatar_url: publicUrl, updated_at: new Date() }
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
      message: "Avatar updated successfully",
      avatarUrl: publicUrl
    });
  } catch (error) {
    console.error("Error in avatar upload:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
