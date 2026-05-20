import prisma from "@/lib/prisma";

export async function POST() {
  try {
    const [breedersRes, varietiesRes, configRes] = await Promise.all([
      prisma.breeder.findMany({ take: 1, select: { id: true, name: true } }),
      prisma.variety.findMany({ take: 1, select: { id: true, variety: true } }),
      prisma.configuration.findMany({ take: 1, select: { ex_rate: true, commission: true } })
    ]);

    const results: any = { actions: [] };

    if (!breedersRes || breedersRes.length === 0) {
      const sampleBreeders = [
        { id: 19, name: "Hoshikin Koi Farm" },
        { id: 33, name: "Isa Koi Farm" },
        { id: 81, name: "Omosako Koi Farm" },
        { id: 31, name: "Hosokai Koi Farm" }
      ];

      for (const breeder of sampleBreeders) {
        try {
          await prisma.breeder.upsert({
            where: { id: breeder.id },
            update: breeder,
            create: breeder
          });
          results.actions.push(`Breeder ${breeder.name}: success`);
        } catch(e) {
          results.actions.push(`Breeder ${breeder.name}: failed`);
        }
      }
    } else {
      results.actions.push(`Breeders already exist: ${breedersRes.length}`);
    }

    if (!varietiesRes || varietiesRes.length === 0) {
      const sampleVarieties = [
        { id: 10, variety: "Kohaku", woo_variety: "" },
        { id: 23, variety: "Showa", woo_variety: "" },
        { id: 32, variety: "Shiro Utsuri", woo_variety: "" },
        { id: 17, variety: "Taisho Sanke", woo_variety: "" }
      ];

      for (const variety of sampleVarieties) {
        try {
          await prisma.variety.upsert({
            where: { id: variety.id },
            update: variety,
            create: variety
          });
          results.actions.push(`Variety ${variety.variety}: success`);
        } catch(e) {
          results.actions.push(`Variety ${variety.variety}: failed`);
        }
      }
    } else {
      results.actions.push(`Varieties already exist: ${varietiesRes.length}`);
    }

    if (!configRes || configRes.length === 0) {
      try {
        await prisma.configuration.create({
          data: { ex_rate: 140.0, commission: 0.2, shipping_cost: 0 }
        });
        results.actions.push(`Configuration: success`);
      } catch(e) {
        results.actions.push(`Configuration: failed`);
      }
    } else {
      results.actions.push(`Configuration already exists`);
    }

    return new Response(
      JSON.stringify({ success: true, ...results }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
