import { createClient } from "@/utils/supabase/supabase";

export async function GET() {
  const supabaseClient = await createClient();

  const { data, error } = await supabaseClient.from("variety").select("*");

  if (error) {
    return new Response(
      JSON.stringify({
        message: "An error occurred while fetching varietys",
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

  return new Response(JSON.stringify(data), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
  
}

export async function PUT(req: Request) {
  const supabaseClient = await createClient();

  const body = await req.text();
  const { payload } = JSON.parse(body);
  const { data, error } = await supabaseClient.from("variety").upsert(payload);

  if (error) {
    return new Response(
      JSON.stringify({
        message: "An error occurred while updating variety",
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
      message: "Variety updated successfully",
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


export async function POST(req: Request) {
    const supabaseClient = await createClient();
    const body = await req.text();
    const { payload } = JSON.parse(body);

    const { data, error } = await supabaseClient.from("variety").insert(payload);
    
    if (error) {
        return new Response(
        JSON.stringify({
            message: "An error occurred while adding variety",
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
        message: "Variety added successfully",
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

export async function DELETE(req: Request) {
    const supabaseClient = await createClient();
    const body = await req.text();
    const { id } = JSON.parse(body);

    const { data, error } = await supabaseClient.from("variety").delete().match({ id });
    
    if (error) {
        return new Response(
        JSON.stringify({
            message: "An error occurred while deleting variety",
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
        message: "Variety deleted successfully",
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