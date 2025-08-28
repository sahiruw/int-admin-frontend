import { createClient } from "@/utils/supabase/supabase";

export async function get_box_sizes(){
  const supabaseClient = await createClient();

  const { data, error } = await supabaseClient.from("box_size").select(`
    *,
    breeder (
      name
    )
  `)

  return { data, error };
}

export async function GET() {
  
  const { data, error } = await get_box_sizes();

  if (error) {
    return new Response(
      JSON.stringify({
        message: "An error occurred while fetching box sizes",
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

  // Remove 'breeder' property from each child object in payload
  if (Array.isArray(payload)) {
    payload.forEach((item) => {
      delete item.breeder;
    });
  } else if (typeof payload === "object" && payload !== null) {
    delete payload.breeder;
  }

  const { data, error } = await supabaseClient.from("box_size").upsert(payload);

  if (error) {
    return new Response(
      JSON.stringify({
        message: "An error occurred while updating box sizes",
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
      message: "Box sizes updated successfully",
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

    const { data, error } = await supabaseClient.from("box_size").insert(payload);
    
    if (error) {
        return new Response(
        JSON.stringify({
            message: "An error occurred while adding box size",
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
        message: "Box size added successfully",
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
    const { breeder_id, size } = JSON.parse(body);

    const { data, error } = await supabaseClient
      .from("box_size")
      .delete()
      .match({ breeder_id, size });
    
    if (error) {
        return new Response(
        JSON.stringify({
            message: "An error occurred while deleting box size",
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
        message: "Box size deleted successfully",
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