'use client';
import { useLoading } from '@/app/loading-context';
import { Picker } from '@/components/FormElements/Dropdown';
import { DataTable } from '@/components/Layouts/tables/uneditable';
import { cn } from '@/lib/utils';
import { KoiInfo, KoiSaleRecord } from '@/types/koi';
import { InvoiceByDate } from '@/types/report';
import React, { useEffect, useMemo, useState } from 'react'
import { toast } from 'react-hot-toast'

const Page = () => {
    const { setLoading } = useLoading();
    const [data, setData] = useState<KoiSaleRecord[]>([]);
    const [selectedBreeder, setSelectedBreeder] = useState<string>("");
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
            console.log("Data changed:", selectedBreeder);
            const grouped = data
            console.log("Grouped data:", grouped.length);
            setTableData(grouped);
        }
    }, [data, selectedBreeder]);


    const uniqueBreeders = useMemo(
        () =>
            Array.from(new Set(tableData.map((record) => record.breeder_name))).sort(),
        [tableData]
    );



    const handleGenerateReport = () => {
        setLoading(true)

        try {
            let data: InvoiceByDate = {
                date: selectedDate,
                records: tableData.map(
                    row => ({
                        age: row.age,
                        variety_name: row.variety_name,
                        breeder_name: row.breeder_name,
                        sales: row.sale_price_jpy * row.pcs,
                        commission: row.comm_jpy,
                        total_sales: row.total_jpy_sales,
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
        <div className="rounded-[10px] bg-white shadow-1 dark:bg-gray-dark dark:shadow-card px-8 pt-4 space-y-4" style={{ height: "83vh", overflowY: "auto" }}>

            <div className="flex items-end justify-between w-full gap-4">
                <div className="flex items-end gap-4">

                    <label className="font-medium text-gray-600 dark:text-gray-300">Customer:</label>
                    <Picker
                        value={selectedBreeder}
                        setValue={setSelectedBreeder}
                        items={uniqueBreeders}
                        disabled={!selectedBreeder}
                    />

                    {/* // clear breeder filter button */}
                    <button
                        className="px-2 py-0.5 text-red-500 border-red-500 border-2 rounded hover:opacity-80 hover:bg-red-500 hover:text-white"
                        onClick={() => {
                            setSelectedBreeder("");
                        }}
                    >
                        Clear Filters
                    </button>
                </div>

                <div className="flex items-end gap-4">
                    <button
                        className={cn(
                            "px-4 py-2 bg-yellow-600 text-white font-semibold rounded shadow-sm hover:bg-yellow-700 transition-colors duration-200 ml-auto",
                            {
                                "cursor-not-allowed opacity-60": !selectedBreeder,
                            }
                        )}
                        onClick={handleGenerateReport}
                        disabled={!selectedBreeder}
                    >
                        Generate Report
                    </button>

                    <button
                        className={cn(
                            "px-4 py-2 bg-blue-600 text-white font-semibold rounded shadow-sm hover:bg-blue-700 transition-colors duration-200 ml-auto",
                            {
                                "cursor-not-allowed opacity-60": !selectedBreeder,
                            }
                        )}
                        onClick={handleThumbnailSheetGeneration}
                        disabled={!selectedBreeder}
                    >
                        Generate Thumbnail Sheet
                    </button>


                </div>
            </div>

            <DataTable
                data={tableData}
                columns={[
                    { key: "picture_id", header: "Picture ID" },
                    { key: "variety_name", header: "Variety" },
                    { key: "age", header: "Age" },
                    { key: "breeder_name", header: "Breeder" },
                    { key: "pcs", header: "PCS" },
                    { key: "sales", header: "Sales" },
                    { key: "commission", header: "Commission" },
                    { key: "total_sales", header: "Total Sales" },




                ]}
                label=''

            />

        </div>
    );
};

export default Page;
