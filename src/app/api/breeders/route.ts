import { createClient } from "@/utils/supabase/supabase";

export async function GET() {
  const supabaseClient = await createClient();

  const { data, error } = await supabaseClient.from("breeder").select("*");

  if (error) {
    return new Response(
      JSON.stringify({
        message: "An error occurred while fetching breeders",
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
  const { data, error } = await supabaseClient.from("breeder").upsert(payload);

  if (error) {
    return new Response(
      JSON.stringify({
        message: "An error occurred while updating breeder",
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
      message: "Breeder updated successfully",
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

    const { data, error } = await supabaseClient.from("breeder").insert(payload);
    
    if (error) {
        return new Response(
        JSON.stringify({
            message: "An error occurred while adding breeder",
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
        message: "Breeder added successfully",
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

    const { data, error } = await supabaseClient.from("breeder").delete().match({ id });
    
    if (error) {
        return new Response(
        JSON.stringify({
            message: "An error occurred while deleting breeder",
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
        message: "Breeder deleted successfully",
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