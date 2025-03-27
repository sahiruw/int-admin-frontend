'use client'
import React, { useEffect, useState } from 'react'
import { KoiInfoTable } from '@/components/Layouts/koi-table'
import { KoiInfo } from '@/types/koi';

export default function Page() {
  const [data, setData] = useState<KoiInfo[]>([]);

  useEffect(() => {
    // Fetch data from /koi API with Next.js cache for 5 minutes
    fetch('/api/koi', { next: { revalidate: 300 } })
      .then((response) => response.json())
      .then((data) => {
        setData(data);
        console.log(data);
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
      });
  }, []);

  return (
    <div className="rounded-[10px] bg-white shadow-1 dark:bg-gray-dark dark:shadow-card p-8">
      <KoiInfoTable data={data} />
    </div>
  )

}
