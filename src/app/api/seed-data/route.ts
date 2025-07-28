import { createClient } from "@/utils/supabase/supabase";
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const supabaseClient = await createClient();

    // Check if we have basic reference data, if not, create some
    const [breedersRes, varietiesRes, configRes] = await Promise.all([
      supabaseClient.from("breeder").select("id, name").limit(1),
      supabaseClient.from("variety").select("id, variety").limit(1),
      supabaseClient.from("configuration").select("ex_rate, commission").limit(1)
    ]);

    const results: any = { actions: [] };

    // Add sample breeders if none exist
    if (breedersRes.data && breedersRes.data.length === 0) {
      const sampleBreeders = [
        { id: 19, name: "Hoshikin Koi Farm" },
        { id: 33, name: "Isa Koi Farm" },
        { id: 81, name: "Omosako Koi Farm" },
        { id: 31, name: "Hosokai Koi Farm" }
      ];

      for (const breeder of sampleBreeders) {
        const insertRes = await supabaseClient
          .from("breeder")
          .upsert(breeder, { onConflict: 'id' });
        
        results.actions.push(`Breeder ${breeder.name}: ${insertRes.error ? 'failed' : 'success'}`);
      }
    } else {
      results.actions.push(`Breeders already exist: ${breedersRes.data?.length}`);
    }

    // Add sample varieties if none exist
    if (varietiesRes.data && varietiesRes.data.length === 0) {
      const sampleVarieties = [
        { id: 10, variety: "Kohaku" },
        { id: 23, variety: "Showa" },
        { id: 32, variety: "Shiro Utsuri" },
        { id: 17, variety: "Taisho Sanke" }
      ];

      for (const variety of sampleVarieties) {
        const insertRes = await supabaseClient
          .from("variety")
          .upsert(variety, { onConflict: 'id' });
        
        results.actions.push(`Variety ${variety.variety}: ${insertRes.error ? 'failed' : 'success'}`);
      }
    } else {
      results.actions.push(`Varieties already exist: ${varietiesRes.data?.length}`);
    }

    // Add configuration if none exists
    if (configRes.data && configRes.data.length === 0) {
      const config = { ex_rate: 140.0, commission: 0.2 };
      const insertRes = await supabaseClient
        .from("configuration")
        .insert(config);
      
      results.actions.push(`Configuration: ${insertRes.error ? 'failed' : 'success'}`);
    } else {
      results.actions.push(`Configuration already exists`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        ...results
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
