'use client';
import React, { useEffect, useState } from 'react';
import DatePickerOne from '@/components/FormElements/DatePicker/DatePickerOne';
import { FilteredTextboxDropdown } from "@/components/FormElements/filteredselect";
import { DataTable } from '@/components/Layouts/tables/uneditable';
import { useAppDispatch, useAppSelector } from '@/store';
import { fetchSalesReport, setDateRange, setFilteredSales } from '@/store/slices/reportsSlice';

const Page = () => {
  const dispatch = useAppDispatch();
  const { 
    salesData, 
    filteredSales, 
    salesByCustomer, 
    salesByBreeder, 
    salesByDivision, 
    dateRange, 
    isLoading 
  } = useAppSelector((state) => state.reports);
  
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [localDateRange, setLocalDateRange] = useState<string>('');

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

  const applyDateRange = async (rangeInText: string) => {
    const today = new Date();
    const startDateFunc = dateRangeMap[rangeInText];

    if (startDateFunc) {
      const start = formatDateToString(startDateFunc(today));
      const end = formatDateToString(today);
      setStartDate(start);
      setEndDate(end);
      
      // Dispatch Redux action to fetch sales data
      dispatch(fetchSalesReport({ startDate: start, endDate: end }));
    }

    setLocalDateRange(rangeInText);
    dispatch(setDateRange({ startDate: startDate, endDate: endDate }));
  };

  const handleDateChange = async (newStartDate?: string, newEndDate?: string) => {
    const start = newStartDate || startDate;
    const end = newEndDate || endDate;
    
    if (start && end) {
      dispatch(fetchSalesReport({ startDate: start, endDate: end }));
      setLocalDateRange('');
    }
  };

  useEffect(() => {
    // Apply default date range: last month
    applyDateRange('last-month');
  }, []);

  const precols = [
    { header: '', colspan: 2, color: 'dark:bg-dark-2' },
    { header: 'JPY', colspan: 3, color: 'bg-blue-light-5 dark:bg-dark-3' },
    { header: 'USD', colspan: 3, color: 'bg-blue-light-4 dark:bg-dark-4' },
  ]

  return (
    <div className="rounded-[10px] bg-white shadow-1 dark:bg-gray-dark dark:shadow-card px-2" style={{ height: '80vh', overflow: 'auto' }}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sticky top-0 bg-white dark:bg-gray-dark z-10 p-6">
        <div>          <FilteredTextboxDropdown
            label="Date Range"
            placeholder="Select Date Range"
            items={dateRangeOptions}
            onChange={(value) => applyDateRange(value)}
            shouldShowSearch={false}
          />
        </div>

        <div>
          <DatePickerOne
            onDateChange={(date: string) => {
              setStartDate(date);
              handleDateChange(date, endDate);
            }}
            value={startDate}
            label='Start Date'
            maxDate={endDate}
          />
        </div>
        <div>
          <DatePickerOne
            onDateChange={(date: string) => {
              setEndDate(date);
              handleDateChange(startDate, date);
            }}
            value={endDate}
            label='End Date'
            minDate={startDate}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
        </div>
      ) : (
        <>
          <DataTable 
            data={salesByCustomer} 
            columns={[
              { key: 'customer_name', header: 'Customer' },
              { key: 'pcs', header: 'Pcs' },
              { key: 'jpy_total_sale', header: 'Sales' },
              { key: 'jpy_total_cost', header: 'Cost' },
              { key: 'jpy_profit_total', header: 'Profit' },
              { key: 'usd_total_sale', header: 'Sales' },
              { key: 'usd_total_cost', header: 'Cost' },
              { key: 'usd_profit_total', header: 'Profit' },
            ]} 
            showTotals={true} 
            preHeaders={precols}
            label='Sales by Customer'
          />

          <DataTable 
            data={salesByDivision} 
            columns={[
              { key: 'location_name', header: 'Division' },
              { key: 'pcs', header: 'Pcs' },
              { key: 'jpy_total_sale', header: 'Sales' },
              { key: 'jpy_total_cost', header: 'Cost' },
              { key: 'jpy_profit_total', header: 'Profit' },
              { key: 'usd_total_sale', header: 'Sales' },
              { key: 'usd_total_cost', header: 'Cost' },
              { key: 'usd_profit_total', header: 'Profit' },
            ]} 
            showTotals={true} 
            preHeaders={precols}
            label='Sales by Division'
          />

          <DataTable 
            data={salesByBreeder} 
            columns={[
              { key: 'breeder_name', header: 'Breeder' },
              { key: 'pcs', header: 'Pcs' },
              { key: 'jpy_total_sale', header: 'Sales' },
              { key: 'jpy_total_cost', header: 'Cost' },
              { key: 'jpy_profit_total', header: 'Profit' },
              { key: 'usd_total_sale', header: 'Sales' },
              { key: 'usd_total_cost', header: 'Cost' },
              { key: 'usd_profit_total', header: 'Profit' },
            ]} 
            showTotals={true} 
            preHeaders={precols}
            label='Purchases by Breeder'
          />
        </>
      )}
    </div>
  );
};

export default Page;
