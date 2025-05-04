'use client'
import { useLoading } from '@/app/loading-context';
import { FilteredTextboxDropdown } from '@/components/FormElements/filteredselect'
import { DataTable } from '@/components/Layouts/ShippingTable';
import { box, Breeder, KoiInfo, ShippingData } from '@/types/koi';
import React, { useEffect, useMemo, useState } from 'react'


type CellData = {
    length_cm?: number;
    width_cm?: number;
    thickness_cm?: number;
};

type BreederRow = {
    breederName: string;
    data: { [size: string]: CellData };
};

const page = () => {
    const { setLoading } = useLoading();
    const [initialData, setInitialData] = useState<box[]>([]);
    const [data, setData] = useState<box[]>([]);
    const [sizes, setSizes] = useState<string[]>(['65', '70', '75', '80']);

    useEffect(() => {
        setLoading(true);
        fetch(`/api/box-sizes`, { next: { revalidate: false } })
            .then((response) => response.json())
            .then((data) => {
                let szAr = Array.from(new Set(data.map((item: box) => item.size)))
                szAr.sort((a: string, b: string) => parseInt(a) - parseInt(b))
                setSizes(szAr);

                data = mapKoiDataToEditableFormat(data);
                setInitialData(data);
                setData(data);
            })
            .catch((error) => {
                console.error('Error fetching data:', error);
            })
            .finally(() => {
                setLoading(false);
            });

    }, []);

    const updateCell = (rowIdx: number, size: string, field: keyof CellData, value: string) => {
        const newData = [...data];
        if (!newData[rowIdx].data[size]) newData[rowIdx].data[size] = {};
        newData[rowIdx].data[size][field] = parseFloat(value) || undefined;
        setData(newData);
    };

    const addRow = () => {
        setData([...data, { breederName: 'New Breeder', data: {} }]);
    };

    const addColumn = () => {
        const newSize = prompt('Enter new size:');
        if (newSize && !sizes.includes(newSize)) {
            setSizes([...sizes, newSize]);
        }
    };


    return (
        <div className="rounded-[10px] bg-white shadow-1 dark:bg-gray-dark dark:shadow-card px-4 pt-4 space-y-4" style={{ height: "85vh", overflowY: "auto" }}>
            <div className="">
                <button onClick={addRow} className="mb-2 mr-2 bg-blue-500 text-white px-3 py-1 rounded">Add Row</button>
                <button onClick={addColumn} className="mb-2 bg-green-500 text-white px-3 py-1 rounded">Add Column</button>
                <table className="table-auto border border-collapse border-gray-400 w-full">
                    <thead>
                        <tr>
                            <th className="border px-2 py-1 min-w-36">Breeder</th>
                            {sizes.map(size => (
                                <th key={size} className="border px-2 py-1" colSpan={3}>{size}</th>
                            ))}
                        </tr>
                        <tr>
                            <th></th>
                            {sizes.map(size => (
                                <React.Fragment key={size}>
                                    <th className="border px-2 py-1">L</th>
                                    <th className="border px-2 py-1">W</th>
                                    <th className="border px-2 py-1">T</th>
                                </React.Fragment>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((row, rowIdx) => (
                            <tr key={rowIdx}>
                                <td className="border px-2 py-1  min-w-min">
                                    <input
                                        className="w-full"
                                        value={row.breederName}
                                        onChange={e => {
                                            const newData = [...data];
                                            newData[rowIdx].breederName = e.target.value;
                                            setData(newData);
                                        }}
                                    />
                                </td>
                                {sizes.map(size => {
                                    const cell = row.data[size] || {};
                                    return ['length_cm', 'width_cm', 'thickness_cm'].map(field => (
                                        <td key={field} className="border px-1 py-1">
                                            <input
                                                className="w-full"
                                                value={cell[field as keyof CellData] ?? ''}
                                                onChange={e => updateCell(rowIdx, size, field as keyof CellData, e.target.value)}
                                            />
                                        </td>
                                    ));
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default page


function mapKoiDataToEditableFormat(original: box[]): BreederRow[] {
    const breederMap: { [breederName: string]: BreederRow } = {};
  
    original.forEach(entry => {
      const breederName = entry?.breeder.name;
      const size = entry.size;
  
      if (!breederMap[breederName]) {
        breederMap[breederName] = {
          breederName,
          data: {}
        };
      }
  
      breederMap[breederName].data[size] = {
        length_cm: entry.length_cm,
        width_cm: entry.width_cm,
        thickness_cm: entry.thickness_cm
      };
    });
  
    return Object.values(breederMap);
  }