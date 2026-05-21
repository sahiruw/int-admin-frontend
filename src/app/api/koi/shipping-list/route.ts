import prisma from "@/lib/prisma";
import { getCache, setCache } from "@/utils/cache";

const BIGINT_MAX_SAFE = BigInt(Number.MAX_SAFE_INTEGER);
const BIGINT_MIN_SAFE = BigInt(Number.MIN_SAFE_INTEGER);

const jsonReplacer = (_key: string, value: unknown) => {
  if (typeof value === "bigint") {
    return value <= BIGINT_MAX_SAFE && value >= BIGINT_MIN_SAFE
      ? Number(value)
      : value.toString();
  }

  return value;
};

const toJsonSafe = <T,>(value: T): T => {
  return JSON.parse(JSON.stringify(value, jsonReplacer)) as T;
};

export async function GET(req: Request) {
  const cacheKey = `koi_summary`;
  const cachedData = getCache(cacheKey);

  if (cachedData) {
    return new Response(JSON.stringify(toJsonSafe(cachedData)), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "X-Cache": "HIT",
      },
    });
  }

  try {
    const data = await prisma.$queryRaw`SELECT * FROM get_koi_summary()`;
    const safeData = toJsonSafe(data);

    setCache(cacheKey, safeData, 3000); // cache for 5 minutes

    return new Response(JSON.stringify(safeData), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
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
