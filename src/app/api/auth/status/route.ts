import { createClient } from "@/utils/supabase/supabase";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user: supabaseUser }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !supabaseUser) {
      return NextResponse.json({ authenticated: false, user: null });
    }

    let profileError = null;
    let userProfile = null;
    try {
      userProfile = await prisma.user_profiles.findUnique({
        where: { id: supabaseUser.id }
      });
      if (!userProfile) throw new Error("Profile not found");
    } catch (err: any) {
      profileError = err;
    }

    if (profileError) {
      return NextResponse.json({ 
        authenticated: true, 
        user: null,
        error: 'Profile not found'
      });
    }

    return NextResponse.json({ 
      authenticated: true, 
      user: userProfile,
      supabaseUser: {
        id: supabaseUser.id,
        email: supabaseUser.email,
        email_confirmed_at: supabaseUser.email_confirmed_at,
        created_at: supabaseUser.created_at
      }
    });
  } catch (error: any) {
    return NextResponse.json({ 
      authenticated: false, 
      user: null,
      error: error.message 
    }, { status: 500 });
  }
}
