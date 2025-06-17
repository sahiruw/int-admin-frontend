'use client'
import React, { useEffect, useState } from 'react'
import { KoiInfoTable } from '@/components/Layouts/koi-table'
import { KoiInfo } from '@/types/koi';
import { Button } from '@/components/ui-elements/button';
import { FilteredMultiSelectTextboxDropdown } from "@/components/FormElements/filteredMultiselect";

import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Checkbox } from '@/components/FormElements/checkbox';
import { AddKoiForm } from '@/components/Layouts/add-koi-form';
import { useAppDispatch, useAppSelector } from '@/store';
import { fetchKoiList, setFilters, resetFilters } from '@/store/slices/koiSlice';

export default function Page() {
  const dispatch = useAppDispatch();
  const { koiList, filteredKoiList, filters, isLoading } = useAppSelector((state) => state.koi);
  const [isReset, setIsReset] = useState<boolean>(false);
  const [localFilters, setLocalFilters] = useState<Record<string, string[]>>({});

  const [editingKoiId, setEditingKoiId] = useState<string | null>(null);

  // Format data for dropdown
  const formatDataForDropdown = (data: KoiInfo[], key: keyof KoiInfo) => {
    const uniqueValues = Array.from(new Set(data.map(item => item[key] as string).filter(Boolean)));
    return uniqueValues.map(value => ({ value, label: value }));
  };

  useEffect(() => {
    dispatch(fetchKoiList());
  }, [dispatch]);  useEffect(() => {
    if (localFilters && Object.keys(localFilters).length > 0) {
      dispatch(setFilters(localFilters));
    }
  }, [localFilters, dispatch]);

  const handleResetFilters = () => {
    setLocalFilters({});
    dispatch(resetFilters());
    setIsReset(true);
    setTimeout(() => {
      setIsReset(false);
    }, 10);
  };

  return (
    <div className=" bg-white shadow-1 dark:bg-gray-dark dark:shadow-card px-8 py-4" style={{ height: '84vh', overflow: 'auto' }}>      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-4 items-end justify-items-center">
        {editingKoiId && koiList.find(koi => koi.picture_id === editingKoiId) &&
          (
            <AddKoiForm 
              koi={koiList.find(koi => koi.picture_id === editingKoiId)!} 
              onClose={() => setEditingKoiId(null)} 
              setData={() => dispatch(fetchKoiList())} 
            />
          )}

        <FilteredMultiSelectTextboxDropdown
          label="Variety"
          items={formatDataForDropdown(koiList, 'variety_name')}
          placeholder='Select Variety'          onChange={(selectedValues) => {
            const newFilters = { ...localFilters, variety_name: selectedValues };
            setLocalFilters(newFilters);
            dispatch(setFilters(newFilters));
          }}
          reset={isReset}
        />

        <FilteredMultiSelectTextboxDropdown
          label="Breeder"
          items={formatDataForDropdown(koiList, 'breeder_name')}
          placeholder='Select Breeder'          onChange={(selectedValues) => {
            const newFilters = { ...localFilters, breeder_name: selectedValues };
            setLocalFilters(newFilters);
            dispatch(setFilters(newFilters));
          }}
          reset={isReset}
        />

        <FilteredMultiSelectTextboxDropdown
          label="Customer"
          items={formatDataForDropdown(koiList, 'customer_name')}
          placeholder='Select Customer'          onChange={(selectedValues) => {
            const newFilters = { ...localFilters, customer_name: selectedValues };
            setLocalFilters(newFilters);
            dispatch(setFilters(newFilters));
          }}
          reset={isReset}
        />        <FilteredMultiSelectTextboxDropdown
          label="Shipping Status"
          items={[{ value: 'Yes', label: 'Yes' }, { value: 'No', label: 'No' }]}
          placeholder='Select Shipping Status'
          onChange={(selectedValues) => {
            const newFilters = { ...localFilters, shipped: selectedValues };
            setLocalFilters(newFilters);
            dispatch(setFilters(newFilters));
          }}
          reset={isReset}
        />

        <Button variant="primary" shape={'rounded'} onClick={handleResetFilters} label='Reset' className='h-10 max-w-12' />
      </div>      <KoiInfoTable data={filteredKoiList} setEditingKoiId={setEditingKoiId} />
    </div>
  )
}


