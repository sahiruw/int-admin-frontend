"use client";

import { TrashIcon, EditIcon } from "@/assets/icons";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import dayjs from "dayjs";
import { useState } from "react";
import { KoiInfo } from "@/types/koi";


export function KoiInfoTable({ data, setEditingKoiId }: { data: KoiInfo[]; setEditingKoiId: (id: string | null) => void }) {
  const pageSizeOptions = [5, 10, 20, 50, 100];

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(pageSizeOptions[Math.ceil(pageSizeOptions.length / 2)]);

  const totalPages = Math.ceil(data.length / itemsPerPage);
  const startEntry = (currentPage - 1) * itemsPerPage;
  const endEntry = startEntry + itemsPerPage;
  const paginatedData = data.length ? data.slice(startEntry, endEntry) : [];

  const start = data.length > 0 ? startEntry + 1 : 0;
  const end = Math.min(endEntry, data.length);



  return (
    <div>
      <div style={{ height: '61vh', overflow: 'auto' }}>
        <Table>
          <TableHeader>
            <TableRow className="border-none bg-[#F7F9FC] dark:bg-dark-2 [&>th]:py-1 [&>th]:text-base [&>th]:text-dark [&>th]:dark:text-white">
              <TableHead>Koi Info</TableHead>
              <TableHead>Breeder</TableHead>
              <TableHead>Cost & Pricing</TableHead>
              <TableHead>Customer Info</TableHead>
              <TableHead>Sales</TableHead>
              <TableHead>Commission</TableHead>
              <TableHead>Net Revenue</TableHead>
              <TableHead>Shipping Info</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>

          </TableHeader>

          <TableBody>
            {paginatedData.map((row, index) => (

              <TableRow key={index} className="border-[#eee] dark:border-dark-3">
                <TableCell>
                  <div className="flex flex-col">
                    <p className="font-medium text-dark dark:text-white">
                      {row.picture_id} - {row.variety_name} ({row.koi_id})
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {row.sex} | {row.age} yrs | {row.size_cm} cm
                    </p>

                    <p className="text-xs text-gray-400 dark:text-gray-400">
                      {dayjs(row.timestamp).format("MMM DD, YYYY h:mm A")}
                    </p>
                  </div>
                </TableCell>

                <TableCell>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {row.breeder_name} ({row.breeder_id})
                  </p>
                </TableCell>

                <TableCell>
                  <p className="text-dark dark:text-white font-medium">
                    {row.pcs} pcs
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Unit Cost: {row.jpy_cost ? row.jpy_cost.toLocaleString() + " JPY"  : "N/A"}
                  </p>
                  <p className="text-green-600 dark:text-green-400 font-medium">
                    Total Cost: {row.jpy_total ? row.jpy_total.toLocaleString() + " JPY"  : "N/A"}
                  </p>
                </TableCell>

                <TableCell>
                  <p className="font-medium text-dark dark:text-white">
                    {row.customer_name}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {row.location_name && (`📍 ${row.location_name}`)}
                  </p>
                </TableCell>

                {SalesCell(row.sale_price_jpy, row.sale_price_usd)}
                {SalesCell(row.sale_price_jpy * row.comm, row.sale_price_usd * row.comm)}
                {SalesCell(row.sale_price_jpy * (1+  row.comm), row.sale_price_usd * (1+  row.comm))}

                <TableCell>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    📦 {row.box_count} box(es) | {row.box_size} | {row.total_weight}{" "}
                    kg
                  </p>
                  <p
                    className={cn(
                      "text-sm font-medium",
                      row.shipped
                        ? "text-green-600 dark:text-green-400"
                        : "text-red-500 dark:text-red-400"
                    )}
                  >
                    🚚 {row.shipped ? "Shipped" : "Not Shipped"}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    📆 {dayjs(row.date).format("MMM DD, YYYY")}
                  </p>
                </TableCell>

                <TableCell>
                  <div className="flex gap-2">
                    <button
                      className="hover:text-primary-600"
                      title="Edit"
                      onClick={() => setEditingKoiId(row.picture_id)}
                    >
                      <EditIcon className="w-5 h-5" />
                    </button>
                    <button
                      className=""
                      title="Delete"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </div>
                </TableCell>
              </TableRow>

            ))}
          </TableBody>

        </Table>
      </div>
      <div className="flex items-center justify-between mt-4 px-4">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Showing {start} to {end} of {data.length} entries
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Rows per page:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="border rounded-md px-2 py-1 dark:bg-dark-2 dark:border-dark-3"
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border rounded-md hover:bg-gray-50 dark:hover:bg-dark-3 disabled:opacity-50 disabled:cursor-not-allowed dark:border-dark-3"
            >
              Previous
            </button>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border rounded-md hover:bg-gray-50 dark:hover:bg-dark-3 disabled:opacity-50 disabled:cursor-not-allowed dark:border-dark-3"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


const SalesCell = (jpy?: number, usd?: number) => {
  if (!jpy && !usd) {
    return (
      <TableCell>
        <p className="text-gray-500 dark:text-gray-400 text-sm">N/A</p>
      </TableCell>
    );
  }

  return (
    <TableCell>
      <p className="text-green-600 dark:text-green-400 text-sm">
        
        {jpy > 0 && (<span className="flex items-center gap-1">
          <span
            className="w-3 h-3 rounded-full bg-[#BC002D]"
            aria-label="Red Ball"
          ></span>
          ¥{jpy?.toLocaleString()}
        </span>)}

        {usd > 0 && (<span className="flex items-center gap-1">
          <img
            src="https://flagcdn.com/w40/us.png"
            alt="US Flag"
            className="w-3 h-3 rounded-full"
          />
          ${usd.toLocaleString()}
        </span>)}
      </p>
    </TableCell>
  );
};
