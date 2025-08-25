"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { TrashIcon, EditIcon, SaveIcon, RedoIcon, ClearIcon } from "@/assets/icons";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FormPopup } from "../FormPopup";
import { ConfirmationDialog } from "../ConfirmationDialog";
import { ConfirmationDialogProps } from "@/types/ui";

type PreHeader = {
  header: string;
  colspan: number;
  color?: string; // Tailwind or hex class
};


type DataTableProps<T> = {
  data: T[];
  preHeaders?: PreHeader[];
  columns: { key: string; header: string }[];
  showTotals?: boolean;
  label: string;
  sortable?: boolean;
  selectable?: boolean;
  selectedRows?: T[];
  toggleSelectedRow?: (isSelected: boolean, row?: T) => void;
  maxHeight?: string;
};

export function DataTable<T extends {}>({
  data,
  preHeaders = [],
  columns,
  showTotals = false,
  label,
  sortable = true,
  selectable = false,
  selectedRows = [],
  toggleSelectedRow,
  maxHeight = "75vh",
}: DataTableProps<T>) {

  if (!data?.length || !columns?.length) {
    return <div className="text-center p-12">
      No data to display</div>;
  }

  // Build a column-to-color map based on preHeader spans
  const columnColors: string[] = [];
  let colIndex = 0;

  preHeaders.forEach(({ colspan, color }) => {
    for (let i = 0; i < colspan; i++) {
      columnColors[colIndex] = color || '';
      colIndex++;
    }
  });

  const [sortColumn, setSortColumn] = useState<string>("id");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const handleSort = (columnKey: string) => {
    if (sortColumn === columnKey) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(columnKey);
      setSortDirection("asc");
    }
  };

  const sortedData = [...data].sort((a, b) => {
    if (!sortColumn) return 0;
    const aValue = (a as any)[sortColumn];
    const bValue = (b as any)[sortColumn];

    if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
    if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });


  return (
    <div className="overflow-y-auto" style={{ maxHeight: maxHeight, overflowY: "auto" }}>

      <div
        className={cn(
          "text-2xl font-semibold p-4",
          sortedData.every((row: any) => row.shipped === true)
            ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
            : "text-primary dark:text-primary-dark"
        )}
      >
        {label}
        {sortedData.every((row: any) => row.shipped === true) && (
          <span className="ml-2 px-2 py-1 rounded bg-green-200 text-green-800 dark:bg-green-800 dark:text-green-200 text-sm font-normal">
            Shipped
          </span>
        )}
      </div>

      <Table className="w-full table-fixed">

        <TableHeader>
          {preHeaders.length > 0 && 
          <TableRow className="sticky z-10  border-none bg-[#F7F9FC] dark:bg-dark-2 [&>th]:py-4 [&>th]:text-base [&>th]:text-dark [&>th]:dark:text-white">
            {preHeaders.map(({ header, colspan, color }) => (
              <TableHead
                key={header}
                colSpan={colspan}
                className={cn("text-center w-auto", color ? color : "bg-[#F7F9FC] dark:bg-dark-2")}
              >
                {header}
              </TableHead>
            ))}

          </TableRow>}

          <TableRow className="sticky z-10 border-none bg-[#F7F9FC] dark:bg-dark-2 [&>th]:py-4 [&>th]:text-base [&>th]:text-dark [&>th]:dark:text-white">
            {selectable && (
              <TableHead className="w-10 text-center">
                <input type="checkbox" className="w-4 h-4"
                  onChange={(e) => { toggleSelectedRow && toggleSelectedRow(e.target.checked) }}
                />
              </TableHead>
            )
            }

            {columns.map(({ key, header }, index) => (
              sortable ? (
                <TableHead
                  key={key}
                  onClick={() => handleSort(key)}
                  className={cn("cursor-pointer w-auto", columnColors[index], index === 0 ? "text-left" : "text-right")}
                >
                  {header}{" "}
                  {sortColumn === key && (sortDirection === "asc" ? "↑" : "↓")}
                </TableHead>
              ) : (
                <TableHead
                  key={key}
                  className={cn("w-auto", columnColors[index], index === 0 ? "text-left" : "text-right")}
                >
                  {header}
                </TableHead>

              )
            ))}

          </TableRow>
        </TableHeader>

        <TableBody>
          {sortedData.map((row, index) => {
            return (
              <TableRow key={index} className="border-[#eee] dark:border-dark-3">
                {selectable && (
                  <TableCell className="w-10 text-center">
                    <input type="checkbox" className="w-4 h-4"
                      onChange={(e) => { toggleSelectedRow && toggleSelectedRow(e.target.checked, row) }} checked={selectedRows.includes(row)}
                    />
                  </TableCell>
                )}


                {columns.map(({ key }, index) => (
                  <TableCell
                    key={key}
                    className={cn("p-4 w-auto", columnColors[index], index === 0 ? "text-left" : "text-right")}
                  >
                    {typeof row[key] === 'number' ? row[key].toLocaleString() : row[key]}
                  </TableCell>
                ))}



              </TableRow>
            );
          })}

          {showTotals && (

            <TableRow className="border-[#eee] dark:border-dark-3 font-semibold">
              {columns.map(({ key }, index) => (
                <TableCell
                  key={key}
                  className={cn(
                    "p-4 w-auto text-right",
                    columnColors[index],
                    index === 0 ? "text-left" : "text-right",
                    "text-primary dark:text-primary-dark"
                  )}
                >
                  {index === 0
                    ? "Total"
                    : sortedData.reduce((acc, row) => acc + (row[key] || 0), 0).toLocaleString()}
                </TableCell>
              ))}
            </TableRow>

          )}

        </TableBody>
      </Table>
    </div>
  );
}