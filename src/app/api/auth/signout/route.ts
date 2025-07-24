import { createClient } from "@/utils/supabase/supabase";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      return NextResponse.json(
        { message: "Error signing out", error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: "Signed out successfully" });
  } catch (error: any) {
    return NextResponse.json(
      { message: "Error signing out", error: error.message },
      { status: 500 }
    );
  }
}
