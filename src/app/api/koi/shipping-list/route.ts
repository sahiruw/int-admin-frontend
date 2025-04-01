import { createClient } from "@/utils/supabase/supabase";

export async function GET(req: Request) {
  const supabaseClient = await createClient();

  const { data, error } = await supabaseClient.rpc("get_koi_summary");

  if (error) {
    return new Response(
      JSON.stringify({
        message: "An error occurred while fetching koi data",
        error: error.message,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
