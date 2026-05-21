import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const data = await prisma.configuration.findMany({
      orderBy: { created_at: 'desc' },
      take: 1
    });
    return new Response(JSON.stringify(data[0] || {}), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    return new Response(
      JSON.stringify({
        message: "An error occurred while fetching configurations",
        error: error.message,
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.text();
    const payload = JSON.parse(body);
    
    delete payload.id;
    payload.created_at = new Date();

    const data = await prisma.configuration.create({ data: payload });

    return new Response(
      JSON.stringify({ message: "configuration updated successfully", data }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({
        message: "An error occurred while updating configuration",
        error: error.message,
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}