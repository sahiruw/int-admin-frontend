import { createClient } from "@/utils/supabase/supabase";
import { KoiInfo } from "@/types/koi";

export async function GET() {
  const supabaseClient = await createClient();

  let allData: any[] = [];
  const limit = 1000;
  let offset = 0;

  while (true) {
    const { data, error } = await supabaseClient
      .from("koi_details_view")
      .select("*")
      .range(offset, offset + limit - 1);

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

    if (!data || data.length === 0) {
      break; // No more data to fetch
    }

    allData.push(...data);
    offset += limit;
  }



  return new Response(JSON.stringify(allData), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
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

  const { data, error } = await supabaseClient.from("koiinfo").insert(payload);

  if (error || configError) {
    let errMsg = error
      ? error.message
      : configError?.message || "Unknown error";
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
