import { createClient } from "@/utils/supabase/supabase";
import { KoiInfo } from "@/types/koi";
import { clearCacheMatchingKeyPattern, getCache, setCache } from "@/utils/cache";

export async function GET(request: Request) {
  const supabaseClient = await createClient();

  const { searchParams } = new URL(request.url);
  const breederId = searchParams.get("breeder_id");
  const shipped = searchParams.get("shipped");

  // const cacheKey = `koi_${breederId || "all"}_${shipped ?? "any"}`;
  // const cachedData = getCache(cacheKey);

  // if (cachedData) {
  //   return new Response(JSON.stringify(cachedData), {
  //     status: 200,
  //     headers: {
  //       "Content-Type": "application/json",
  //       "X-Cache": "HIT",
  //     },
  //   });
  // }

  let allData: any[] = [];
  const limit = 1000;
  let offset = 0;

  while (true) {
    let query = supabaseClient
      .from("koi_details_view")
      .select("*")
      .range(offset, offset + limit - 1);

    if (breederId) query = query.eq("breeder_id", breederId);
    if (shipped) query = query.eq("shipped", shipped);

    const { data, error } = await query;

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

    if (!data || data.length === 0) break;

    allData.push(...data);
    offset += limit;
  }

  // setCache(cacheKey, allData, 3000); // cache for 5 minutes

  return new Response(JSON.stringify(allData), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "X-Cache": "MISS",
    },
  });
}


export async function POST(req: Request) {
  const supabaseClient = await createClient();

  const body = await req.text();
  let { payload } = JSON.parse(body);

  const { data: config, error: configError } = await supabaseClient
    .from("configuration")
    .select("*");

  if (config && config.length > 0) {
    payload = payload.map((koi: any) => {
      koi.rate = config[0].ex_rate;
      return koi;
    });
  } else {
    return new Response(
      JSON.stringify({
        message: "No configuration found",
        error: "Please add configuration first",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
  console.log("Payload", payload);
  const { data, error } = await supabaseClient.from("koiinfo").upsert(payload);

  if (error || configError) {
    let errMsg = error
      ? error.message
      : configError?.message || "Unknown error";
      console.log("Error", errMsg);
    return new Response(
      JSON.stringify({
        message: "An error occurred while adding koi",
        error: errMsg,
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
  clearCacheMatchingKeyPattern("koi_*");
  return new Response(
    JSON.stringify({
      message: "Koi added successfully",
      data,
    }),
    {
      status: 201,
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
}
