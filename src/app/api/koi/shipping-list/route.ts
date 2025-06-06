import { getCache , setCache} from "@/utils/cache";
import { createClient } from "@/utils/supabase/supabase";

export async function GET(req: Request) {
  const supabaseClient = await createClient();

  const cacheKey = `koi_summary`;
    const cachedData = getCache(cacheKey);
  
    if (cachedData) {
      return new Response(JSON.stringify(cachedData), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "X-Cache": "HIT",
        },
      });
    }

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

  setCache(cacheKey, data, 3000); // cache for 5 minutes

  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
