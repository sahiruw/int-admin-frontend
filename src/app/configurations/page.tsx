'use client';
import InputGroup from '@/components/FormElements/InputGroup'
import { Button } from '@/components/ui-elements/button'
import React, { useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { useAppDispatch, useAppSelector } from '@/store';
import { 
  fetchConfiguration, 
  updateConfiguration, 
  setExchangeRate, 
  setShippingCost, 
  setCommission 
} from '@/store/slices/configurationSlice';

const Page = () => {
    const dispatch = useAppDispatch();
    const { configuration, isLoading } = useAppSelector((state) => state.configuration);
    const { ex_rate, shipping_cost, commission } = configuration;

    useEffect(() => {
        dispatch(fetchConfiguration());
    }, [dispatch]);

    const handleSave = async () => {
        try {
            await dispatch(updateConfiguration({
                ex_rate,
                shipping_cost,
                commission
            })).unwrap();
            toast.success('Configuration saved successfully');
        } catch (error) {
            console.error('Error saving configuration:', error);
            toast.error('Failed to save configuration');
        }
    };

    return (
        <div className="rounded-[10px] bg-white shadow-1 dark:bg-gray-dark dark:shadow-card p-8 space-y-6" style={{ height: '80vh', overflow: 'auto' }}>            <InputGroup
                label='USD to JPY Exchange Rate'
                name='exchange_rate'
                type='number'
                placeholder='e.g., 140'
                value={ex_rate.toString()}
                handleChange={(e) => dispatch(setExchangeRate(parseFloat(e.target.value)))}
            />

            <InputGroup
                label='Shipping Cost (USD)'
                name='shipping_cost'
                type='number'
                value={shipping_cost.toString()}
                placeholder='e.g., 10.00'
                handleChange={(e) => dispatch(setShippingCost(parseFloat(e.target.value)))}
            />

            <InputGroup
                label='Commission (%)'
                name='commission'
                type='number'
                value={commission.toString()}
                placeholder='e.g., 5.5'
                handleChange={(e) => dispatch(setCommission(parseFloat(e.target.value)))}
            />            <Button
                label='Save'
                onClick={handleSave}
                variant={'primary'}
                shape={'rounded'}
            />
        </div>
    )
}

export default Page