import prisma from "@/lib/prisma";
import { clearCacheMatchingKeyPattern } from "@/utils/cache";

export async function PUT(req: Request) {
  try {
    const body = await req.text();
    const { payload } = JSON.parse(body);
    
    let data;
    if (Array.isArray(payload)) {
      data = await Promise.all(payload.map(p => prisma.shipinfo.upsert({
        where: { picture_id: p.picture_id },
        update: p,
        create: p
      })));
    } else {
      data = await prisma.shipinfo.upsert({
        where: { picture_id: payload.picture_id },
        update: payload,
        create: payload
      });
    }

    clearCacheMatchingKeyPattern("koi_*");

    return new Response(
      JSON.stringify({ message: "Location updated successfully", data }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({
        message: "An error occurred while updating location",
        error: error.message,
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
