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

    