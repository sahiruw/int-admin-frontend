'use client'

import { useLoading } from '@/app/loading-context';
import { groupRecords } from '@/app/reports/inv-pl-by-date/page';
import { Picker } from '@/components/FormElements/Dropdown';
import { FilteredTextboxDropdown } from '@/components/FormElements/filteredselect'
import { DataTable } from '@/components/Layouts/ShippingTable';
import { cn } from '@/lib/utils';
import { KoiInfo, ShippingData } from '@/types/koi';
import React, { useEffect, useMemo, useState } from 'react'
import { toast } from 'react-hot-toast'

const normalizeDateOnly = (value: unknown) => {
  if (!value) return null;
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return null;
    return trimmed.includes("T") ? trimmed.split("T")[0] : trimmed;
  }

  if (value instanceof Date) {
    return value.toISOString().split("T")[0];
  }

  return null;
};

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
      .then((records) => {
        const normalizedRecords = (records || []).map((record: any) => ({
          ...record,
          date: normalizeDateOnly(record.date),
        }));
        setData(groupRecords(normalizedRecords));
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
      })
      .finally(() => {
        setLoading(false);
      });

  }, []);

  const breederOptions = useMemo(() => {
    return data?.reduce((acc: { label: string; value: string }[], breeder: KoiInfo) => {
      const breederId = String(breeder.breeder_id);
      if (!acc.some(item => item.value === breederId)) {
        acc.push({
          label: breeder.breeder_name,
          value: breederId,
        });
      }
      return acc;
    }, [])
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [data]);

  useEffect(() => {
    if (!selectedBreeder) {
      setFilteredData(data);
      return;
    }

    const filtered = data?.filter((item) =>
      String(item.breeder_id) === selectedBreeder &&
      (selectedDate ? item.date === selectedDate || selectedDate === "Any" : true)
    );
    setFilteredData(filtered);
  }, [selectedBreeder, data, selectedDate]);

  useEffect(() => {
    setSelectedDate(null);
  }, [selectedBreeder]);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const payload = Object.entries(shippingData).map(([key, value]) => ({
        picture_id: key,
        ...Object.fromEntries(
          Object.entries(value).map(([k, v]) => [k, v === "" ? null : v]),
        ),
      }));

      if (payload.length === 0) {
        toast("No changes to save");
        return;
      }

      const response = await fetch('/api/shipping', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ payload }),
      });

      const result = await response.json();
      if (!response.ok) {
        toast.error(result?.error || "Error saving data");
        return;
      }

      const savedIds = new Set<string>(result?.savedPictureIds || []);
      const failedIds = new Set<string>(
        (result?.failures || []).map((item: { picture_id: string }) => item.picture_id),
      );

      const updatedData = data.map((item) => {
        if (!savedIds.has(item.picture_id)) return item;
        const updatedItem = payload.find((record) => record.picture_id === item.picture_id);
        return updatedItem ? { ...item, ...updatedItem } : item;
      });

      setData(updatedData);

      if (failedIds.size > 0) {
        setShippingData((prev) =>
          Object.fromEntries(
            Object.entries(prev).filter(([pictureId]) => failedIds.has(pictureId)),
          ),
        );
        toast.error(
          `Saved ${result?.successCount || 0} row(s), ${result?.failedCount || 0} failed. Please retry failed rows.`,
        );
      } else {
        setShippingData({});
        toast.success("Data saved successfully");
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
      ["Any"].concat(Array.from(
        new Set(
          data
            .filter((item) => String(item.breeder_id) === selectedBreeder)
            .map((record) => record.date),
        ),
      ).sort((a, b) =>
        new Date(b).getTime() - new Date(a).getTime(),
      )),
    [data, selectedBreeder]
  );

  const handleThumbnailSheetGeneration = async () => {
    setLoading(true);
    try {
      const thumbnailItems = filteredData.map(row => ({
        picture_id: row.picture_id,
        variety: row.variety_name,
        size: row.size_cm,
      }));

      const response = await fetch('/api/thumbnails/pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ items: thumbnailItems }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate PDF');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = 'thumbnail-sheet.pdf';
      document.body.appendChild(link);
      link.click();
      link.remove();

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
      const reportPayload = {
        date: selectedDate,
        breeder: breederOptions.find((item: any) => item.value === selectedBreeder)?.label,
        breederID: selectedBreeder,
        records: filteredData
      };

      fetch("/api/excel-report/shipping-request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ payload: reportPayload }),
      })
        .then(async (res) => {
          if (!res.ok) throw new Error("Failed to generate report");

          const blob = await res.blob();
          const url = window.URL.createObjectURL(blob);

          const link = document.createElement("a");
          link.href = url;
          link.download = `Koi_Report_${Date.now()}.xlsx`;
          document.body.appendChild(link);
          link.click();

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
    <div className="rounded-[10px] bg-white shadow-1 dark:bg-gray-dark dark:shadow-card px-8 pt-4 space-y-4" style={{ height: "85vh", overflowY: "auto" }}>
      <div className="flex items-end justify-between w-full gap-4">
        <div className="flex items-end gap-4">
          <FilteredTextboxDropdown
            placeholder={breederOptions.find((item: any) => item.value === selectedBreeder)?.label}
            items={breederOptions}
            onChange={(value) => {
              setSelectedBreeder(value);
            }}
          />

          <Picker
            value={selectedDate || ""}
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
