'use client';
import DatePickerOne from '@/components/FormElements/DatePicker/DatePickerOne';
import { Picker } from '@/components/FormElements/Dropdown';
import { ConfirmationDialog } from '@/components/Layouts/ConfirmationDialog';
import { DataTable } from '@/components/Layouts/tables/uneditable';
import { Dropdown } from '@/components/ui/dropdown';
import { cn } from '@/lib/utils';
import { KoiSaleRecord } from '@/types/koi';
import React, { useEffect, useMemo, useState } from 'react'


const Page = () => {
    const [data, setData] = useState<KoiSaleRecord[]>([]);
    const [selectedDate, setSelectedDate] = useState("");
    const [selectedRows, setSelectedRows] = useState<string[]>([]);
    const [isConfirmationDialogOpen, setIsConfirmationDialogOpen] = useState(false);

    // Fetch koi sales data
    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch("/api/koi");
                const rawData: KoiSaleRecord[] = await res.json();
                const filtered = rawData.reverse().filter((record) => record.date && !record.shipped);
                setData(filtered);
            } catch (error) {
                console.error("Failed to fetch koi sales data:", error);
            }
        };

        fetchData();
    }, []);

    // Unique dates for dropdown
    const uniqueDates = useMemo(
        () =>
            Array.from(new Set(data.map((record) => record.date))).sort((a, b) =>
                new Date(b).getTime() - new Date(a).getTime()
            ),
        [data]
    );

    // Filtered data for selected date
    const tableData = useMemo(
        () => (selectedDate ? groupRecords(data, selectedDate) : []),
        [selectedDate, data]
    );

    useEffect(() => {
        setSelectedRows([]);
    }
        , [selectedDate]);

    useEffect(() => {
        setSelectedDate(uniqueDates[0]);
    }, [uniqueDates]);

    const toggleSelectedRow = (isSelected: boolean, row?: KoiSaleRecord) => {
        if (row) {
            setSelectedRows((prev) =>
                isSelected ? [...prev, row.picture_id] : prev.filter((r) => r !== row.picture_id)
            );
        } else {
            setSelectedRows(isSelected ? tableData.map(row => row.picture_id) : []);
        }
    };

    return (
        <div className="rounded-[10px] bg-white shadow-1 dark:bg-gray-dark dark:shadow-card p-8 space-y-4" style={{ height: "80vh", overflowY: "auto" }}>
            <ConfirmationDialog
                isOpen={isConfirmationDialogOpen}
                title="Mark as Shipped"
                message="Are you sure you want to mark the selected koi as shipped?"
                onConfirm={() => {
                    // Handle mark as shipped logic here
                    console.log("Mark as shipped confirmed for date:", selectedDate);
                    setIsConfirmationDialogOpen(false);
                }}
                onCancel={() => setIsConfirmationDialogOpen(false)}
                variant='destructive'
            />

            <div className="flex items-center gap-4">
                <label className="font-medium text-gray-600 dark:text-gray-300">Ship Date:</label>
                <Picker value={selectedDate} setValue={setSelectedDate} items={uniqueDates} />
                <button
                    className={cn("ml-auto px-4 py-2 bg-primary text-white rounded hover:opacity-80", {
                        "cursor-not-allowed opacity-80": selectedRows.length === 0
                    })}
                    onClick={() => {
                        setIsConfirmationDialogOpen(true);
                    }}
                    disabled={selectedRows.length === 0}
                >
                    Mark as Shipped
                </button>
            </div>

            <DataTable
                data={tableData}
                columns={[
                    { key: "container_number", header: "Container Number" },
                    { key: "age", header: "Age" },
                    { key: "breeder_name", header: "Breeder" },
                    { key: "variety_name", header: "Variety" },
                    { key: "size_cm", header: "Size" },
                    { key: "total_kgs", header: "Total Kgs" },
                    { key: "pcs", header: "Pcs" },
                    { key: "jpy_cost", header: "JPY Cost" },
                    { key: "jpy_total", header: "JPY Total Cost" },
                    { key: "box_count", header: "Box Count" },
                    
                ]}
                label=''
                sortable={false}
                selectable={true}
                selectedRows={tableData.filter((row) => selectedRows.includes(row.picture_id))}
                toggleSelectedRow={toggleSelectedRow}
            />

        </div>
    );
};

export default Page;



function groupRecords(records: KoiSaleRecord[], date: string) {
    let groupedRecords = records.filter(record => record.date === date);

    // Sort by breeder name then grouping
    groupedRecords = groupedRecords.sort((a, b) => {
        if (a.breeder_name < b.breeder_name) return -1;
        if (a.breeder_name > b.breeder_name) return 1;
        return (a.grouping ?? "").localeCompare(b.grouping ?? "");
    });

    let containerIndex = 1;

    const updatedRecords = groupedRecords.map(record => {
        if (record.box_count) {
            const start = containerIndex;
            const end = containerIndex + record.box_count - 1;

            const container_number =
                record.box_count === 1
                    ? `C/NO. ${start}`
                    : `C/NO. ${start}-${end}`;

            containerIndex = end + 1;

            return {
                ...record,
                container_number,
            };
        }
        else {
            return {
                ...record,
                container_number: ""
            }
        }
    });

    return updatedRecords;
}