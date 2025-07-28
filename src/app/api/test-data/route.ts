import { createClient } from "@/utils/supabase/supabase";

export async function GET() {
  try {
    const supabaseClient = await createClient();

    // Test basic database connections
    const [breedersRes, varietiesRes] = await Promise.all([
      supabaseClient.from("breeder").select("id, name").limit(5),
      supabaseClient.from("variety").select("id, variety").limit(5)
    ]);

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          breeders: breedersRes.data || [],
          breedersError: breedersRes.error,
          varieties: varietiesRes.data || [],
          varietiesError: varietiesRes.error
        }
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
