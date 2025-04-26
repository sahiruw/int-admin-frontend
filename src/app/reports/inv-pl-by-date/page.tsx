'use client';
import { useLoading } from '@/app/loading-context';
import DatePickerOne from '@/components/FormElements/DatePicker/DatePickerOne';
import { Picker } from '@/components/FormElements/Dropdown';
import { ConfirmationDialog } from '@/components/Layouts/ConfirmationDialog';
import { DataTable } from '@/components/Layouts/tables/uneditable';
import { Dropdown } from '@/components/ui/dropdown';
import { cn } from '@/lib/utils';
import { KoiSaleRecord } from '@/types/koi';
import { InvoiceByDate } from '@/types/report';
import React, { useEffect, useMemo, useState } from 'react'
import { toast } from 'react-hot-toast'

const Page = () => {
    const { setLoading } = useLoading();
    const [data, setData] = useState<KoiSaleRecord[]>([]);
    const [selectedBreeder, setSelectedBreeder] = useState<string>("");
    const [selectedDate, setSelectedDate] = useState("");
    const [selectedRows, setSelectedRows] = useState<string[]>([]);
    const [isConfirmationDialogOpen, setIsConfirmationDialogOpen] = useState(false);
    const [tableData, setTableData] = useState<KoiSaleRecord[]>([]);

    // Fetch koi sales data
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const res = await fetch('/api/koi', { next: { revalidate: 300 } });
                const rawData: KoiSaleRecord[] = await res.json();
                const filtered = rawData.filter((record) => record.date && !record.shipped);
                setData(filtered);
            } catch (error) {
                console.error("Failed to fetch koi sales data:", error);
                toast.error("Failed to fetch koi sales data");
            }
            finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Group records by date and breeder
    useEffect(() => {
        if (data.length > 0) {
            console.log("Data changed:", selectedDate, selectedBreeder);
            const grouped = groupRecords(data, selectedDate, selectedBreeder);
            console.log("Grouped data:", grouped.length);
            setTableData(grouped);
        }
    }, [data, selectedDate, selectedBreeder]);

    // Unique dates for dropdown
    const uniqueDates = useMemo(
        () =>
            Array.from(new Set(data.map((record) => record.date))).sort((a, b) =>
                new Date(b).getTime() - new Date(a).getTime()
            ),
        [data]
    );

    const uniqueBreeders = useMemo(
        () =>
            Array.from(new Set(tableData.map((record) => record.breeder_name))).sort(),
        [tableData]
    );



    useEffect(() => {
        setSelectedRows([]);
    }
        , [selectedDate]);

    // useEffect(() => {
    //     setSelectedDate(uniqueDates[5]);
    // }, [uniqueDates]);

    const toggleSelectedRow = (isSelected: boolean, row?: KoiSaleRecord) => {
        if (row) {
            setSelectedRows((prev) =>
                isSelected ? [...prev, row.picture_id] : prev.filter((r) => r !== row.picture_id)
            );
        } else {
            setSelectedRows(isSelected ? tableData.map(row => row.picture_id) : []);
        }
    };

    const handleMarkAsShipped = () => {
        setLoading(true);
        let data = selectedRows.map((rowId) => ({
            picture_id: rowId,
            shipped: true,
        })
        );

        fetch("/api/shipping", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ payload: data }),
        })
            .then((res) => res.json())
            .then((data) => {
                console.log("Success:", data);
                setSelectedRows([]);
                setData((prev) =>
                    prev.filter((record) => !selectedRows.includes(record.picture_id))

                );
                setTableData(prev =>
                    prev.filter((record) => !selectedRows.includes(record.picture_id))
                );

                toast.success("Marked as shipped successfully");
            })
            .catch((error) => {
                console.error("Error:", error);
                toast.error("Failed to mark as shipped");
            })
            .finally(() => {
                setIsConfirmationDialogOpen(false);
                setLoading(false);
            }
            )
    }

    const handleGenerateReport = () => {
        setLoading(true)

        try {
            let data: InvoiceByDate = {
                date: selectedDate,
                records: tableData.map(
                    row => ({
                        container_number: row.container_number,
                        age: row.age,
                        variety_name: row.variety_name,
                        breeder_name: row.breeder_name,
                        size_cm: row.size_cm,
                        total_weight: row.total_weight,
                        pcs: row.pcs,
                        jpy_cost: row.jpy_cost,
                        jpy_total: row.jpy_total,
                        box_count: row.box_count
                    } as InvoiceByDateTableRecord)
                )
            };

            fetch("/api/excel-report", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ payload: data }),
            })
                .then((res) => res.json())
                .then((data) => {
                    console.log("Success:", data);
                    toast.success("Report generated successfully");

                    let url = data.url;
                    window.open(url, "_blank");
                })
                .catch((error) => {
                    console.error("Error:", error);
                    toast.error("Failed to generate report");
                })
                .finally(() => {
                    setLoading(false);
                });
        }

        catch (error) {
            console.error("Error:", error);
            toast.error("Failed to generate report");
        }


    }


    const handleThumbnailSheetGeneration = async () => {
        setLoading(true);
        try {
          const data = tableData.map(row => ({
            picture_id: row.picture_id,
            variety: row.variety_name,
            size: row.size_cm,
          }));
      
          const response = await fetch('/api/thumbnails/pdf', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ items: data }),
          });
      
          if (!response.ok) {
            throw new Error('Failed to generate PDF');
          }
      
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
      
          const link = document.createElement('a');
          link.href = url;
          link.download = 'thumbnail-sheet.pdf'; // Name of the downloaded file
          document.body.appendChild(link);
          link.click();
          link.remove();
      
          // Cleanup the blob URL after download
          window.URL.revokeObjectURL(url);
      
        } catch (error) {
          console.error('Error generating or downloading PDF:', error);
        }
        finally {
          setLoading(false);
        }
      };
      

    return (
        <div className="rounded-[10px] bg-white shadow-1 dark:bg-gray-dark dark:shadow-card px-8 pt-4 space-y-4" style={{ height: "85vh", overflowY: "auto" }}>
            {/* {JSON.stringify(tableData[0])} */}
            <ConfirmationDialog
                isOpen={isConfirmationDialogOpen}
                title="Mark as Shipped"
                message="Are you sure you want to mark the selected koi as shipped?"
                onConfirm={handleMarkAsShipped}
                onCancel={() => setIsConfirmationDialogOpen(false)}
                variant='destructive'
            />

            <div className="flex items-center gap-4">
                <label className="font-medium text-gray-600 dark:text-gray-300">Ship Date:</label>
                <Picker value={selectedDate} setValue={setSelectedDate} items={uniqueDates} />

                <label className="font-medium text-gray-600 dark:text-gray-300">Breeder:</label>
                <Picker
                    value={selectedBreeder}
                    setValue={setSelectedBreeder}
                    items={uniqueBreeders}
                    disabled={!selectedDate}
                />

                {/* // clear breeder filter button */}
                <button
                    className="px-2 py-0.5 text-red-500 border-red-500 border-2 rounded hover:opacity-80 hover:bg-red-500 hover:text-white"
                    onClick={() => {
                        setSelectedBreeder("");
                        setSelectedDate("");
                    }}
                >
                    Clear Filters
                </button>

                <button
                    className={cn(
                        "px-4 py-2 bg-yellow-600 text-white font-semibold rounded shadow-sm hover:bg-yellow-700 transition-colors duration-200 ml-auto",
                        {
                            "cursor-not-allowed opacity-60": !selectedDate,
                        }
                    )}
                    onClick={handleGenerateReport}
                    disabled={!selectedDate}
                >
                    Generate Report
                </button>

                <button
                    className={cn(
                        "px-4 py-2 bg-blue-600 text-white font-semibold rounded shadow-sm hover:bg-blue-700 transition-colors duration-200 ml-auto",
                        {
                            "cursor-not-allowed opacity-60": !selectedDate,
                        }
                    )}
                    onClick={handleThumbnailSheetGeneration}
                    disabled={!selectedDate}
                >
                    Generate Thumbnail Sheet
                </button>


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
                    { key: "total_weight", header: "Total Kgs" },
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





function groupRecords(records: KoiSaleRecord[], date: string, breeder: string) {
    // Filter by date and breeder
    let groupedRecords = records.filter(record => (record.date === date || date === "") && (record.breeder_name === breeder || breeder === ""));

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