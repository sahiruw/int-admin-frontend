'use client';
import InputGroup from '@/components/FormElements/InputGroup'
import { Button } from '@/components/ui-elements/button'
import React, { useEffect, useState } from 'react'
import { useLoading } from '../loading-context';
import { toast } from 'react-hot-toast'

const Page = () => {
    const { setLoading } = useLoading()
    const [exchangeRate, setExchangeRate] = useState<number>(0)
    const [shippingCost, setShippingCost] = useState<number>(0)
    const [commission, setCommission] = useState<number>(0)

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true)
                const res = await fetch('/api/config')
                const data = await res.json()
                setExchangeRate(data.ex_rate)
                setShippingCost(data.shipping_cost)
                setCommission(data.commission)
            } catch (error) {
                console.error('Error fetching configuration:', error)
                toast.error('Failed to fetch configuration')
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    const handleSave = async () => {
        try {
            setLoading(true)
            const res = await fetch('/api/config', {
                method: 'PUT',
                body: JSON.stringify({
                    ex_rate: exchangeRate,
                    shipping_cost: shippingCost,
                    commission
                })
            })
            const data = await res.json()
            console.log(data)
            toast.success('Configuration saved successfully')
        }
        catch (error) {
            console.error('Error saving configuration:', error)
            toast.error('Failed to save configuration')
        }
        finally {
            setLoading(false)
        }
        
    }

    return (
        <div className="rounded-[10px] bg-white shadow-1 dark:bg-gray-dark dark:shadow-card p-8 space-y-6" style={{ height: '80vh', overflow: 'auto' }}>
            <InputGroup
                label='USD to JPY Exchange Rate'
                name='exchange_rate'
                type='number'
                placeholder='e.g., 140'
                value={exchangeRate.toString()}
                handleChange={(e) => setExchangeRate(parseFloat(e.target.value))}
            />

            <InputGroup
                label='Shipping Cost (USD)'
                name='shipping_cost'
                type='number'
                value={shippingCost.toString()}
                placeholder='e.g., 10.00'
                handleChange={(e) => setShippingCost(parseFloat(e.target.value))}
            />

            <InputGroup
                label='Commission (%)'
                name='commission'
                type='number'
                value={commission.toString()}
                placeholder='e.g., 5.5'
                handleChange={(e) => setCommission(parseFloat(e.target.value))}
            />

            <Button
                label='Save'
                onClick={handleSave}
                variant={'primary'}
                shape={'rounded'}
            />
        </div>
    )
}

export default Page