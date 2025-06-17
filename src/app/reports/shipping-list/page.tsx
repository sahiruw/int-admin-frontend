'use client';
import { DataTable } from '@/components/Layouts/tables/uneditable';
import { useAppDispatch, useAppSelector } from '@/store';
import { fetchShippingList } from '@/store/slices/reportsSlice';
import React, { useEffect, useMemo } from 'react'

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

const page = () => {
    const dispatch = useAppDispatch();
    const { shippingData, isLoading } = useAppSelector((state) => state.reports);

    const { dataWithDate, dataWithoutDate } = useMemo(() => {
        const groupedData = groupAndSortShippingData(shippingData);
        return {
            dataWithDate: groupedData.filter(group => group[0].date),
            dataWithoutDate: groupedData.filter(group => !group[0].date)
        };
    }, [shippingData]);

    useEffect(() => {
        dispatch(fetchShippingList());
    }, [dispatch]);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-3 gap-4 rounded-[10px] bg-white shadow-1 dark:bg-gray-dark dark:shadow-card p-2 " style={{ height: '83vh' }}>
            {/* Left Column: Data Without Date */}
            <div className="overflow-y-auto rounded-md col-span-1">
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
                            maxHeight='78vh'
                        />
                    </div>
                ))}
            </div>

            {/* Right Column: Data With Date (2/3 width) */}
            <div className="overflow-y-auto rounded-md col-span-2 grid grid-cols-2 gap-4">
                {dataWithDate.map((group, index) => (
                    <div key={index} className='border-2 rounded-xl p-2'>
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
                        />
                    </div>
                ))}
            </div>
        </div>
    )
}

export default page;
