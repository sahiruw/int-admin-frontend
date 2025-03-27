import { createClient } from "@/utils/supabase/supabase";
import { KoiInfo } from "@/types/koi";

export async function GET() {
  const supabaseClient = await createClient();

  const { data, error } = await supabaseClient.from("koiinfo").select(`
    *,
    breeder:breeder_id (*),
    variety:koi_id (*)
  `);

  const { data: config, error: configError } = await supabaseClient
    .from("configuration")
    .select("*");

  let combinedData: KoiInfo[] = [];

  if (!error && !configError) {
    data.forEach((koi) => {
      let koiData: KoiInfo = {
        timestamp: koi.timestamp,

        koi_id: koi.picture_id,
        variety: koi.variety.variety,
        sex: koi.sex,
        age: koi.age,
        size_cm: koi.size_cm,
        breeder: koi.breeder.name,
        bre_id: koi.breeder_id,
        pcs: koi.pcs,

        jpy_cost: koi.jpy_cost,
        jpy_total: koi.pcs * koi.jpy_cost,

        sold_to: undefined,
        ship_to: undefined,

        sales_jpy: undefined,
        sales_usd: undefined,
        comm_jpy: undefined,
        comm_usd: undefined,
        total_jpy: undefined,
        total_usd: undefined,

        num_of_box: undefined,
        box_size: undefined,
        total_kg: undefined,
        shipped_yn: undefined,
        ship_date: undefined,
      };
      combinedData.push(koiData);
    });

    return new Response(JSON.stringify(combinedData), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  if (error || configError) {
    let errMsg = error ? error.message : configError?.message || "Unknown error";
    return new Response(
      JSON.stringify({
        message: "An error occurred while fetching koi",
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
  

}

export async function POST(req: Request) {
  const supabaseClient = await createClient();

  const body = await req.text();
  const { payload } = JSON.parse(body);
  const { data, error } = await supabaseClient.from("koiinfo").insert(payload);

  if (error) {
    return new Response(
      JSON.stringify({
        message: "An error occurred while adding koi",
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
