'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import Image from 'next/image';
import { KoiSaleRecord } from '@/types/koi';
import {toast} from 'react-hot-toast';
import { useLoading } from '@/app/loading-context';

interface ThumbnailItem {
  picture_id: string;
  variety: string;
  size: string;
  imageUrl?: string;
}

export default function ThumbnailSheetPage() {
  const searchParams = useSearchParams();
  const { setLoading } = useLoading();
  const [items, setItems] = useState<ThumbnailItem[]>([]);
  const [data, setData] = useState<KoiSaleRecord[]>([]);

  useEffect(() => {
    const fetchData = async () => {
        try {
            const res = await fetch('/api/koi', { next: { revalidate: 300 } });
            const rawData: KoiSaleRecord[] = await res.json();
            const filtered = rawData.filter((record) => record.date && !record.shipped);
            setData(filtered);
        } catch (error) {
            console.error("Failed to fetch koi sales data:", error);
            toast.error("Failed to fetch koi sales data");
        }
    };

    fetchData();
}, []);

useEffect(() => {
  const fetchData = async () => {
    setLoading(true);
    const dataParam = searchParams.get('data');
    if (!dataParam) return;

    const parsedItems: ThumbnailItem[] = JSON.parse(decodeURIComponent(dataParam));

    const itemsWithDetails = await Promise.all(
      parsedItems.map(async (item) => {
        const record = data.find((record) => record.picture_id === item);
        if (record) {

          return {
            picture_id: record.picture_id,
            variety: record.variety_name,
            size: record.size_cm,
            imageUrl: item.imageUrl
          };
        }
        return { picture_id: item };
      })
    );

    const itemsWithImages = await Promise.all(
      itemsWithDetails.map(async (item) => {
        try {
            const response = await fetch(`/api/image?picture_id=${item.picture_id}`, { next: { revalidate: 604800 } });
          const { buffer, mimeType } = await response.json();

          // Decode base64 and create Blob
          const byteCharacters = atob(buffer);
          const byteNumbers = Array.from(byteCharacters).map(char => char.charCodeAt(0));
          const byteArray = new Uint8Array(byteNumbers);
          const blob = new Blob([byteArray], { type: mimeType });
          const objectUrl = URL.createObjectURL(blob);

          return { ...item, imageUrl: objectUrl };
        } catch (error) {
          console.error('Error fetching image:', error);
          return item; // fallback to original item
        }
      })
    );

    setItems(itemsWithImages);
    setLoading(false);
  };

  fetchData();
}, [searchParams]);

    const exportToPDF = async () => {
    const input = document.getElementById('thumbnail-grid');
    if (!input) return;

    const pdf = new jsPDF('p', 'mm', 'a4');
    const canvas = await html2canvas(input);
    const imgData = canvas.toDataURL('image/png');
    const imgWidth = 210; // A4 width in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
    pdf.save('thumbnail-report.pdf');
  };

  // const exportToPDF = async () => {
  //   const input = document.getElementById('thumbnail-grid');
  //   if (!input) return;
  
  //   const canvas = await html2canvas(input, { scale: 2 }); // Better resolution
  //   const imgData = canvas.toDataURL('image/png');
  
  //   const pdf = new jsPDF('p', 'mm', 'a4');
  //   const pageWidth = pdf.internal.pageSize.getWidth();
  //   const pageHeight = pdf.internal.pageSize.getHeight();
  
  //   const imgProps = pdf.getImageProperties(imgData);
  //   const imgWidth = pageWidth;
  //   const imgHeight = (imgProps.height * imgWidth) / imgProps.width;
  
  //   let heightLeft = imgHeight;
  //   let position = 0;
  
  //   const addHeaderFooter = (pageNum: number) => {
  //     pdf.setFontSize(12);
  //     pdf.text('Thumbnail Report', pageWidth / 2, 10, { align: 'center' }); // Header
  //     pdf.setFontSize(10);
  //     pdf.text(`Page ${pageNum}`, pageWidth / 2, pageHeight - 10, { align: 'center' }); // Footer
  //     pdf.text(" Niigata Koi Global", pageWidth - 30, pageHeight - 10, { align: 'right' }); // Footer
  //   };
  
  //   let pageNum = 1;
  //   addHeaderFooter(pageNum);
  //   pdf.addImage(imgData, 'PNG', 0, 20, imgWidth, imgHeight);
  
  //   heightLeft -= pageHeight - 40; // Account for header and footer space
  
  //   while (heightLeft > 0) {
  //     position = heightLeft - imgHeight;
  //     pdf.addPage();
  //     pageNum++;
  //     addHeaderFooter(pageNum);
  //     pdf.addImage(imgData, 'PNG', 0, position + 20, imgWidth, imgHeight);
  //     heightLeft -= pageHeight - 40;
  //   }
  
  //   pdf.save('thumbnail-report.pdf');
  // };
  

  return (
    <div className="p-4">
      <button
        onClick={exportToPDF}
        className="mb-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Export to PDF
      </button>
      
      <div id="thumbnail-grid" className="grid grid-cols-4 gap-4 p-4">
        {items.map((item) => (
          <div key={item.picture_id} className="border p-2">
            {item.imageUrl ? (
              <Image
                src={item.imageUrl}
                alt={item.picture_id}
                width={100}
                height={150}
                className="object-cover w-auto"
              />
            
              
            ) : (
              <div className="w-48 h-full bg-gray-100 flex items-center justify-center">
                Image not found
              </div>
            )}
            <div className="text-sm">
              <p>ID: {item.picture_id}</p>
              <p>Variety: {item.variety}</p>
              <p>Size: {item.size}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}