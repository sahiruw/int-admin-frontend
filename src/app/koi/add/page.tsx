import React from 'react'
import { AddKoiForm } from '@/components/Layouts/add-koi-form'

const page = () => {
    return (
        <div className="rounded-[10px] bg-white shadow-1 dark:bg-gray-dark dark:shadow-card p-8" style={{ height: '80vh', overflow: 'auto' }}>
            <AddKoiForm />
        </div>
    )
}

export default page