'use client'
import React, { useEffect, useState } from 'react'
import { KoiInfoTable } from '@/components/Layouts/koi-table'
import { KoiInfo } from '@/types/koi';
import { Button } from '@/components/ui-elements/button';
import { FilteredMultiSelectTextboxDropdown } from "@/components/FormElements/filteredMultiselect";

import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useLoading } from '@/app/loading-context';
import { Checkbox } from '@/components/FormElements/checkbox';
import { AddKoiForm } from '@/components/Layouts/add-koi-form';

export default function Page() {
  const { setLoading } = useLoading();
  const [data, setData] = useState<KoiInfo[]>([]);
  const [filteredData, setFilteredData] = useState<KoiInfo[]>([]);
  const [filters, setFilters] = useState<Record<string, string[] | boolean[]>>({}); // { variety: ['Kohaku', 'Sanke'] }
  const [isReset, setIsReset] = useState<boolean>(false);

  const [editingKoiId, setEditingKoiId] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch('/api/koi', { next: { revalidate: 300 } })
      .then((response) => response.json())
      .then((data) => {
        const formattedData = data.map((item: KoiInfo) => ({
          ...item,
          timestamp: new Date(item.timestamp),
          shipped: item.shipped ? true : false,
        }));
        setData(formattedData);
        setFilteredData(formattedData);
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    let filteredData = data;

    for (const key in filters) {
      if (filters[key].length) {
        console.log('Filtering by:', key, filters[key]);
        filteredData = filteredData.filter((item) => filters[key].includes(item[key]));
      }
    }

    setFilteredData(filteredData);
  }
    , [filters, data]);


  const resetFilters = () => {
    setFilters({});
    setFilteredData(data);
    setIsReset(true);
    setTimeout(() => {
      setIsReset(false);
    }, 10);
  };

  return (
    <div className=" bg-white shadow-1 dark:bg-gray-dark dark:shadow-card px-8 py-4" style={{ height: '84vh', overflow: 'auto' }}>
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-4 items-end justify-items-center">
        {editingKoiId && data.find(koi => koi.picture_id === editingKoiId) &&
          (
            <AddKoiForm koi={data.find(koi => koi.picture_id === editingKoiId)!} onClose={() => setEditingKoiId(null)} setData={setData}/>
          )}

        <FilteredMultiSelectTextboxDropdown
          label="Variety"
          items={formatDataForDropdown(data, 'variety_name')}
          placeholder='Select Variety'
          onChange={(selectedValues) => {
            setFilters((prev) => ({ ...prev, variety_name: selectedValues }));
          }}
          reset={isReset}
        />

        <FilteredMultiSelectTextboxDropdown
          label="Breeder"
          items={formatDataForDropdown(data, 'breeder_name')}
          placeholder='Select Breeder'
          onChange={(selectedValues) => {
            setFilters((prev) => ({ ...prev, breeder_name: selectedValues }));
          }}
          reset={isReset}
        />

        <FilteredMultiSelectTextboxDropdown
          label="Customer"
          items={formatDataForDropdown(data, 'customer_name')}
          placeholder='Select Customer'
          onChange={(selectedValues) => {
            setFilters((prev) => ({ ...prev, customer_name: selectedValues }));
          }}
          reset={isReset}
        />

        <FilteredMultiSelectTextboxDropdown
          label="Shipping Status"
          items={[{ value: 'Yes', label: 'Yes' }, { value: 'No', label: 'No' }]}
          placeholder='Select Shipping Status'
          onChange={(selectedValues) => {
            setFilters((prev) => ({ ...prev, shipped: selectedValues.map((val) => val === 'Yes') }));
          }}
          reset={isReset}
        />

        <Button variant="primary" shape={'rounded'} onClick={resetFilters} label='Reset' className='h-10 max-w-12' />
      </div>
      <KoiInfoTable data={filteredData} setEditingKoiId={setEditingKoiId} />
    </div>
  )
}


function formatDataForDropdown(data: KoiInfo[], key: string) {
  const uniqueItems = Array.from(new Set(data.map((item) => item[key]))).filter(Boolean);
  return uniqueItems
    .sort()
    .map((value) => ({ value, label: value }));
}


