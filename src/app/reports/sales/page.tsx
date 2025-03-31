'use client';
import React, { useEffect, useState } from 'react';
import DatePickerOne from '@/components/FormElements/DatePicker/DatePickerOne';
import {FilteredTextboxDropdown} from "@/components/FormElements/filteredselect";

const Page = () => {
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [dateRange, setDateRange] = useState<string>('');

  const dateRangeOptions = [
    { label: 'Last Month', value: 'last-month' },
    { label: 'Last 3 Months', value: 'last-3-months' },
    { label: 'Last 6 Months', value: 'last-6-months' },
    { label: 'Last Year', value: 'last-year' },
  ];
  
  const formatDateToString = (date: Date): string =>
    date.toISOString().split('T')[0]; // yyyy-mm-dd
  
  const dateRangeMap: Record<string, (today: Date) => Date> = {
    'last-month': (today) => new Date(today.getFullYear(), today.getMonth() - 1, today.getDate()),
    'last-3-months': (today) => new Date(today.getFullYear(), today.getMonth() - 3, today.getDate()),
    'last-6-months': (today) => new Date(today.getFullYear(), today.getMonth() - 6, today.getDate()),
    'last-year': (today) => new Date(today.getFullYear() - 1, today.getMonth(), today.getDate()),
  };
  
  const applyDateRange = (rangeInText: string) => {
    const today = new Date();
    const startDateFunc = dateRangeMap[rangeInText];
  
    if (startDateFunc) {
      const startDate = startDateFunc(today);
      setStartDate(formatDateToString(startDate));
      setEndDate(formatDateToString(today));
    }

    setDateRange(rangeInText);
  };
  

  useEffect(() => {
    setDateRange('last-month');
  }, []);

  return (
    <div className="rounded-[10px] bg-white shadow-1 dark:bg-gray-dark dark:shadow-card p-8" style={{ height: '80vh', overflow: 'auto' }}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-4">
        <div>
          <FilteredTextboxDropdown
            label="Date Range"
            placeholder="Select Date Range"
            className={dateRange ? "" : "opacity-50"}
            items={dateRangeOptions}
            onChange={(value) => applyDateRange(value)}
            shouldShowSearch={false}
          />

          </div>

        <div>
          <DatePickerOne
            onDateChange={(date) => {
              setStartDate(date);
              setDateRange('');
            }}
            value={startDate}
            label='Start Date'
            maxDate={endDate}
          />
        </div>
        <div>
          <DatePickerOne
            onDateChange={(date) => {
                setEndDate(date);
                setDateRange('');
            }}
            value={endDate}
            label='End Date'
            minDate={startDate}
          />
        </div>
      </div>
    </div>
  );
};

export default Page;
