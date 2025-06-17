'use client'
import React, { useEffect } from 'react'
import { DataTable } from '@/components/Layouts/tables/editable'
import { toast } from 'react-hot-toast'
import { useAppDispatch, useAppSelector } from '@/store';
import { fetchShippingLocations, addShippingLocation, updateShippingLocation, deleteShippingLocation } from '@/store/slices/shippingLocationsSlice';

export default function Page() {
    const dispatch = useAppDispatch();
    const { locations, isLoading } = useAppSelector((state: any) => state.shippingLocations);

    useEffect(() => {
        dispatch(fetchShippingLocations());
    }, [dispatch]);

    const handleEdit = async (id: any, data: any) => {
        try {
            await dispatch(updateShippingLocation({ id, data })).unwrap();
            toast.success('Shipping location updated successfully');
        } catch (error) {
            console.error('Error updating shipping location:', error);
            toast.error('Failed to update shipping location');
        }
    }

    const handleDelete = async (id: any) => {
        try {
            await dispatch(deleteShippingLocation(id)).unwrap();
            toast.success('Shipping location deleted successfully');
        } catch (error) {
            console.error('Error deleting shipping location:', error);
            toast.error('Failed to delete shipping location');
        }
    }

    const handleAdd = async (data: any) => {
        try {
            await dispatch(addShippingLocation(data)).unwrap();
            toast.success('Shipping location added successfully');
        } catch (error) {
            console.error('Error adding shipping location:', error);
            toast.error('Failed to add shipping location');
        }
    }

    return (
        <div className="rounded-[10px] bg-white shadow-1 dark:bg-gray-dark dark:shadow-card p-8" style={{ height: '80vh', overflow: 'auto' }}>
            <DataTable data={locations} editData={() => {}} onEdit={handleEdit} onDelete={handleDelete} onAdd={handleAdd} />
        </div>
    )
}
