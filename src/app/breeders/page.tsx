'use client'
import React, { useEffect } from 'react'
import { DataTable } from '@/components/Layouts/tables/editable'
import { toast } from 'react-hot-toast'
import { useAppDispatch, useAppSelector } from '@/store';
import { fetchBreeders, addBreeder, updateBreeder, deleteBreeder } from '@/store/slices/breedersSlice';

export default function Page() {
    const dispatch = useAppDispatch();
    const { breeders, isLoading } = useAppSelector((state) => state.breeders);

    useEffect(() => {
        dispatch(fetchBreeders());
    }, [dispatch]);    const handleEdit = async (id: any, data: any) => {
        try {
            await dispatch(updateBreeder({ id, data })).unwrap();
            toast.success('Breeder updated successfully');
        } catch (error) {
            console.error('Error updating breeder:', error);
            toast.error('Failed to update breeder');
        }
    }

    const handleDelete = async (id: any) => {
        try {
            await dispatch(deleteBreeder(id)).unwrap();
            toast.success('Breeder deleted successfully');
        } catch (error) {
            console.error('Error deleting breeder:', error);
            toast.error('Failed to delete breeder');
        }
    }

    const handleAdd = async (data: any) => {
        try {
            await dispatch(addBreeder(data)).unwrap();
            toast.success('Breeder added successfully');
        } catch (error) {
            console.error('Error adding breeder:', error);
            toast.error('Failed to add breeder');
        }
    }

    return (        <div className="rounded-[10px] bg-white shadow-1 dark:bg-gray-dark dark:shadow-card p-8" style={{ height: '80vh', overflow: 'auto' }}>
            <DataTable data={breeders} editData={() => {}} onEdit={handleEdit} onDelete={handleDelete} onAdd={handleAdd} />
        </div>
    )
}
