import { createClient } from "@/utils/supabase/supabase";

export async function GET() {
    const supabaseClient = await createClient();
    
    const { data, error } = await supabaseClient
      .from('configuration')
      .select('*');

    console.log(data);
  
    if (error) {
      return new Response(JSON.stringify({
        message: 'An error occurred while fetching koi',
        error: error.message,
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }
  
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
  
  export async function POST(req: Request) {
    const data = await req.json();
  
    return new Response(JSON.stringify({
      message: 'Koi added successfully',
      data,
    }), {
      status: 201,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
  