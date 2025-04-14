

export type InvoiceByDateTableRecord = {
    container_number: string;
    age: number;
    variety_name: string;
    breeder_name: string;
    size_cm: string;
    total_weight: number;
    pcs: number;
    jpy_cost: number;
    jpy_total: number;
    box_count: number;
}

export type InvoiceByDate = {
    date: string;
    records: InvoiceByDateTableRecord[];
} 