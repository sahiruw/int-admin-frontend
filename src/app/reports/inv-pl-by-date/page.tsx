'use client';
import { useAppDispatch, useAppSelector } from '@/store';
import {
  fetchInvoiceData,
  markAsShipped,
  generateInvoiceReport,
  generateThumbnailSheet,
  setSelectedDate,
  setSelectedBreeder,
  setConfirmationDialogOpen,
  clearFilters,
  toggleSelectedRow,
  updateTableData,
} from '@/store/slices/invoiceSlice';
import DatePickerOne from '@/components/FormElements/DatePicker/DatePickerOne';
import { Picker } from '@/components/FormElements/Dropdown';
import { ConfirmationDialog } from '@/components/Layouts/ConfirmationDialog';
import { DataTable } from '@/components/Layouts/tables/uneditable';
import { Dropdown } from '@/components/ui/dropdown';
import { cn } from '@/lib/utils';
import { KoiSaleRecord } from '@/types/koi';
import React, { useEffect, useMemo } from 'react'

const Page = () => {
    const dispatch = useAppDispatch();
    const {
        data,
        tableData,
        selectedDate,
        selectedBreeder,
        selectedRows,
        loading,
        isConfirmationDialogOpen,
    } = useAppSelector((state) => state.invoice);

    // Fetch data on component mount
    useEffect(() => {
        dispatch(fetchInvoiceData());
    }, [dispatch]);

    // Update table data when filters change
    useEffect(() => {
        dispatch(updateTableData());
    }, [dispatch, selectedDate, selectedBreeder]);

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

    const handleToggleSelectedRow = (isSelected: boolean, row?: KoiSaleRecord) => {
        dispatch(toggleSelectedRow({ isSelected, row }));
    };

    const handleMarkAsShipped = () => {
        dispatch(markAsShipped(selectedRows));
    };

    const handleGenerateReport = () => {
        dispatch(generateInvoiceReport({ selectedDate, tableData }));
    };

    const handleThumbnailSheetGeneration = () => {
        dispatch(generateThumbnailSheet(tableData));
    };

    const handleClearFilters = () => {
        dispatch(clearFilters());
    };


    return (
        <div className="rounded-[10px] bg-white shadow-1 dark:bg-gray-dark dark:shadow-card px-8 pt-4 space-y-4" style={{ height: "85vh", overflowY: "auto" }}>
            {/* {JSON.stringify(tableData[0])} */}            <ConfirmationDialog
                isOpen={isConfirmationDialogOpen}
                title="Mark as Shipped"
                message="Are you sure you want to mark the selected koi as shipped?"
                onConfirm={handleMarkAsShipped}
                onCancel={() => dispatch(setConfirmationDialogOpen(false))}
                variant='destructive'
            />

            <div className="flex items-end justify-between w-full gap-4">
                <div className="flex items-end gap-4">                    <label className="font-medium text-gray-600 dark:text-gray-300">Ship Date:</label>
                    <Picker 
                        value={selectedDate} 
                        setValue={(value: string) => dispatch(setSelectedDate(value))} 
                        items={uniqueDates} 
                        width='w-32' 
                    />

                    <label className="font-medium text-gray-600 dark:text-gray-300">Breeder:</label>
                    <Picker
                        value={selectedBreeder}
                        setValue={(value: string) => dispatch(setSelectedBreeder(value))}
                        items={uniqueBreeders}
                        disabled={!selectedDate}
                        width='w-48'
                    />

                    {/* // clear breeder filter button */}
                    <button
                        className="px-2 py-0.5 text-red-500 border-red-500 border-2 rounded hover:opacity-80 hover:bg-red-500 hover:text-white"
                        onClick={handleClearFilters}
                    >
                        Clear Filters
                    </button>

                    <button
                        className={cn("px-2 py-0.5 text-primary border-primary border-2 rounded hover:opacity-80 hover:bg-primary hover:text-white", {
                            "cursor-not-allowed opacity-80": selectedRows.length === 0
                        })}
                        onClick={() => dispatch(setConfirmationDialogOpen(true))}
                        disabled={selectedRows.length === 0}
                    >
                        Mark as Shipped
                    </button>



                </div>

                <div className="flex items-end gap-4">
                    <button
                        className={cn(
                            "px-4 py-2 bg-yellow-600 text-white font-semibold rounded shadow-sm hover:bg-yellow-700 transition-colors duration-200",
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
                            "px-4 py-2 bg-blue-600 text-white font-semibold rounded shadow-sm hover:bg-blue-700 transition-colors duration-200",
                            {
                                "cursor-not-allowed opacity-60": !selectedDate,
                            }
                        )}
                        onClick={handleThumbnailSheetGeneration}
                        disabled={!selectedDate}
                    >
                        Thumbnail Sheet
                    </button>
                </div>
            </div>            <DataTable
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
                toggleSelectedRow={handleToggleSelectedRow}
            />

        </div>
    );
};

export default Page;
