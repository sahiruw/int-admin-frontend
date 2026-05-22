'use client';

import { useLoading } from '@/app/loading-context';
import { DataTable } from '@/components/Layouts/tables/uneditable';
import { cn } from '@/lib/utils';
import { KoiInfo } from '@/types/koi';
import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';

const Page = () => {
  const { setLoading } = useLoading();
  const [records, setRecords] = useState<KoiInfo[]>([]);

  useEffect(() => {
    const fetchBoardingList = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/koi?shipped=false', { next: { revalidate: 300 } });
        const data: KoiInfo[] = await res.json();

        const japanBoardingKoi = data.filter((record) => {
          const location = record.location_name?.toLowerCase() || '';
          return location.includes('japan');
        });

        setRecords(japanBoardingKoi);
      } catch (error) {
        console.error('Failed to fetch boarding list:', error);
        toast.error('Failed to fetch boarding list');
      } finally {
        setLoading(false);
      }
    };

    fetchBoardingList();
  }, [setLoading]);

  const sortedRecords = useMemo(() => {
    return [...records].sort((a, b) => {
      const dateA = a.date ? new Date(a.date).getTime() : 0;
      const dateB = b.date ? new Date(b.date).getTime() : 0;
      return dateB - dateA;
    });
  }, [records]);

  const handleThumbnailSheetGeneration = async () => {
    setLoading(true);
    try {
      const items = sortedRecords.map((row) => ({
        picture_id: row.picture_id,
        variety: row.variety_name,
        size: row.size_cm,
      }));

      const response = await fetch('/api/thumbnails/pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ items }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate thumbnail sheet');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = 'boarding-list-thumbnail-sheet.pdf';
      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);
      toast.success('Thumbnail sheet downloaded successfully');
    } catch (error) {
      console.error('Error generating thumbnail sheet:', error);
      toast.error('Failed to generate thumbnail sheet');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="rounded-[10px] bg-white shadow-1 dark:bg-gray-dark dark:shadow-card px-8 pt-4 space-y-4"
      style={{ height: '83vh', overflowY: 'auto' }}
    >
      <div className="flex items-end justify-between w-full gap-4">
        <div className="text-sm text-gray-600 dark:text-gray-300">
          Showing {sortedRecords.length} koi currently staying in Japan.
        </div>

        <button
          className={cn(
            'px-4 py-2 bg-blue-600 text-white font-semibold rounded shadow-sm hover:bg-blue-700 transition-colors duration-200',
            {
              'cursor-not-allowed opacity-60': sortedRecords.length === 0,
            },
          )}
          onClick={handleThumbnailSheetGeneration}
          disabled={sortedRecords.length === 0}
        >
          Generate Thumbnail Sheet
        </button>
      </div>

      <DataTable
        data={sortedRecords}
        columns={[
          { key: 'picture_id', header: 'Picture ID' },
          { key: 'breeder_name', header: 'Breeder' },
          { key: 'customer_name', header: 'Customer' },
          { key: 'variety_name', header: 'Variety' },
          { key: 'size_cm', header: 'Size' },
          { key: 'sex', header: 'Sex' },
          { key: 'age', header: 'Age' },
          { key: 'location_name', header: 'Location' },
        ]}
        label="Boarding List - Japan"
        maxHeight="72vh"
        defaultSortColumn="breeder_name"
        defaultSortDirection="asc"
      />
    </div>
  );
};

export default Page;
