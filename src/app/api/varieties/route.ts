import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const data = await prisma.variety.findMany();
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    return new Response(
      JSON.stringify({
        message: "An error occurred while fetching varieties",
        error: error.message,
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.text();
    const { payload } = JSON.parse(body);
    
    // Handle array or single object
    let data;
    if (Array.isArray(payload)) {
      // Prisma doesn't have an easy bulk upsert, we'll assume it's a single update in standard usage
      // If it's an array, map over it (simplified for basic CRUD)
      data = await Promise.all(payload.map(p => prisma.variety.upsert({
        where: { id: p.id },
        update: p,
        create: p
      })));
    } else {
      data = await prisma.variety.upsert({
        where: { id: payload.id },
        update: payload,
        create: payload
      });
    }

    return new Response(
      JSON.stringify({ message: "Variety updated successfully", data }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({
        message: "An error occurred while updating variety",
        error: error.message,
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const { payload } = JSON.parse(body);
    
    let data;
    if (Array.isArray(payload)) {
      data = await prisma.variety.createMany({ data: payload });
    } else {
      data = await prisma.variety.create({ data: payload });
    }

    return new Response(
      JSON.stringify({ message: "Variety added successfully", data }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({
        message: "An error occurred while adding variety",
        error: error.message,
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const body = await req.text();
    const { id } = JSON.parse(body);
    const data = await prisma.variety.delete({ where: { id } });
    return new Response(
      JSON.stringify({ message: "Variety deleted successfully", data }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({
        message: "An error occurred while deleting variety",
        error: error.message,
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}