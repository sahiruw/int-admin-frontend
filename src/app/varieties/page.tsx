'use client'
import React, { useEffect } from 'react'
import { DataTable } from '@/components/Layouts/tables/editable'
import { toast } from 'react-hot-toast'
import { useAppDispatch, useAppSelector } from '@/store';
import { fetchVarieties, addVariety, updateVariety, deleteVariety } from '@/store/slices/varietiesSlice';

export default function Page() {
    const dispatch = useAppDispatch();
    const { varieties, isLoading } = useAppSelector((state) => state.varieties);

    useEffect(() => {
        dispatch(fetchVarieties());
    }, [dispatch]);

    const handleEdit = async (id: any, data: any) => {
        try {
            await dispatch(updateVariety({ id, data })).unwrap();
            toast.success('Variety updated successfully');
        } catch (error) {
            console.error('Error updating variety:', error);
            toast.error('Failed to update variety');
        }
    }

    const handleDelete = async (id: any) => {
        try {
            await dispatch(deleteVariety(id)).unwrap();
            toast.success('Variety deleted successfully');
        } catch (error) {
            console.error('Error deleting variety:', error);
            toast.error('Failed to delete variety');
        }
    }

    const handleAdd = async (data: any) => {
        try {
            await dispatch(addVariety(data)).unwrap();
            toast.success('Variety added successfully');
        } catch (error) {
            console.error('Error adding variety:', error);
            toast.error('Failed to add variety');
        }
    }

    return (
        <div className="rounded-[10px] bg-white shadow-1 dark:bg-gray-dark dark:shadow-card p-8" style={{ height: '80vh', overflow: 'auto' }}>
            <DataTable data={varieties} editData={() => {}} onEdit={handleEdit} onDelete={handleDelete} onAdd={handleAdd} />
        </div>
    )
}
