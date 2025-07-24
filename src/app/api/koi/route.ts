import { createClient } from "@/utils/supabase/supabase";
import { KoiInfo } from "@/types/koi";
import {
  clearCacheMatchingKeyPattern,
  getCache,
  setCache,
} from "@/utils/cache";
import {
  mapCustomerNamesToIds,
  mapShippingLocationNamesToIds,
} from "@/utils/customer-mapping";

export async function GET(request: Request) {
  const supabaseClient = await createClient();

  const { searchParams } = new URL(request.url);
  const breederId = searchParams.get("breeder_id");
  const shipped = searchParams.get("shipped");

  const cacheKey = `koi_${breederId || "all"}_${shipped ?? "any"}`;
  const cachedData = getCache(cacheKey);

  if (cachedData) {
    console.log("Cache hit for key:", cacheKey);
    return new Response(JSON.stringify(cachedData), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "X-Cache": "HIT",
      },
    });
  }

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

  setCache(cacheKey, allData, 3000); // cache for 5 minutes

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
  } // Extract unique customer names and shipping location names from payload
  const customerNames = payload
    .filter((koi: any) => koi.sold_to)
    .map((koi: any) => koi.sold_to);

  const locationNames = payload
    .filter((koi: any) => koi.ship_to)
    .map((koi: any) => koi.ship_to);

  // Map customer names and location names to their IDs
  const customerMap = await mapCustomerNamesToIds(customerNames);
  const locationMap = await mapShippingLocationNamesToIds(locationNames);

  // Update payload with customer_id and ship_to fields based on the names
  payload = payload.map((koi: any) => {
    const updatedKoi = { ...koi };

    // Map customer_name to customer_id
    if (koi.sold_to && customerMap.has(koi.sold_to)) {
      updatedKoi.customer_id = customerMap.get(koi.sold_to);
    }

    // Map location_name to ship_to
    if (koi.ship_to && locationMap.has(koi.ship_to)) {
      updatedKoi.ship_to = locationMap.get(koi.ship_to);
    }
    delete updatedKoi.sold_to; // Remove the original name field
    return updatedKoi;
  });

  // console.log("Processed payload with mapped IDs:", payload[0]);

  const { data, error } = await supabaseClient.from("koiinfo").upsert(payload);

  if (error || configError) {
    let errMsg = error
      ? error.message
      : configError?.message || "Unknown error";
    console.log("Error", errMsg);

    // check if the error is due to null values
    if (error && error.code === "22P02") {
      // koi with any null field
      let nullpayload = payload.filter((koi: any) => {
        return Object.values(koi).some((value) => !value);
      }).map((koi: any) => koi.picture_id);
      
      errMsg = `Koi with picture_id ${nullpayload.join(", ")} has null values in one or more fields. Please check your data.`;
    }

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
