import { createClient } from "@/utils/supabase/supabase";

export async function getBoxSizes() {
  const supabaseClient = await createClient();

  const { data, error } = await supabaseClient.from("box_size").select(`
    *,
    breeder (
      name
    )
  `);

  return { data, error };
}
