'use client'
import React, { useEffect } from 'react'
import { DataTable } from '@/components/Layouts/tables/editable'
import { toast } from 'react-hot-toast'
import { useAppDispatch, useAppSelector } from '@/store';
import { fetchCustomers, addCustomer, updateCustomer, deleteCustomer } from '@/store/slices/customersSlice';

export default function Page() {
    const dispatch = useAppDispatch();
    const { customers, isLoading } = useAppSelector((state) => state.customers);

    useEffect(() => {
        dispatch(fetchCustomers());
    }, [dispatch]);    const handleEdit = async (id: any, data: any) => {
        try {
            await dispatch(updateCustomer({ id, data })).unwrap();
            toast.success('Customer updated successfully');
        } catch (error) {
            console.error('Error updating customer:', error);
            toast.error('Failed to update customer');
        }
    }

    const handleDelete = async (id: any) => {
        try {
            await dispatch(deleteCustomer(id)).unwrap();
            toast.success('Customer deleted successfully');
        } catch (error) {
            console.error('Error deleting customer:', error);
            toast.error('Failed to delete customer');
        }
    }

    const handleAdd = async (data: any) => {
        try {
            await dispatch(addCustomer(data)).unwrap();
            toast.success('Customer added successfully');        } catch (error) {
            console.error('Error adding customer:', error);
            toast.error('Failed to add customer');
        }
    }
    
    return (
        <div className="rounded-[10px] bg-white shadow-1 dark:bg-gray-dark dark:shadow-card p-8" style={{ height: '80vh', overflow: 'auto' }}>
            <DataTable data={customers} editData={() => {}} onEdit={handleEdit} onDelete={handleDelete} onAdd={handleAdd} />
        </div>
    )
}
