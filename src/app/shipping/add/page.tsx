'use client'
import { useLoading } from '@/app/loading-context';
import { groupRecords } from '@/app/reports/inv-pl-by-date/page';
import { Picker } from '@/components/FormElements/Dropdown';
import { FilteredTextboxDropdown } from '@/components/FormElements/filteredselect'
import { DataTable } from '@/components/Layouts/ShippingTable';
import { cn } from '@/lib/utils';
import { Breeder, KoiInfo, ShippingData } from '@/types/koi';
import React, { useEffect, useMemo, useState } from 'react'
import { toast } from 'react-hot-toast'

const page = () => {
  const { setLoading } = useLoading();
  const [selectedBreeder, setSelectedBreeder] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [data, setData] = useState<any[]>([]);
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [shippingData, setShippingData] = useState<Record<string, ShippingData>>({})

  useEffect(() => {
    setLoading(true);
    fetch(`/api/koi?shipped=false`, { next: { revalidate: false } })
      .then((response) => response.json())
      .then((data) => {
        setData(groupRecords(data));

      })
      .catch((error) => {
        console.error('Error fetching data:', error);
      })
      .finally(() => {
        setLoading(false);
      });

  }, []);

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
    setSelectedBreeder(fdata[0]?.value)
    return fdata
  }, [data]);

  useEffect(() => {
    if (selectedBreeder) {
      const filtered = data?.filter((item) => String(item.breeder_id) === selectedBreeder &&
        (selectedDate ? item.date === selectedDate || selectedDate === "Any" : true))
      setFilteredData(filtered);
    }
    else {
      setSelectedBreeder(breederOptions)
    }
  }, [selectedBreeder, data, selectedDate]);

  useEffect(() => {
    setSelectedDate(null);
  }, [selectedBreeder]);


  const handleSubmit = async () => {
    try {
      setLoading(true);
      const payload = Object.entries(shippingData).map(([key, value]) => ({
        picture_id: key,
        ...value,
      }));

      console.log("Payload", payload);
      const response = await fetch('/api/shipping', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ payload }),
      });
      const result = await response.json();

      if (response.ok) {
        toast.success("Data saved successfully");

        // update the filtered data
        const updatedData = data.map((item) => {
          const updatedItem = payload.find((record) => record.picture_id === item.picture_id);
          if (updatedItem) {
            return { ...item, ...updatedItem };
          }
          return item;
        });
        setFilteredData(groupRecords(updatedData));
        setShippingData({})
      } else {
        toast.error("Error saving data");
      }
    }
    catch (error) {
      console.error('Error:', error);
      toast.error("Error saving data");
    }
    finally {
      setLoading(false);
    }
  }

  const uniqueDates = useMemo(
    () =>
      ["Any"].concat(Array.from(new Set(data.filter((item) => String(item.breeder_id) === selectedBreeder).map((record) => record.date))).sort((a, b) =>
        new Date(b).getTime() - new Date(a).getTime()
      )),
    [filteredData]
  );

  const handleThumbnailSheetGeneration = async () => {
    setLoading(true);
    try {
      const data = filteredData.map(row => ({
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

  const handleGenerateReport = () => {
          setLoading(true)
  
          try {
              let data = {
                  date: selectedDate,
                  breeder: breederOptions.find((item) => item.value === selectedBreeder)?.label,
                  breederID: selectedBreeder,
                  records: filteredData
              };
  
              fetch("/api/excel-report/shipping-request", {
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


  return (
    <div className="rounded-[10px] bg-white shadow-1 dark:bg-gray-dark dark:shadow-card px-8 pt-4 space-y-4" style={{ height: "83vh", overflowY: "auto" }}>
      <div className="flex items-end justify-between w-full gap-4">
        {/* Left section: dropdowns + Submit */}
        <div className="flex items-end gap-4">
          <FilteredTextboxDropdown
            placeholder={breederOptions.find((item) => item.value === selectedBreeder)?.label}
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

        {/* Right section: Other buttons */}
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
      </div>



      <DataTable
        rawData={filteredData}
        setShippingData={setShippingData}
        shippingData={shippingData}
      />

    </div>
  )
}

export default page