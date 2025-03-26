"use client";

import { TrashIcon } from "@/assets/icons";
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

interface KoiInfo {
  koi_id: string;
  variety: string;
  sex: string;
  age: number;
  size_cm: number;
  breeder: string;
  bre_id: string;
  pcs: number;
  jpy_cost: number;
  jpy_total: number;
  sold_to: string;
  ship_to: string;
  sales_jpy: number;
  sales_usd: number;
  comm_jpy: number;
  comm_usd: number;
  total_jpy: number;
  total_usd: number;
  num_of_box: number;
  box_size: string;
  total_kg: number;
  shipped_yn: string;
  ship_date: string;
}

export function KoiInfoTable({ data }: { data: KoiInfo[] }) {
  const pageSizeOptions = [5, 10, 20, 50, 100];

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(pageSizeOptions[0]);

  const totalPages = Math.ceil(data.length / itemsPerPage);
  const startEntry = (currentPage - 1) * itemsPerPage;
  const endEntry = startEntry + itemsPerPage;
  const paginatedData = data.slice(startEntry, endEntry);

  const start = data.length > 0 ? startEntry + 1 : 0;
  const end = Math.min(endEntry, data.length);

  

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow className="border-none bg-[#F7F9FC] dark:bg-dark-2 [&>th]:py-4 [&>th]:text-base [&>th]:text-dark [&>th]:dark:text-white">
            <TableHead>Koi Info</TableHead>
            <TableHead>Cost & Pricing</TableHead>
            <TableHead>Customer Info</TableHead>
            <TableHead colSpan={3}>Sales & Revenue</TableHead>
            <TableHead>Shipping Info</TableHead>
          </TableRow>
          <TableRow className="border-none bg-[#F7F9FC] dark:bg-dark-2 [&>th]:py-2 [&>th]:text-sm [&>th]:text-gray-600 [&>th]:dark:text-gray-400">
            <TableHead></TableHead>
            <TableHead></TableHead>
            <TableHead></TableHead>
            <TableHead>Sales</TableHead>
            <TableHead>Commission</TableHead>
            <TableHead>Net Revenue</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {paginatedData.map((row, index) => (

              <TableRow key={index} className="border-[#eee] dark:border-dark-3">
                <TableCell>
                  <div className="flex flex-col gap-2">
                    <p className="font-medium text-dark dark:text-white">
                      {row.koi_id} - {row.variety}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {row.sex} | {row.age} yrs | {row.size_cm} cm
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {row.breeder} ({row.bre_id})
                    </p>
                  </div>
                </TableCell>

                <TableCell>
                  <p className="text-dark dark:text-white font-medium">
                    {row.pcs} pcs
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Unit Cost: {row.jpy_cost.toLocaleString()} JPY
                  </p>
                  <p className="text-green-600 dark:text-green-400 font-medium">
                    Total Cost: {row.jpy_total.toLocaleString()} JPY
                  </p>
                </TableCell>

                <TableCell>
                  <p className="font-medium text-dark dark:text-white">
                    {row.sold_to}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    📍 {row.ship_to}
                  </p>
                </TableCell>

                {SalesCell(row.sales_jpy, row.sales_usd)}
                {SalesCell(row.comm_jpy, row.comm_usd)}
                {SalesCell(row.total_jpy, row.total_usd)}

                <TableCell>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    📦 {row.num_of_box} box(es) | {row.box_size} | {row.total_kg}{" "}
                    kg
                  </p>
                  <p
                    className={cn(
                      "text-sm font-medium",
                      row.shipped_yn === "Yes"
                        ? "text-green-600 dark:text-green-400"
                        : "text-red-500 dark:text-red-400"
                    )}
                  >
                    🚚 {row.shipped_yn === "Yes" ? "Shipped" : "Not Shipped"}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    📆 {dayjs(row.ship_date).format("MMM DD, YYYY")}
                  </p>
                </TableCell>
              </TableRow>

          ))}
        </TableBody>
        
      </Table>

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


const SalesCell = (jpy: number, usd: number) => {
  return (
    <TableCell>
      <p className="text-green-600 dark:text-green-400 text-sm">
        <span className="flex items-center gap-1">
          <span
            className="w-3 h-3 rounded-full bg-[#BC002D] "
            aria-label="Red Ball"
          ></span>
          ¥{jpy.toLocaleString()}
        </span>

        <span className="flex items-center gap-1">
          <img
            src="https://flagcdn.com/w40/us.png"
            alt="US Flag"
            className="w-3 h-3 rounded-full"
          />
          ${usd.toLocaleString()}
        </span>
      </p>
    </TableCell>
  )
}
