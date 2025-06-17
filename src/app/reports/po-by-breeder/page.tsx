'use client'
import React, { useEffect, useMemo, useState } from 'react'
import { toast } from 'react-hot-toast'
import { useAppDispatch, useAppSelector } from '@/store';
import { fetchUnshippedKoi } from '@/store/slices/koiSlice';
import { updateShippingData, generateThumbnailPDF, generateShippingReport, setShippingData } from '@/store/slices/shippingSlice';
import { groupRecords } from '@/store/slices/invoiceSlice';
import { Picker } from '@/components/FormElements/Dropdown';
import { FilteredTextboxDropdown } from '@/components/FormElements/filteredselect'
import { DataTable } from '@/components/Layouts/ShippingTable';
import { cn } from '@/lib/utils';
import { KoiInfo, ShippingData } from '@/types/koi';

const page = () => {
  const dispatch = useAppDispatch();
  const { koiList: data, isLoading } = useAppSelector((state) => state.koi);
  const { shippingData, isLoading: shippingLoading } = useAppSelector((state) => state.shipping);
  
  const [selectedBreeder, setSelectedBreeder] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [filteredData, setFilteredData] = useState<any[]>([]);

  useEffect(() => {
    dispatch(fetchUnshippedKoi());
  }, [dispatch]);

  const breederOptions = useMemo(() => {
    let fdata = data?.reduce((acc: { label: string; value: string }[], breeder: KoiInfo) => {
      if (!acc.some(item => item.value === String(breeder.breeder_id))) {
        acc.push({
          label: breeder.breeder_name,
          value: String(breeder.breeder_id),
        });
      }
      return acc;
    }, [])
      .sort((a, b) => a.label.localeCompare(b.label));
    
    if (fdata.length > 0 && !selectedBreeder) {
      setSelectedBreeder(fdata[0]?.value);
    }
    
    return fdata;
  }, [data, selectedBreeder]);

    useEffect(() => {
    if (selectedBreeder) {
      const groupedData = groupRecords(data);
      const filtered = groupedData?.filter((item) => String(item.breeder_id) === selectedBreeder &&
        (selectedDate ? item.date === selectedDate || selectedDate === "Any" : true))
      setFilteredData(filtered);
    }
  }, [selectedBreeder, data, selectedDate]);

  useEffect(() => {
    setSelectedDate(null);
  }, [selectedBreeder]);

  const handleSubmit = async () => {
    try {
      const payload = Object.entries(shippingData).map(([key, value]) => ({
        picture_id: key,
        ...value,
      }));

      const result = await dispatch(updateShippingData(payload)).unwrap();
      toast.success("Data saved successfully");

      // Refresh the data
      dispatch(fetchUnshippedKoi());
    } catch (error) {
      console.error('Error:', error);
      toast.error("Error saving data");
    }
  };  const uniqueDates = useMemo(
    () => {
      const groupedData = groupRecords(data);
      return ["Any"].concat(Array.from(new Set(
        groupedData.filter((item: any) => String(item.breeder_id) === selectedBreeder)
          .map((record: any) => record.date)
      )).sort((a, b) =>
        new Date(b).getTime() - new Date(a).getTime()
      ));
    },
    [data, selectedBreeder]
  );

  const handleThumbnailSheetGeneration = async () => {
    try {
      const thumbnailData = filteredData.map(row => ({
        picture_id: row.picture_id,
        variety: row.variety_name,
        size: row.size_cm,
      }));

      await dispatch(generateThumbnailPDF(thumbnailData)).unwrap();
      toast.success("PDF generated successfully");
    } catch (error) {
      console.error('Error generating or downloading PDF:', error);
      toast.error("Failed to generate PDF");
    }
  };

  const handleGenerateReport = async () => {
    if (!selectedBreeder) return;
    
    try {
      const reportData = {
        date: selectedDate,
        breeder: breederOptions.find((item) => item.value === selectedBreeder)?.label || '',
        breederID: selectedBreeder,
        records: filteredData
      };

      await dispatch(generateShippingReport(reportData)).unwrap();
      toast.success("Report downloaded successfully");
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to generate report");
    }
  };

  const handleShippingDataUpdate = (data: Record<string, ShippingData> | ((prev: Record<string, ShippingData>) => Record<string, ShippingData>)) => {
    if (typeof data === 'function') {
      const newData = data(shippingData);
      dispatch(setShippingData(newData));
    } else {
      dispatch(setShippingData(data));
    }
  };

  return (
    <div className="rounded-[10px] bg-white shadow-1 dark:bg-gray-dark dark:shadow-card px-8 pt-4 space-y-4" style={{ height: "83vh", overflowY: "auto" }}>
      {(isLoading || shippingLoading) ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
        </div>
      ) : (
        <>
          <div className="flex items-end justify-between w-full gap-4">
            <div className="flex items-end gap-4">              <FilteredTextboxDropdown
                placeholder={breederOptions.find((item) => item.value === selectedBreeder)?.label || 'Select Breeder'}
                items={breederOptions}
                onChange={(value) => {
                  setSelectedBreeder(value);
                }}
              />

              <Picker
                value={selectedDate}
                setValue={setSelectedDate}
                items={uniqueDates}
                width="min-w-min"
                placeholder="Select a Date"
              />

              <button
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                onClick={handleSubmit}
              >
                Submit
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
                disabled={!selectedDate || !selectedBreeder}
              >
                Shipping Request
              </button>

              <button
                className={cn(
                  "px-4 py-2 bg-blue-600 text-white font-semibold rounded shadow-sm hover:bg-blue-700 transition-colors duration-200",
                  {
                    "cursor-not-allowed opacity-60": !selectedDate,
                  }
                )}
                onClick={handleThumbnailSheetGeneration}
                disabled={!selectedDate || !selectedBreeder}
              >
                Thumbnail Sheet
              </button>
            </div>
          </div>          <DataTable
            rawData={filteredData}
            setShippingData={handleShippingDataUpdate}
            shippingData={shippingData}
          />
        </>
      )}
    </div>
  )
}

export default page