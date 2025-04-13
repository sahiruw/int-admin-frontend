import { KoiSaleRecord } from "@/types/koi";

function calculateSCperKoi(records: KoiSaleRecord[]): KoiSaleRecord[] {
    // Step 1: Group totals by breeder_name and grouping
    const groupTotals = new Map<string, { totalWeight: number; totalPcs: number }>();
  
    for (const record of records) {
      const key = `${record.breeder_name}__${record.grouping}`;
      if (!groupTotals.has(key)) {
        groupTotals.set(key, { totalWeight: 0, totalPcs: 0 });
      }
      const group = groupTotals.get(key)!;
      group.totalWeight += record.total_weight;
      group.totalPcs += record.pcs;
    }
  
    // Step 2: Assign sc_per_koi to each record
    for (const record of records) {
      const key = `${record.breeder_name}__${record.grouping}`;
      const group = groupTotals.get(key)!;
      record.sc_per_koi = group.totalPcs !== 0 ? group.totalWeight / group.totalPcs : 0;
    }

    return records;
  }