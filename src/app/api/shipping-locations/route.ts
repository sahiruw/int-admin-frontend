import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const data = await prisma.shippinglocation.findMany();
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    return new Response(
      JSON.stringify({
        message: "An error occurred while fetching shipping locations",
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
    
    let data;
    if (Array.isArray(payload)) {
      data = await Promise.all(payload.map(p => prisma.shippinglocation.upsert({
        where: { id: p.id },
        update: p,
        create: p
      })));
    } else {
      data = await prisma.shippinglocation.upsert({
        where: { id: payload.id },
        update: payload,
        create: payload
      });
    }

    return new Response(
      JSON.stringify({ message: "Shipping location updated successfully", data }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({
        message: "An error occurred while updating shipping location",
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
      data = await prisma.shippinglocation.createMany({ data: payload });
    } else {
      data = await prisma.shippinglocation.create({ data: payload });
    }

    return new Response(
      JSON.stringify({ message: "Shipping location added successfully", data }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({
        message: "An error occurred while adding shipping location",
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
    const data = await prisma.shippinglocation.delete({ where: { id } });
    return new Response(
      JSON.stringify({ message: "Shipping location deleted successfully", data }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({
        message: "An error occurred while deleting shipping location",
        error: error.message,
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}