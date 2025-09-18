'use client'
import React from 'react'
import { BulkUploadWizard } from '@/components/Layouts/bulk-upload-wizard'
import { useAuth } from '@/hooks/use-auth';

const page = () => {
  const { user} = useAuth();

  if(user?.role !== 'admin'){
    return <div className="p-8">You do not have permission to access this page.</div>;
  }

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