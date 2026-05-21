import prisma from "@/lib/prisma";
import { getBoxSizes } from "../../../utils/boxSizes";

export async function GET() {
  const { data, error } = await getBoxSizes();

  if (error) {
    return new Response(
      JSON.stringify({
        message: "An error occurred while fetching box sizes",
        error: error.message,
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

export async function PUT(req: Request) {
  try {
    const body = await req.text();
    const { payload } = JSON.parse(body);

    if (Array.isArray(payload)) {
      payload.forEach((item) => delete item.breeder);
      
      const data = await Promise.all(payload.map(p => prisma.box_size.upsert({
        where: { breeder_id_size: { breeder_id: p.breeder_id, size: p.size } },
        update: p,
        create: p
      })));
      return new Response(
        JSON.stringify({ message: "Box sizes updated successfully", data }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    } else if (typeof payload === "object" && payload !== null) {
      delete payload.breeder;
      const data = await prisma.box_size.upsert({
        where: { breeder_id_size: { breeder_id: payload.breeder_id, size: payload.size } },
        update: payload,
        create: payload
      });
      return new Response(
        JSON.stringify({ message: "Box sizes updated successfully", data }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }
  } catch (error: any) {
    return new Response(
      JSON.stringify({
        message: "An error occurred while updating box sizes",
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
      data = await prisma.box_size.createMany({ data: payload });
    } else {
      data = await prisma.box_size.create({ data: payload });
    }

    return new Response(
      JSON.stringify({ message: "Box size added successfully", data }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({
        message: "An error occurred while adding box size",
        error: error.message,
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const body = await req.text();
    const { breeder_id, size } = JSON.parse(body);
    const data = await prisma.box_size.delete({
      where: { breeder_id_size: { breeder_id, size } }
    });
    return new Response(
      JSON.stringify({ message: "Box size deleted successfully", data }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({
        message: "An error occurred while deleting box size",
        error: error.message,
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}