import prisma from "@/lib/prisma";
import { clearCacheMatchingKeyPattern } from "@/utils/cache";

type ShipPayloadItem = {
  picture_id?: unknown;
  date?: unknown;
  box_count?: unknown;
  box_size?: unknown;
  weight_of_box?: unknown;
  shipped?: unknown;
  grouping?: unknown;
  shipping_cost_per_kg?: unknown;
};

const parseNullableDate = (value: unknown, field: string) => {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error(`Invalid ${field}. Expected YYYY-MM-DD.`);
  }

  const parsedDate = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(parsedDate.getTime())) {
    throw new Error(`Invalid ${field}. Could not parse date.`);
  }

  return parsedDate;
};

const parseNullableDecimal = (value: unknown, field: string) => {
  if (value === null || value === undefined || value === "") return null;
  const asNumber =
    typeof value === "number" ? value : Number(String(value).trim());

  if (!Number.isFinite(asNumber)) {
    throw new Error(`Invalid ${field}. Expected a numeric value.`);
  }

  return asNumber;
};

const parseNullableString = (value: unknown) => {
  if (value === null || value === undefined || value === "") return null;
  const normalized = String(value).trim();
  return normalized === "" ? null : normalized;
};

const parseNullableBoolean = (value: unknown, field: string) => {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "boolean") return value;
  if (value === "true") return true;
  if (value === "false") return false;
  throw new Error(`Invalid ${field}. Expected boolean.`);
};

function normalizePayloadItem(raw: ShipPayloadItem) {
  const picture_id = parseNullableString(raw.picture_id);
  if (!picture_id) {
    throw new Error("Missing picture_id.");
  }

  const normalized: Record<string, unknown> = { picture_id };

  if ("date" in raw) normalized.date = parseNullableDate(raw.date, "date");
  if ("box_count" in raw) {
    normalized.box_count = parseNullableDecimal(raw.box_count, "box_count");
  }
  if ("box_size" in raw) {
    normalized.box_size = parseNullableString(raw.box_size);
  }
  if ("weight_of_box" in raw) {
    normalized.weight_of_box = parseNullableDecimal(
      raw.weight_of_box,
      "weight_of_box",
    );
  }
  if ("shipped" in raw) {
    normalized.shipped = parseNullableBoolean(raw.shipped, "shipped");
  }
  if ("grouping" in raw) {
    normalized.grouping = parseNullableString(raw.grouping);
  }
  if ("shipping_cost_per_kg" in raw) {
    normalized.shipping_cost_per_kg = parseNullableDecimal(
      raw.shipping_cost_per_kg,
      "shipping_cost_per_kg",
    );
  }

  return normalized;
}

export async function PUT(req: Request) {
  try {
    const body = await req.text();
    const { payload } = JSON.parse(body);

    const payloadItems = Array.isArray(payload) ? payload : [payload];

    const successes: string[] = [];
    const failures: { picture_id: string; error: string }[] = [];
    const data: unknown[] = [];

    for (const item of payloadItems) {
      try {
        const normalized = normalizePayloadItem(item);
        const record = await prisma.shipinfo.upsert({
          where: { picture_id: String(normalized.picture_id) },
          update: normalized,
          create: normalized,
        });
        successes.push(String(normalized.picture_id));
        data.push(record);
      } catch (itemError: any) {
        failures.push({
          picture_id: String(item?.picture_id ?? "unknown"),
          error: itemError?.message || "Unknown error",
        });
      }
    }

    if (successes.length > 0) {
      clearCacheMatchingKeyPattern("koi_*");
    }

    const isPartialFailure = failures.length > 0;
    const status = successes.length === 0 ? 500 : isPartialFailure ? 207 : 200;

    return new Response(
      JSON.stringify({
        message: isPartialFailure
          ? "Some shipping records could not be saved"
          : "Shipping info updated successfully",
        data,
        successCount: successes.length,
        failedCount: failures.length,
        savedPictureIds: successes,
        failures,
      }),
      { status, headers: { "Content-Type": "application/json" } },
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
