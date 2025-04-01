import { createClient } from "@/utils/supabase/supabase";

export async function GET(req: Request) {
  const supabaseClient = await createClient();
  const { searchParams } = new URL(req.url);
  const startDate = searchParams.get("start") || "1900-01-01";
  const endDate = searchParams.get("end") || "2050-12-31";

  let allData: any[] = [];
  const limit = 1000;
  let offset = 0;

  while (true) {
    const { data, error } = await supabaseClient
      .from("koi_sales_view")
      .select("*")
      .range(offset, offset + limit - 1)
      .gte("date", startDate)
      .lte("date", endDate);

    if (error) {
      return new Response(
        JSON.stringify({
          message: "An error occurred while fetching koi sales data",
          error: error.message,
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
    console.log(data.length);
    if (!data || data.length === 0) {
      break; // No more data to fetch
    }

    allData.push(...data);
    offset += limit;
  }

  allData = allData.map(
    (sale) => ({
      ...sale, jpy_total_cost: sale.jpy_cost * sale.pcs, usd_total_sale: sale.sale_price_usd * (1 + sale.comm),
      jpy_total_sale: sale.sale_price_jpy * (1 + sale.comm), usd_total_cost: sale.jpy_cost * sale.pcs / sale.rate,
    })
  ).map((sale) => ({
    ...sale, jpy_profit_total: sale.jpy_total_sale - sale.jpy_total_cost,
    usd_profit_total: sale.usd_total_sale - sale.usd_total_cost,
  }));


  return new Response(JSON.stringify(allData), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
