'use client';
import React, { useEffect, useState } from 'react';
import DatePickerOne from '@/components/FormElements/DatePicker/DatePickerOne';
import { FilteredTextboxDropdown } from "@/components/FormElements/filteredselect";

const Page = () => {
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [dateRange, setDateRange] = useState<string>('');
  const [filteredSales, setFilteredSales] = useState<any[]>([]);
  const [allSales, setAllSales] = useState<any[]>([]);

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

  const fetchSales = async (start: string, end: string) => {
    const query = `api/sales?start=${start}&end=${end}`;
    const res = await fetch(query);
    const data = await res.json();
    return data;
  };

  const applyDateRange = async (rangeInText: string) => {
    const today = new Date();
    const startDateFunc = dateRangeMap[rangeInText];

    if (startDateFunc) {
      const start = formatDateToString(startDateFunc(today));
      const end = formatDateToString(today);
      setStartDate(start);
      setEndDate(end);
      const data = await fetchSales(start, end);
      setFilteredSales(data);
    }

    setDateRange(rangeInText);
  };

  useEffect(() => {
    // 1. Fetch all sales data
    fetchSales('', '').then(setAllSales);

    // 2. Apply default date range: last month
    applyDateRange('last-month');
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
            onDateChange={async (date: string) => {
              setStartDate(date);
              setDateRange('');
              if (date && endDate) {
            const data = await fetchSales(date, endDate);
            setFilteredSales(data);
              }
            }}
            value={startDate}
            label='Start Date'
            maxDate={endDate}
          />
        </div>
        <div>
          <DatePickerOne
            onDateChange={async (date : string) => {
              setEndDate(date);
              setDateRange('');
              if (startDate && date) {
                const data = await fetchSales(startDate, date);
                setFilteredSales(data);
              }
            }}
            value={endDate}
            label='End Date'
            minDate={startDate}
          />
        </div>
      </div>

      {/* Optional: Render your data here */}
      <div className="mt-8">
        <h2 className="text-lg font-bold mb-2">Filtered Sales</h2>
        <pre>{JSON.stringify(filteredSales, null, 2)}</pre>

        <h2 className="text-lg font-bold mt-6 mb-2">All Sales</h2>
        <pre>{JSON.stringify(allSales, null, 2)}</pre>
      </div>
    </div>
  );
};

export default Page;
