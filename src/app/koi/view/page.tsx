'use client'
import React, { useEffect, useState } from 'react'
import { KoiInfoTable } from '@/components/Layouts/koi-table'
import { KoiInfo } from '@/types/koi';
import { Button } from '@/components/ui-elements/button';
import { FilteredMultiSelectTextboxDropdown } from "@/components/FormElements/filteredMultiselect";

import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

export default function Page() {
  const [data, setData] = useState<KoiInfo[]>([]);
  const [filteredData, setFilteredData] = useState<KoiInfo[]>([]);
  const [filters, setFilters] = useState<Record<string, string[]>>({}); // { variety: ['Kohaku', 'Sanke'] }
  const [isReset, setIsReset] = useState<boolean>(false);

  useEffect(() => {
    fetch('/api/koi', { next: { revalidate: 300 } })
      .then((response) => response.json())
      .then((data) => {
        const formattedData = data.map((item: KoiInfo) => ({
          ...item,
          timestamp: new Date(item.timestamp),
        }));
        setData(formattedData);
        setFilteredData(formattedData);
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
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
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">

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


        <div className="flex gap-2">
          <Button variant="outlinePrimary" onClick={resetFilters} label='Reset'
          >Reset</Button>
        </div>
      </div>

      <KoiInfoTable data={filteredData} />
    </div>
  )
}


function formatDataForDropdown(data: KoiInfo[], key: string) {
  const uniqueItems = Array.from(new Set(data.map((item) => item[key])));
  return uniqueItems
    .sort()
    .map((value) => ({ value, label: value }));
}