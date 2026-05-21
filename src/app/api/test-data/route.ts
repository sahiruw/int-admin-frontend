import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const [breedersRes, varietiesRes] = await Promise.all([
      prisma.breeder.findMany({ take: 5, select: { id: true, name: true } }),
      prisma.variety.findMany({ take: 5, select: { id: true, variety: true } })
    ]);

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          breeders: breedersRes || [],
          breedersError: null,
          varieties: varietiesRes || [],
          varietiesError: null
        }
      }),
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
