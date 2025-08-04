'use client';
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
                }),
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            const data = await res.json()
            console.log(data)
            toast.success('Configuration saved successfully')
        } catch (error) {
            console.error('Error saving configuration:', error)
            toast.error('Failed to save configuration')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="rounded-[10px] bg-white shadow-1 dark:bg-gray-dark dark:shadow-card p-8 space-y-6" style={{ height: '80vh', overflow: 'auto' }}>
            <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    USD to JPY Exchange Rate
                </label>
                <input
                    type="number"
                    placeholder="e.g., 140"
                    value={exchangeRate.toString()}
                    onChange={(e) => setExchangeRate(parseFloat(e.target.value))}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
                />
            </div>

            <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Shipping Cost (JPY)
                </label>
                <input
                    type="number"
                    placeholder="e.g., 1000.00"
                    value={shippingCost.toString()}
                    onChange={(e) => setShippingCost(parseFloat(e.target.value))}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
                />
            </div>

            <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Commission
                </label>
                <input
                    type="number"
                    placeholder="e.g., 5.5"
                    value={commission.toString()}
                    onChange={(e) => setCommission(parseFloat(e.target.value))}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
                />
            </div>

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
