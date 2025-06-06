'use client'
import React, { useEffect, useState } from 'react'
import { DataTable } from '@/components/Layouts/tables/editable'
import { toast } from 'react-hot-toast'
import { useLoading } from '../loading-context';

export default function Page() {
    const { setLoading } = useLoading();
    const [customers, setCustomers] = useState([    ])

    useEffect(() => {
        setLoading(true);
        // Fetch customers
        fetch('/api/customers', { next: { revalidate: 300 } })
            .then((response) => response.json())
            .then((data) => {
                setCustomers(data);
                toast.success('Customers fetched successfully');
            })
            .catch((error) => {
                console.error('Error fetching data:', error);
                toast.error('Failed to fetch customers');
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    const handleEdit = (id, data) => {
        // Update the breeder
        fetch('/api/customers', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ payload: data }),
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Failed to update breeder');
                }
                return response.json();
            })
            .then((result) => {
                toast.success('Breeder updated successfully');
                setCustomers((prevCustomers) =>
                    prevCustomers.map((breeder) =>
                        breeder.id === id ? { ...breeder, ...data } : breeder
                    )
                );
            })
            .catch((error) => {
                console.error('Error updating breeder:', error);
                toast.error('Failed to update breeder');
            });
    }

    const handleDelete = (id) => {
        // Delete the breeder
        fetch('/api/customers', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id }),
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Failed to delete breeder');
                }
                return response.json();
            })
            .then((result) => {
                toast.success('Breeder deleted successfully');
                setCustomers((prevCustomers) =>
                    prevCustomers.filter((breeder) => breeder.id !== id)
                );
            })
            .catch((error) => {
                console.error('Error deleting breeder:', error);
                toast.error('Failed to delete breeder');
            });
    }

    const handleAdd = (data) => {
        // Find the next available ID
        const nextId = Math.max(...customers.map((breeder) => breeder.id)) + 1;
        data.id = nextId;

        fetch('/api/customers', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ payload: data }),
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Failed to add breeder');
                }
                return response.json();
            })
            .then((result) => {
                toast.success('Breeder added successfully');
                setCustomers((prevCustomers) => [...prevCustomers, { ...data, id: nextId }]);
            })
            .catch((error) => {
                console.error('Error adding breeder:', error);
                toast.error('Failed to add breeder');
            });
    }

    return (
        <div className="rounded-[10px] bg-white shadow-1 dark:bg-gray-dark dark:shadow-card p-8" style={{ height: '80vh', overflow: 'auto' }}>
            <DataTable data={customers} editData={setCustomers} onEdit={handleEdit} onDelete={handleDelete} onAdd={handleAdd} />
        </div>
    )
}
