'use client';
import { useLoading } from '@/app/loading-context';
import { Picker } from '@/components/FormElements/Dropdown';
import { FilteredTextboxDropdown } from '@/components/FormElements/filteredselect';
import { DataTable } from '@/components/Layouts/tables/uneditable';
import { cn } from '@/lib/utils';
import { KoiInfo, KoiSaleRecord } from '@/types/koi';
import { InvoiceByDate } from '@/types/report';
import React, { useEffect, useMemo, useState } from 'react'
import { toast } from 'react-hot-toast'

const Page = () => {
    const { setLoading } = useLoading();
    const [data, setData] = useState<KoiSaleRecord[]>([]);
    const [selectedCustomer, setSelectedCustomer] = useState<string>("");
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

    const uniqueCustomers = useMemo(() => {
        const uniqueCustomers = new Set<string>();
        data.forEach((record) => {
            if (record.customer_name) {
                uniqueCustomers.add(record.customer_name);
            }
        });
        return Array.from(uniqueCustomers);
    }, [data]);


    useEffect(() => {
        const groupTotals: Record<
          string, // breeder_id
          Record<string, { numerator: number; denominator: number }> // grouping totals
        > = {};
      
        data.forEach(row => {
          if (
            row.breeder_id &&
            row.grouping &&
            row.weight_of_box &&
            row.box_count &&
            row.pcs
          ) {
            const breeder = row.breeder_id;
            const group = row.grouping;
            const weightSum = row.weight_of_box * row.box_count;
            const pcs = row.pcs;
      
            if (!groupTotals[breeder]) {
              groupTotals[breeder] = {};
            }
      
            if (!groupTotals[breeder][group]) {
              groupTotals[breeder][group] = { numerator: 0, denominator: 0 };
            }
      
            groupTotals[breeder][group].numerator += weightSum;
            groupTotals[breeder][group].denominator += pcs;
          }
        });
      
        const result: Record<string, Record<string, number>> = {};
        for (const breeder in groupTotals) {
          result[breeder] = {};
          for (const group in groupTotals[breeder]) {
            const { numerator, denominator } = groupTotals[breeder][group];
            result[breeder][group] = denominator !== 0 ? numerator / denominator : 0;
          }
        }
      
        let newData = data.map((item) => {
            const group = item.grouping;
            const breeder = item.breeder_id;
            const weight = result[breeder]?.[group] || "";
            return {
                ...item,
                sc_per_koi: weight,
            };
            }
        ).filter((item) => {
            if (selectedCustomer) {
                return item.customer_name === selectedCustomer;
            }
            return true;
        }
    )

        setTableData(newData);
      }, [data, selectedCustomer]);
      


    const handleGenerateReport = () => {
              setLoading(true)
      
              try {
                let data = {
                    customer: selectedCustomer,
                    records: tableData
                };
      
                  fetch("/api/excel-report/inv-by-customer", {
                      method: "POST",
                      headers: {
                          "Content-Type": "application/json",
                      },
                      body: JSON.stringify({ payload: data }),
                  })
                      .then(async (res) => {
                          if (!res.ok) throw new Error("Failed to generate report");
                  
                          const blob = await res.blob();
                          const url = window.URL.createObjectURL(blob);
                  
                          // Create a temporary link to download the file
                          const link = document.createElement("a");
                          link.href = url;
                          link.download = `Koi_Report_${Date.now()}.xlsx`;
                          document.body.appendChild(link);
                          link.click();
                  
                          // Cleanup
                          link.remove();
                          window.URL.revokeObjectURL(url);
                  
                          toast.success("Report downloaded successfully");
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

                    <FilteredTextboxDropdown
                                placeholder={selectedCustomer ? selectedCustomer : "Select Customer"}
                                items={uniqueCustomers.map((item => ({
                                    value: item,
                                    label: item
                                })))}
                                onChange={(value) => {
                                  setSelectedCustomer(value);
                                }}
                              />

                              
                </div>

                <div className="flex items-end gap-4">
                    <button
                        className={cn(
                            "px-4 py-2 bg-yellow-600 text-white font-semibold rounded shadow-sm hover:bg-yellow-700 transition-colors duration-200 ml-auto",
                            {
                                "cursor-not-allowed opacity-60": !selectedCustomer,
                            }
                        )}
                        onClick={handleGenerateReport}
                        disabled={!selectedCustomer}
                    >
                        Generate Report
                    </button>

                    <button
                        className={cn(
                            "px-4 py-2 bg-blue-600 text-white font-semibold rounded shadow-sm hover:bg-blue-700 transition-colors duration-200 ml-auto",
                            {
                                "cursor-not-allowed opacity-60": !selectedCustomer,
                            }
                        )}
                        onClick={handleThumbnailSheetGeneration}
                        disabled={!selectedCustomer}
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
                    // {key: "sex", header: "Sex"},
                    // { key: "age", header: "Age" },
                    { key: "size_cm", header: "Size" },
                    { key: "breeder_name", header: "Breeder" },
                    { key: "pcs", header: "PCS" },

                    { key: "sale_price_jpy", header: "Sales" },
                    { key: "comm_jpy", header: "Commission" },
                    { key: "total_jpy_sales", header: "Total Sales" },
                    // Ship Date	# of Box	Box Size	KG	Total KG
                    { key: "date", header: "Ship Date" },
                    { key: "box_count", header: "# of Box" },
                    { key: "box_size", header: "Box Size" },
                    { key: "weight_of_box", header: "KG" },
                    { key: "total_weight", header: "Total KG" },
                    {key : "sc_per_koi", header: "S/C Per Koi"}



                ]}
                label=''
                maxHeight='72vh'
            />

        </div>
    );
};

export default Page;
