import { createClient } from "@/utils/supabase/supabase";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user: supabaseUser }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !supabaseUser) {
      return NextResponse.json({ authenticated: false, user: null });
    }

    const { data: userProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', supabaseUser.id)
      .single();

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
