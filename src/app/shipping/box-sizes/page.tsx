'use client'
import { useLoading } from '@/app/loading-context';
import { FilteredTextboxDropdown } from '@/components/FormElements/filteredselect'
import { DataTable } from '@/components/Layouts/ShippingTable';
import { box, Breeder, KoiInfo, ShippingData } from '@/types/koi';
import React, { useEffect, useMemo, useState } from 'react';
import { Modal, ConfirmButton, CancelButton, ModalFooter, InputField } from '@/components/ui/Modal';
import { toast } from 'react-hot-toast';


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
    const [data, setData] = useState<BreederRow[]>([]);
    const [sizes, setSizes] = useState<string[]>(['65', '70', '75', '80']);
    const [isSaving, setIsSaving] = useState(false);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    // Breeder management
    const [allBreeders, setAllBreeders] = useState<Breeder[]>([]);
    const [selectedBreederId, setSelectedBreederId] = useState<string>('');

    // Modal states
    const [addBreederModal, setAddBreederModal] = useState(false);
    const [newBreederName, setNewBreederName] = useState('');
    const [addSizeModal, setAddSizeModal] = useState(false);
    const [newSize, setNewSize] = useState('');
    const [confirmDialog, setConfirmDialog] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        onConfirm: () => void;
    }>({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => { }
    });

    const fetchData = () => {
        setLoading(true);
        fetch(`/api/box-sizes`, { next: { revalidate: false } })
            .then((response) => response.json())
            .then((data: box[]) => {
                let szAr = Array.from(new Set(data.filter(x => x.length_cm ||
                    x.width_cm ||
                    x.thickness_cm
                ).map((item: box) => item.size))) as string[];
                szAr.sort((a: string, b: string) => parseInt(a) - parseInt(b))
                setSizes(szAr);

                const processedData = mapKoiDataToEditableFormat(data);
                console.log('Fetched and processed data:', processedData);
                setInitialData(data);
                setData(processedData);
            })
            .catch((error) => {
                console.error('Error fetching data:', error);
                toast.error('Failed to load box sizes');
            })
            .finally(() => {
                setLoading(false);
            });
    };

    const fetchBreeders = () => {
        fetch('/api/breeders', { next: { revalidate: false } })
            .then((response) => response.json())
            .then((data: Breeder[]) => {
                setAllBreeders(data);
            })
            .catch((error) => {
                console.error('Error fetching breeders:', error);
                toast.error('Failed to load breeders');
            });
    };

    useEffect(() => {
        fetchData();
        fetchBreeders();
    }, []);

    const updateCell = (rowIdx: number, size: string, field: keyof CellData, value: string) => {
        const newData = [...data];
        if (!newData[rowIdx].data[size]) newData[rowIdx].data[size] = {};

        // Convert to number or set to undefined if empty
        const numValue = value.trim() === '' ? undefined : parseFloat(value);
        newData[rowIdx].data[size][field] = numValue;
        setData(newData);
        setHasUnsavedChanges(true);

        // Auto-save after a short delay to avoid too many API calls
        // debouncedSave();
    };

    // Debounced save function to avoid multiple API calls
    const debouncedSave = debounce(() => {
        saveChangesToDB();
    }, 2000);

    // Debounce helper function
    function debounce(func: Function, wait: number) {
        let timeout: NodeJS.Timeout;
        return function (this: any, ...args: any[]) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    };

    const addRow = () => {
        setAddBreederModal(true);
    };

    const addColumn = () => {
        setAddSizeModal(true);
    }; const removeRow = (rowIdx: number) => {
        handleRemoveRow(rowIdx);
    };

    const removeColumn = (size: string) => {
        handleRemoveColumn(size);
    };

    const saveChangesToDB = async () => {
        setLoading(true);
        setIsSaving(true);
        try {
            // Convert data back to box[] format for API
            const boxDataToSave: box[] = [];

            data.forEach(row => {
                // Find breeder by name from the breeder list
                const breeder = allBreeders.find(b => b.name === row.breederName);

                // If not found in allBreeders, try to find in initialData (backward compatibility)
                const existingBreeder = breeder || initialData.find(item =>
                    item.breeder.name === row.breederName
                )?.breeder;

                if (!existingBreeder) {
                    // Skip rows where we can't find the breeder
                    console.warn(`Breeder not found: ${row.breederName}`);
                    return;
                }

                // Create entries for each size
                Object.entries(row.data).forEach(([size, cellData]) => {
                    if (
                        cellData.length_cm !== undefined ||
                        cellData.width_cm !== undefined ||
                        cellData.thickness_cm !== undefined
                    ) {
                        boxDataToSave.push({
                            breeder_id: existingBreeder.id,
                            size,
                            length_cm: cellData.length_cm ?? null,
                            width_cm: cellData.width_cm ?? null,
                            thickness_cm: cellData.thickness_cm ?? null,
                            breeder: existingBreeder
                        });
                    }
                });
            });

            // Delete all existing entries and insert new ones
            const response = await fetch('/api/box-sizes', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ payload: boxDataToSave }),
            });

            if (!response.ok) {
                throw new Error('Failed to save data');
            }

            toast.success('Changes saved successfully');
            setHasUnsavedChanges(false);
            // Refresh data to ensure we're in sync
            fetchData();
        } catch (error) {
            console.error('Error saving data:', error);
            toast.error('Failed to save changes');
        } finally {
            setLoading(false);
            setIsSaving(false);
        }
    };


    const handleAddBreeder = async () => {
        if (!selectedBreederId) {
            toast.error('Please select a breeder');
            return;
        }

        setLoading(true);
        try {
            // Find the selected breeder
            const selectedBreeder = allBreeders.find(b => b.id.toString() === selectedBreederId);
            if (!selectedBreeder) {
                toast.error('Selected breeder not found');
                setLoading(false);
                return;
            }

            // Check if breeder already exists in the table
            const existingBreeder = data.find(row =>
                row.breederName.toLowerCase() === selectedBreeder.name.toLowerCase()
            );

            if (existingBreeder) {
                toast.error('Breeder already exists in the table');
                setLoading(false);
                return;
            }

            // Add new row to data
            const newData = [...data, { breederName: selectedBreeder.name, data: {} }];
            // Sort by breeder name for better organization
            newData.sort((a, b) => a.breederName.localeCompare(b.breederName));
            setData(newData);
            setHasUnsavedChanges(true);

            // Close modal and reset form
            setAddBreederModal(false);
            setSelectedBreederId('');
            setNewBreederName('');
            // toast.success('Breeder added successfully');
            // debouncedSave();
        } catch (error) {
            console.error('Error adding breeder:', error);
            toast.error('Failed to add breeder');
        } finally {
            setLoading(false);
        }
    };

    const handleAddSize = async () => {
        if (!newSize.trim()) {
            toast.error('Size cannot be empty');
            return;
        }

        // Check if size is numeric
        if (isNaN(Number(newSize))) {
            toast.error('Size must be a number');
            return;
        }

        // Check if size already exists
        if (sizes.includes(newSize.trim())) {
            toast.error('Size already exists');
            return;
        }

        // Add new size
        setSizes([...sizes, newSize.trim()].sort((a, b) => parseInt(a) - parseInt(b)));
        setHasUnsavedChanges(true);

        // Close modal and reset form
        setAddSizeModal(false);
        setNewSize('');
        toast.success('Size added successfully');
    };

    const handleRemoveRow = (rowIdx: number) => {
        const breederName = data[rowIdx].breederName;

        setConfirmDialog({
            isOpen: true,
            title: 'Remove Breeder',
            message: `Are you sure you want to remove the row for "${breederName}"? This action cannot be undone and will permanently delete all box size data for this breeder.`,
            onConfirm: () => {
                const newData = data.filter((_, index) => index !== rowIdx);
                setData(newData);
                setHasUnsavedChanges(true);
                setConfirmDialog({ isOpen: false, title: '', message: '', onConfirm: () => { } });
                // toast.success('Breeder removed successfully');
                // debouncedSave();
            }
        });
    };
    const handleRemoveColumn = (size: string) => {
        setConfirmDialog({
            isOpen: true,
            title: 'Remove Size Column',
            message: `Are you sure you want to remove the size "${size}" column? This action cannot be undone and will permanently delete all data for this box size across all breeders.`,
            onConfirm: () => {
                // Remove size from sizes array
                const newSizes = sizes.filter(s => s !== size);
                setSizes(newSizes);

                // Remove size data from all rows
                const newData = data.map(row => {
                    const newRowData = { ...row.data };
                    delete newRowData[size];
                    return {
                        ...row,
                        breederName: row.breederName,
                        data: newRowData
                    };
                });
                setData(newData);
                setHasUnsavedChanges(true);
                setConfirmDialog({ isOpen: false, title: '', message: '', onConfirm: () => { } });
                toast.success('Size column removed successfully');
                debouncedSave();
            }
        });
    };

    return (
        <div className="rounded-[10px] bg-white shadow-1 dark:bg-gray-dark dark:shadow-card px-4 pt-4 space-y-4" style={{ height: "85vh", overflowY: "auto" }}>
            <div className="">
                <div className="flex justify-between mb-4">
                    <div>
                        <button onClick={addRow} className="mb-2 mr-2 bg-blue-500 text-white px-3 py-1 rounded">Add Breeder</button>
                        <button onClick={addColumn} className="mb-2 mr-2 bg-green-500 text-white px-3 py-1 rounded">Add Box Size</button>
                    </div>                    <button
                        onClick={saveChangesToDB}
                        className={`mb-2 px-3 py-1 rounded flex items-center gap-1 ${isSaving ? 'bg-gray-500' : hasUnsavedChanges ? 'bg-primary' : 'bg-gray-400'} text-white`}
                        disabled={isSaving || !hasUnsavedChanges}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-save" viewBox="0 0 16 16">
                            <path d="M2 1a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H9.5a1 1 0 0 0-1 1v7.293l2.646-2.647a.5.5 0 0 1 .708.708l-3.5 3.5a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L7.5 9.293V2a2 2 0 0 1 2-2H14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2h2.5a.5.5 0 0 1 0 1z" />
                        </svg>
                        {isSaving ? 'Saving...' : 'Save All Changes'}
                    </button>
                </div>
                {hasUnsavedChanges && <div className="text-red-500 text-sm mb-2">You have unsaved changes.</div>}
                <table className="table-auto border border-collapse border-gray-400 w-full">
                    <thead>
                        <tr>
                            <th className="border px-2 py-1 min-w-36">Breeder</th>
                            {sizes.map(size => (
                                <th key={size} className="border px-2 py-1 relative" colSpan={3}>
                                    <div className="flex items-center justify-between">
                                        <span>{size}</span>
                                        <button
                                            onClick={() => removeColumn(size)}
                                            className="ml-2 text-red-500 hover:text-red-700 text-xs font-bold"
                                            title="Delete column"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                </th>
                            ))}
                            <th className="border px-2 py-1 w-16">Actions</th>
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
                            <th></th>
                        </tr>
                    </thead>                    <tbody>
                        {data.map((row, rowIdx) => (
                            <tr key={rowIdx}>                                <td className="border px-2 py-1  min-w-min">
                                <input
                                    className="w-full"
                                    value={row.breederName}
                                    onChange={e => {
                                        const newData = [...data];
                                        newData[rowIdx].breederName = e.target.value;
                                        setData(newData);
                                        setHasUnsavedChanges(true);
                                    }}
                                    // onBlur={debouncedSave}
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
                                <td className="border px-1 py-1 text-center">
                                    <button
                                        onClick={() => removeRow(rowIdx)}
                                        className="text-red-500 hover:text-red-700 font-bold text-sm"
                                        title="Delete row"
                                    >
                                        🗑️
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {/* Add Breeder Modal */}
            <Modal
                isOpen={addBreederModal}
                onClose={() => setAddBreederModal(false)}
                title="Add New Breeder"
            >                  <div className="mb-4">
                    <FilteredTextboxDropdown
                        label="Select Breeder"
                        items={allBreeders
                            .filter(breeder => !data.some(row => row.breederName === breeder.name))
                            .map(breeder => ({
                                value: breeder.id.toString(),
                                label: breeder.name
                            }))}
                        placeholder="Select a breeder"
                        onChange={(value) => {
                            setSelectedBreederId(value);
                            const selectedBreeder = allBreeders.find(b => b.id.toString() === value);
                            if (selectedBreeder) {
                                setNewBreederName(selectedBreeder.name);
                            }
                        }}
                    />
                </div>
                <ModalFooter>
                    <CancelButton onClick={() => setAddBreederModal(false)}>
                        Cancel
                    </CancelButton>
                    <ConfirmButton onClick={handleAddBreeder}>
                        Add Breeder
                    </ConfirmButton>
                </ModalFooter>
            </Modal>

            {/* Add Size Modal */}
            <Modal
                isOpen={addSizeModal}
                onClose={() => setAddSizeModal(false)}
                title="Add New Box Size"
            >                <InputField
                    label="Size"
                    type="number"
                    value={newSize}
                    onChange={(e) => setNewSize(e.target.value)}
                    placeholder="Enter size"
                    required
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddSize();
                        }
                    }}
                />
                <ModalFooter>
                    <CancelButton onClick={() => setAddSizeModal(false)}>
                        Cancel
                    </CancelButton>
                    <ConfirmButton onClick={handleAddSize}>
                        Add Size
                    </ConfirmButton>
                </ModalFooter>
            </Modal>

            {/* Confirmation Dialog */}
            <Modal
                isOpen={confirmDialog.isOpen}
                onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
                title={confirmDialog.title}
            >
                <div className="mb-6">{confirmDialog.message}</div>
                <ModalFooter>
                    <CancelButton onClick={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}>
                        Cancel
                    </CancelButton>
                    <ConfirmButton variant="danger" onClick={confirmDialog.onConfirm}>
                        Confirm
                    </ConfirmButton>
                </ModalFooter>
            </Modal>
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

        if (entry.length_cm !== null || entry.width_cm !== null || entry.thickness_cm !== null
        ) {
            breederMap[breederName].data[size] = {
                length_cm: entry.length_cm,
                width_cm: entry.width_cm,
                thickness_cm: entry.thickness_cm
            };
        }
    });

    // Sort breeders alphabetically by name
    return Object.values(breederMap).sort((a, b) => a.breederName.localeCompare(b.breederName));
}