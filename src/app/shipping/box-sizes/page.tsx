'use client'
import React, { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '@/store';
import { fetchBoxSizes, updateCell, updateEditableData } from '@/store/slices/boxSizesSlice';

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
    const dispatch = useAppDispatch();
    const { editableData, sizes, isLoading } = useAppSelector((state) => state.boxSizes);

    useEffect(() => {
        dispatch(fetchBoxSizes());
    }, [dispatch]);

    const handleUpdateCell = (rowIdx: number, size: string, field: keyof CellData, value: string) => {
        const numValue = parseFloat(value) || undefined;
        dispatch(updateCell({ rowIdx, size, field, value: numValue }));
    };

    const addRow = () => {
        const newData = [...editableData, { breederName: 'New Breeder', data: {} }];
        dispatch(updateEditableData(newData));
    };

    const addColumn = () => {
        const newSize = prompt('Enter new size:');
        if (newSize && !sizes.includes(newSize)) {
            // This would need to be handled in the Redux slice
            // For now, just alert the user
            alert('Adding new sizes requires server update');
        }
    };

    const updateBreederName = (rowIdx: number, newName: string) => {
        const newData = [...editableData];
        newData[rowIdx].breederName = newName;
        dispatch(updateEditableData(newData));
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
            </div>
        );
    }

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
                        {editableData.map((row, rowIdx) => (
                            <tr key={rowIdx}>
                                <td className="border px-2 py-1  min-w-min">
                                    <input
                                        className="w-full"
                                        value={row.breederName}
                                        onChange={e => updateBreederName(rowIdx, e.target.value)}
                                    />
                                </td>
                                {sizes.map(size => {
                                    const cell = row.data[size] || {};
                                    return ['length_cm', 'width_cm', 'thickness_cm'].map(field => (
                                        <td key={field} className="border px-1 py-1">
                                            <input
                                                className="w-full"
                                                value={cell[field as keyof CellData] ?? ''}
                                                onChange={e => handleUpdateCell(rowIdx, size, field as keyof CellData, e.target.value)}
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

export default page;