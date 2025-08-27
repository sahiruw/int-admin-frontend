'use client';
import React, { useEffect, useState } from 'react';
import DatePickerOne from '@/components/FormElements/DatePicker/DatePickerOne';
import { FilteredTextboxDropdown } from "@/components/FormElements/filteredselect";
import { DataTable } from '@/components/Layouts/tables/uneditable';
import { KoiSaleRecord } from '@/types/koi';
import { useLoading } from '@/app/loading-context';


const Page = () => {
  const { setLoading } = useLoading();
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [dateRange, setDateRange] = useState<string>('');
  const [filteredSales, setFilteredSales] = useState<any[]>([]);

  const [dataBYCustomer, setDataByCustomer] = useState<any[]>([]);
  const [dataBYBreeder, setDataByBreeder] = useState<any[]>([]);
  const [dataBYDivision, setDataByDivision] = useState<any[]>([]);


  useEffect(() => {
    setDataByCustomer(groupAndSum(filteredSales.filter((sale) => sale.customer_name), 'customer_name'));
    setDataByBreeder(groupAndSum(filteredSales.filter((sale) => sale.breeder_name), 'breeder_name'));
    setDataByDivision(groupAndSum(filteredSales.filter((sale) => sale.location_name), 'location_name'));
  }
    , [filteredSales]);


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
    setLoading(true);
    try {
      const query = `/api/koi/sales?start=${start}&end=${end}`;
      const res = await fetch(query);
      const data = await res.json();
      console.log(data)
      return data;
    } catch (error) {
      console.error('Failed to fetch sales:', error);
      return [];
    } finally {
      setLoading(false);
    }
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
    // 2. Apply default date range: last month
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
        <div>
          <FilteredTextboxDropdown
            label="Date Range"
            placeholder="Select Date Range"
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
            onDateChange={async (date: string) => {
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

      {/* <div className='overflow-y-scroll'> */}

      <DataTable data={dataBYCustomer} columns={[
        { key: 'customer_name', header: 'Customer' },
        { key: 'pcs', header: 'Pcs' },
        { key: 'jpy_total_sale', header: 'Sales' },
        { key: 'jpy_total_cost', header: 'Cost' },
        { key: 'jpy_profit_total', header: 'Profit' },

        { key: 'usd_total_sale', header: 'Sales' },
        { key: 'usd_total_cost', header: 'Cost' },
        { key: 'usd_profit_total', header: 'Profit' },
      ]} showTotals={true} preHeaders={precols}
        label='Sales by Customer'
      />
      {/* </div>
      <div className='overflow-y-scroll'> */}


      {/* </div>
      <div className='overflow-y-scroll'> */}
      <DataTable data={dataBYDivision} columns={[
        { key: 'location_name', header: 'Division' },
        { key: 'pcs', header: 'Pcs' },
        { key: 'jpy_total_sale', header: 'Sales' },
        { key: 'jpy_total_cost', header: 'Cost' },
        { key: 'jpy_profit_total', header: 'Profit' },

        { key: 'usd_total_sale', header: 'Sales' },
        { key: 'usd_total_cost', header: 'Cost' },
        { key: 'usd_profit_total', header: 'Profit' },
      ]} showTotals={true} preHeaders={precols}
        label='Sales by Division'
      />

      <DataTable data={dataBYBreeder} columns={[
        { key: 'breeder_name', header: 'Breeder' },
        { key: 'pcs', header: 'Pcs' },
        { key: 'jpy_total_sale', header: 'Sales' },
        { key: 'jpy_total_cost', header: 'Cost' },
        { key: 'jpy_profit_total', header: 'Profit' },

        { key: 'usd_total_sale', header: 'Sales' },
        { key: 'usd_total_cost', header: 'Cost' },
        { key: 'usd_profit_total', header: 'Profit' },
      ]} showTotals={true} preHeaders={precols}
        label='Purchases by Breeder'
      />
      {/* </div> */}


    </div>
  );
};

export default Page;




type SummaryResult = {
  [key: string]: string | number | string[];
  pcs: number;
  jpy_total_cost: number;
  jpy_total_sale: number;
  jpy_profit_total: number;
  usd_total_sale: number;
  usd_total_cost: number;
  usd_profit_total: number;

  picture_ids: string[];
};

function groupAndSum(data: KoiSaleRecord[], key: keyof KoiSaleRecord): SummaryResult[] {
  const result: Record<string, SummaryResult> = {};

  data.forEach(item => {
    const groupKey = String(item[key]);

    if (!result[groupKey]) {
      result[groupKey] = {
        [key]: groupKey,
        pcs: 0,
        jpy_total_cost: 0,
        jpy_total_sale: 0,
        usd_total_sale: 0,
        jpy_profit_total: 0,
        usd_total_cost: 0,
        usd_profit_total: 0,
        picture_ids: [],
      };
    }

    result[groupKey].pcs += item.pcs || 0;
    result[groupKey].jpy_total_cost += item.jpy_total_cost || 0;
    result[groupKey].jpy_total_sale += item.jpy_total_sale || 0;
    result[groupKey].usd_total_sale += item.usd_total_sale || 0;
    result[groupKey].picture_ids.push(item.picture_id);
    result[groupKey].usd_total_cost += item.usd_total_cost || 0;
  });

  // convert all floats to 2 decimal places
  Object.values(result).forEach((item) => {
    item.pcs = item.pcs;
    item.jpy_total_cost = item.jpy_total_sale ? Number(item.jpy_total_cost.toFixed(2)) : 0;
    item.jpy_total_sale = Number(item.jpy_total_sale.toFixed(2));
    item.usd_total_sale = Number(item.usd_total_sale.toFixed(2));
    item.usd_total_cost = item.usd_total_sale ? Number(item.usd_total_cost.toFixed(2)) : 0;
    item.usd_profit_total = item.usd_total_sale - item.usd_total_cost;
    item.jpy_profit_total = item.jpy_total_sale - item.jpy_total_cost;
  });

  return Object.values(result);
}
