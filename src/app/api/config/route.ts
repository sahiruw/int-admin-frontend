import { createClient } from "@/utils/supabase/supabase";

export async function GET() {
  const supabaseClient = await createClient();

  const { data, error } = await supabaseClient.from("configuration").select("*");

  if (error) {
    return new Response(
      JSON.stringify({
        message: "An error occurred while fetching configurations",
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

  return new Response(JSON.stringify(data[0]), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
  
}

export async function PUT(req: Request) {
  const supabaseClient = await createClient();

  const body = await req.text();

  const payload = JSON.parse(body);
  payload.id = 1;
  const { data, error } = await supabaseClient.from("configuration").upsert(payload);

  if (error) {
    return new Response(
      JSON.stringify({
        message: "An error occurred while updating configuration",
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
      message: "configuration updated successfully",
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