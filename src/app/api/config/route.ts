import { createClient } from "@/utils/supabase/supabase";

export async function GET() {
  const supabaseClient = await createClient();

  // Get the latest configuration by ordering by created_at descending and taking the first result
  const { data, error } = await supabaseClient
    .from("configuration")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(1);

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

  return new Response(JSON.stringify(data[0] || {}), {
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
  
  // Remove id if it exists and add timestamp for new row creation
  delete payload.id;
  payload.created_at = new Date().toISOString();
  
  // Insert a new row instead of upsert (which would update existing)
  const { data, error } = await supabaseClient
    .from("configuration")
    .insert(payload)
    .select();

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