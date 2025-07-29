import { clearCacheMatchingKeyPattern } from "@/utils/cache";
import { createClient } from "@/utils/supabase/supabase";


export async function PUT(req: Request) {
  const supabaseClient = await createClient();

  const body = await req.text();
  const { payload } = JSON.parse(body);
  console.log("Payload", payload);
  const { data, error } = await supabaseClient.from("shipinfo").upsert(payload);

  if (error) {
    return new Response(
      JSON.stringify({
        message: "An error occurred while updating location",
        error: error.message,
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } 

  clearCacheMatchingKeyPattern("koi_*")

  return new Response(
    JSON.stringify({
      message: "Location updated successfully",
      data,
    }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
} 
