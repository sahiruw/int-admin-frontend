'use client'
import React, { useEffect, useState } from 'react'
import { DataTable } from '@/components/Layouts/tables/editable'
import { toast } from 'react-hot-toast'

export default function Page() {
    const [varieties, setVarieties] = useState([
        
    ])

    useEffect(() => {
        // Fetch varieties
        fetch('/api/varieties', { next: { revalidate: 300 } })
            .then((response) => response.json())
            .then((data) => {
                setVarieties(data);
                toast.success('Varieties fetched successfully');
            })
            .catch((error) => {
                console.error('Error fetching data:', error);
                toast.error('Failed to fetch varieties');
            });
    }, [])

    const handleEdit = (id, data) => {
        // Update the variety
        fetch('/api/varieties', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ payload: data }),
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Failed to update variety');
                }
                return response.json();
            })
            .then((result) => {
                toast.success('Variety updated successfully');
                setVarieties((prevVarieties) =>
                    prevVarieties.map((variety) =>
                        variety.id === id ? { ...variety, ...data } : variety
                    )
                );
            })
            .catch((error) => {
                console.error('Error updating variety:', error);
                toast.error('Failed to update variety');
            });
    }

    const handleDelete = (id) => {
        // Delete the variety
        fetch('/api/varieties', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id }),
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Failed to delete variety');
                }
                return response.json();
            })
            .then((result) => {
                toast.success('Variety deleted successfully');
                setVarieties((prevVarieties) =>
                    prevVarieties.filter((variety) => variety.id !== id)
                );
            })
            .catch((error) => {
                console.error('Error deleting variety:', error);
                toast.error('Failed to delete variety');
            });
    }

    const handleAdd = (data) => {
        // Find the next available ID
        const nextId = Math.max(...varieties.map((variety) => variety.id)) + 1;
        data.id = nextId;

        fetch('/api/varieties', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ payload: data }),
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Failed to add variety');
                }
                return response.json();
            })
            .then((result) => {
                toast.success('Variety added successfully');
                setVarieties((prevVarieties) => [...prevVarieties, { ...data, id: nextId }]);
            })
            .catch((error) => {
                console.error('Error adding variety:', error);
                toast.error('Failed to add variety');
            });
    }

    return (
        <div className="rounded-[10px] bg-white shadow-1 dark:bg-gray-dark dark:shadow-card p-8" style={{ height: '80vh', overflow: 'auto' }}>
            <DataTable data={varieties} editData={setVarieties} onEdit={handleEdit} onDelete={handleDelete} onAdd={handleAdd} />
        </div>
    )
}
