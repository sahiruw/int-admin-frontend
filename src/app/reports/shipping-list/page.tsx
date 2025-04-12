'use client';
import { useLoading } from '@/app/loading-context';
import { DataTable } from '@/components/Layouts/tables/uneditable';
import React, { useEffect, useState } from 'react'

const page = () => {
    const { setLoading } = useLoading();
    const [dataWithDate, setDataWithDate] = useState<ShippingData[][]>([]);
    const [dataWithoutDate, setDataWithoutDate] = useState<ShippingData[][]>([]);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const res = await fetch('/api/koi/shipping-list');
            const data = await res.json();
            let groupedData = groupAndSortShippingData(data);
            
            setDataWithDate(groupedData.filter(group => group[0].date));
            setDataWithoutDate(groupedData.filter(group => !group[0].date));
            
            setLoading(false);
        }
        fetchData();
    }, []);

    return (
        <div className="rounded-[10px] bg-white shadow-1 dark:bg-gray-dark dark:shadow-card p-2" style={{ height: '85vh', display: 'flex', gap: '16px' }}>
            {/* Left Column: Data Without Date */}
            <div style={{ flex: '1', overflowY: 'auto', borderRadius: '8px' }} className="dark:border-gray-700">
            {dataWithoutDate.map((group, index) => (
                <div key={index} className='border-2 rounded-xl p-2'>
                <DataTable
                    data={group}
                    columns={[
                    { key: 'name', header: 'Breeder' },
                    { key: 'total_koi', header: 'Total Koi' },
                    { key: 'total_boxes', header: 'Total Boxes' },
                    { key: 'total_kg', header: 'Total KG' },
                    ]}
                    label={group?.[0]?.date || 'Date not assigned'}
                    showTotals={true}
                    key={index} // Add a unique key for each group
                    maxHeight='80vh'
                />
                </div>
            ))}
            </div>

            {/* Right Column: Data With Date */}
            <div style={{ flex: '1', overflowY: 'auto', borderRadius: '8px' }} className="dark:border-gray-700">
            {dataWithDate.map((group, index) => (
                <div key={index} className='mb-4 border-2 rounded-xl p-2'>
                <DataTable
                    data={group}
                    columns={[
                    { key: 'name', header: 'Breeder' },
                    { key: 'total_koi', header: 'Total Koi' },
                    { key: 'total_boxes', header: 'Total Boxes' },
                    { key: 'total_kg', header: 'Total KG' },
                    ]}
                    label={group?.[0]?.date || ''}
                    showTotals={true}
                    key={index} // Add a unique key for each group
                />
                </div>
            ))}
            </div>
        </div>
    )
}

export default page



interface ShippingData {
    date: string;
    name: string;
    total_koi: number;
    total_boxes: number;
    total_kg: number;
}

function groupAndSortShippingData(data: ShippingData[]): ShippingData[][] {
    // Step 1: Sort by date, then by name
    data.sort((a, b) => {
        if (a.date === b.date) {
            return a.name.localeCompare(b.name);
        }
        return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

    // Step 2: Group by date
    const grouped: ShippingData[][] = [];
    let currentDate: string | null = null;
    let currentGroup: ShippingData[] = [];

    for (const item of data) {
        if (item.date !== currentDate) {
            if (currentGroup.length > 0) grouped.push(currentGroup);
            currentDate = item.date;
            currentGroup = [item];
        } else {
            currentGroup.push(item);
        }
    }

    if (currentGroup.length > 0) grouped.push(currentGroup); // Push the last group

    return grouped;
}
