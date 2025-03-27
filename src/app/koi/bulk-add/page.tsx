import React from 'react'
import { BulkUploadWizard } from '@/components/Layouts/bulk-upload-wizard'

const page = () => {
  return (
    <div
      className="rounded-[10px] bg-white shadow-1 dark:bg-gray-dark dark:shadow-card p-8"
      style={{ height: '80vh', overflow: 'auto' }}
    >
      <BulkUploadWizard />
    </div>
  )
}

export default page