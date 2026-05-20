import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { KoiInfo } from "@/types/koi";
import {
  clearCacheMatchingKeyPattern,
  getCache,
  setCache,
} from "@/utils/cache";
import {
  mapCustomerNamesToIds,
  mapShippingLocationNamesToIds,
} from "@/utils/customer-mapping";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const breederId = searchParams.get("breeder_id");
  const shipped = searchParams.get("shipped");

  const cacheKey = `koi_${breederId || "all"}_${shipped ?? "any"}`;
  const cachedData = getCache(cacheKey);

  if (cachedData) {
    console.log("Cache hit for key:", cacheKey);
    return new Response(JSON.stringify(cachedData), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "X-Cache": "HIT",
      },
    });
  }

  let allData: any[] = [];
  const limit = 1000;
  let offset = 0;

  while (true) {
    try {
      let whereClauses = [];
      if (breederId) whereClauses.push(Prisma.sql`breeder_id = ${parseInt(breederId)}`);
      if (shipped) {
        if (shipped === 'true') whereClauses.push(Prisma.sql`shipped IS TRUE`);
        else if (shipped === 'false') whereClauses.push(Prisma.sql`shipped IS NOT TRUE`);
      }

      let whereSql = whereClauses.length > 0 ? Prisma.sql`WHERE ${Prisma.join(whereClauses, ' AND ')}` : Prisma.empty;

      const data: any[] = await prisma.$queryRaw`
        SELECT * FROM koi_details_view
        ${whereSql}
        LIMIT ${limit} OFFSET ${offset}
      `;

      if (!data || data.length === 0) break;

      allData.push(...data);
      offset += limit;
    } catch (error: any) {
      return new Response(
        JSON.stringify({
          message: "An error occurred while fetching koi data",
          error: error.message,
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  }

  setCache(cacheKey, allData, 3000); // cache for 5 minutes

  return new Response(JSON.stringify(allData), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "X-Cache": "MISS",
    },
  });
}

export async function POST(req: Request) {
  const body = await req.text();
  let { payload } = JSON.parse(body);

  const config = await prisma.configuration.findMany({
    orderBy: { created_at: 'desc' },
    take: 1
  });

  if (config && config.length > 0) {
    payload = payload.map((koi: any) => {
      koi.rate = config[0].ex_rate;
      return koi;
    });
  } else {
    return new Response(
      JSON.stringify({
        message: "No configuration found",
        error: "Please add configuration first",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }

  const customerNames = payload
    .filter((koi: any) => koi.sold_to)
    .map((koi: any) => koi.sold_to);

  const locationNames = payload
    .filter((koi: any) => koi.ship_to)
    .map((koi: any) => koi.ship_to);

  const customerMap = await mapCustomerNamesToIds(customerNames);
  const locationMap = await mapShippingLocationNamesToIds(locationNames);

  payload = payload.map((koi: any) => {
    const updatedKoi = { ...koi };

    if (koi.sold_to && customerMap.has(koi.sold_to)) {
      updatedKoi.customer_id = customerMap.get(koi.sold_to);
    }

    if (koi.ship_to && locationMap.has(koi.ship_to)) {
      updatedKoi.ship_to = locationMap.get(koi.ship_to);
    }
    delete updatedKoi.sold_to; 
    return updatedKoi;
  });

  try {
    let data;
    if (Array.isArray(payload)) {
      data = await Promise.all(payload.map((p: any) => prisma.koiinfo.upsert({
        where: { picture_id: p.picture_id },
        update: p,
        create: p
      })));
    } else {
      data = await prisma.koiinfo.upsert({
        where: { picture_id: payload.picture_id },
        update: payload,
        create: payload
      });
    }

    clearCacheMatchingKeyPattern("koi_*");  
    return new Response(
      JSON.stringify({
        message: "Koi added successfully",
        data,
      }),
      {
        status: 201,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error: any) {
    let errMsg = error.message;
    console.log("Error", errMsg);

    if (error && error.code === "P2002") {
      let nullpayload = payload.filter((koi: any) => {
        return Object.values(koi).some((value) => !value);
      }).map((koi: any) => koi.picture_id);
      
      errMsg = `Koi with picture_id ${nullpayload.join(", ")} has null values in one or more fields. Please check your data.`;
    }

    return new Response(
      JSON.stringify({
        message: "An error occurred while adding koi",
        error: errMsg,
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const body = await req.text();
    const { picture_id } = JSON.parse(body);

    const data = await prisma.koiinfo.delete({
      where: { picture_id }
    });

    clearCacheMatchingKeyPattern("koi_*");

    return new Response(
      JSON.stringify({
        message: "Koi deleted successfully",
        data,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({
        message: "An error occurred while deleting koi",
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
}
