'use client'
import { useLoading } from '@/app/loading-context';
import { FilteredTextboxDropdown } from '@/components/FormElements/filteredselect'
import { DataTable } from '@/components/Layouts/ShippingTable';
import { Breeder, KoiInfo, ShippingData } from '@/types/koi';
import React, { useEffect, useMemo, useState } from 'react'



const page = () => {
  const { setLoading } = useLoading();
  const [selectedBreeder, setSelectedBreeder] = useState<string | null>(null);
  const [data, setData] = useState<any[]>([]);
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [shippingData, setShippingData] = useState<Record<string, ShippingData>>({})

  useEffect(() => {
    setLoading(true);
    fetch(`/api/koi?shipped=false`, { next: { revalidate: false } })
      .then((response) => response.json())
      .then((data) => {
        setData(data);

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
      const filtered = data?.filter((item) => String(item.breeder_id) === selectedBreeder);
      setFilteredData(filtered);
    }
    else {
      setSelectedBreeder(breederOptions)
    }
  }, [selectedBreeder, data]);


  const handleSubmit = async () => {
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
    console.log("Result", result);
    if (response.ok) {
      alert("Data saved successfully");
    } else {
      alert("Error saving data");
    }
    setLoading(false);
  }


  return (
    <div className="rounded-[10px] bg-white shadow-1 dark:bg-gray-dark dark:shadow-card px-8 pt-4 space-y-4" style={{ height: "85vh", overflowY: "auto" }}>
      <div className="flex items-end gap-4">
        <FilteredTextboxDropdown
          placeholder="Select a breeder"
          items={breederOptions}
          onChange={(value) => {
            setSelectedBreeder(value);
          }}
        />

        <button
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          onClick={handleSubmit}
        >
          Submit
        </button>


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