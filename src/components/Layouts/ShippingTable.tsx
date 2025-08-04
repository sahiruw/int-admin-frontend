"use client";

import { useEffect, useMemo, useState } from "react";
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
import { FormPopup } from "./FormPopup";
import { ConfirmationDialog } from "./ConfirmationDialog";
import { ConfirmationDialogProps } from "@/types/ui";
import { KoiInfo, ShippingData } from "@/types/koi";

type DataTableProps = {
  rawData: KoiInfo[];
  shippingData: Record<string, ShippingData>;
  setShippingData: React.Dispatch<React.SetStateAction<Record<string, ShippingData>>>;
};


export function DataTable({
  rawData,
  shippingData,
  setShippingData,
}: DataTableProps) {

  if (!rawData?.length) {
    return <div className="text-center p-12">
      No data to display</div>;
  }

  let columns = ["Koi Info", "Variety", "Cost info", "Customer Info"]
  let input_columns: { key: keyof ShippingData; Header: string; type: string }[] = [
    { key: "date", Header: "Ship Date", type: "date" },
    { key: "box_count", Header: "# of Box", type: "number" },
    { key: "box_size", Header: "Box Size", type: "number" },
    { key: "weight_of_box", Header: "KG", type: "number" },
  ];

  const [data, setData] = useState<KoiInfo[]>(rawData);
  const [masterShipDate, setMasterShipDate] = useState<string>("");
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());

  useEffect(() => {
    setData(rawData)
  }
    , [rawData]);

  const handleInputChange = (picture_id: string, field: string, value: string | number): void => {
    setData((prev) => {
      const updated = prev.map((item) => {
        if (item.picture_id === picture_id) {
          return {
            ...item,
            [field]: value,
          };
        }
        return item;
      });
      return updated
    });
  
    setShippingData((prev) => ({
      ...prev,
      [picture_id]: {
        ...prev[picture_id],
        [field]: value,
      },
    }));
  };

  const toggleRowSelection = (picture_id: string) => {
    setSelectedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(picture_id)) {
        newSet.delete(picture_id);
      } else {
        newSet.add(picture_id);
      }
      return newSet;
    });
  };

  const selectAllRows = () => {
    if (selectedRows.size === data.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(data.map(row => row.picture_id)));
    }
  };

  const applyMasterDateToSelected = () => {
    if (!masterShipDate || selectedRows.size === 0) return;
    
    selectedRows.forEach(picture_id => {
      handleInputChange(picture_id, "date", masterShipDate);
    });
    
    setSelectedRows(new Set()); // Clear selection after applying
  };

  const applyMasterDateToAll = () => {
    if (!masterShipDate) return;
    
    data.forEach(row => {
      handleInputChange(row.picture_id, "date", masterShipDate);
    });
  };
  

  const totalsByGroup = useMemo(() => {
    const groupTotals: Record<string, { numerator: number; denominator: number }> = {};

    data.forEach(row => {
      if (row.grouping && row.weight_of_box && row.box_count && row.pcs) {
        const group = row.grouping;
        const weightSum = row.weight_of_box * row.box_count;
        const pcs = row.pcs;

        if (!groupTotals[group]) {
          groupTotals[group] = { numerator: 0, denominator: 0 };
        }

        groupTotals[group].numerator += weightSum;
        groupTotals[group].denominator += pcs;
      }
    });

    const result: Record<string, number> = {};
    for (const group in groupTotals) {
      const { numerator, denominator } = groupTotals[group];
      result[group] = denominator !== 0 ? numerator / denominator : 0;
    }

    return result;
  }, [data]);

  return (
    <div className="space-y-4">      {/* Master Ship Date Controls */}
      <div className="flex items-center gap-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <div className="flex items-center gap-2">
          <label className="text-sm text-blue-800 dark:text-blue-200">
            Master Ship Date:
          </label>
          <input
            type="date"
            value={masterShipDate}
            onChange={(e) => setMasterShipDate(e.target.value)}
            className="px-3 py-1 border border-blue-300 dark:border-blue-600 rounded-md bg-white dark:bg-dark-2 text-sm "
          />
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={applyMasterDateToSelected}
            disabled={!masterShipDate || selectedRows.size === 0}
            className="px-3 py-1 bg-blue-600 text-white text-sm  rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            title={`Apply to ${selectedRows.size} selected rows`}
          >
            Apply to Selected ({selectedRows.size})
          </button>
          
          <button
            onClick={applyMasterDateToAll}
            disabled={!masterShipDate}
            className="px-3 py-1 bg-green-600 text-white text-sm  rounded-md hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Apply to All
          </button>
        </div>
        
        <div className="text-sm  text-blue-700 dark:text-blue-300 ml-auto">
          💡 Select rows by clicking checkboxes, then apply master date to save time
        </div>
      </div>

      <div className="overflow-y-auto" style={{ maxHeight: "72vh", overflowY: "auto" }}>
        <Table className="w-full table-fixed">
          <TableHeader>            <TableRow className="sticky top-0 z-10 bg-[#F7F9FC] dark:bg-dark-2 border-none [&>th]:text-base [&>th]: [&>th]:text-dark [&>th]:dark:text-white">
              <TableHead className="w-8">
                <input
                  type="checkbox"
                  checked={selectedRows.size === data.length && data.length > 0}
                  onChange={selectAllRows}
                  className="w-4 h-4"
                  title="Select/Deselect all"
                />
              </TableHead>
              {columns?.map((header, index) => (
                <TableHead
                  key={index}
                  className={cn("w-auto ", index === 0 ? "text-left" : "text-right")}
                >
                  {header}
                </TableHead>
              ))}
              <TableHead className="w-auto " colSpan={7}>
                Ship Info
              </TableHead>
            </TableRow>

            <TableRow className="sticky z-10 bg-[#F7F9FC] dark:bg-dark-2 border-none [&>th]:text-base [&>th]: [&>th]:text-dark [&>th]:dark:text-white">
              <TableHead />
              <TableHead colSpan={4} />
              {input_columns.map((column) => (
                <TableHead key={column.key} className="">{column.Header}</TableHead>
              ))}
              <TableHead className="w-auto ">
                Total KG
              </TableHead>
              <TableHead className="w-auto ">
                Grouping
              </TableHead>
              <TableHead className="w-auto ">
                S/C Per Koi
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {data?.map((row, index) => {
              const isSelected = selectedRows.has(row.picture_id);
              return (
                <TableRow 
                  key={index} 
                  className={cn(
                    "border-[#eee] dark:border-dark-3",
                    isSelected && "bg-blue-50 dark:bg-blue-900/20"
                  )}
                >
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleRowSelection(row.picture_id)}
                      className="w-4 h-4"
                    />
                  </TableCell>                  <TableCell>
                    <div className="flex flex-col">
                      <p className=" text-dark dark:text-white">
                        {row.picture_id}
                      </p>
                      <p className="text-sm  text-gray-600 dark:text-gray-300">
                        {row.sex} | {row.age} yrs | {row.size_cm} cm
                      </p>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="flex flex-col">
                      <p className=" text-dark dark:text-white">
                        {row.variety_name} ({row.koi_id})
                      </p>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="flex flex-col text-right">
                      <p className=" text-dark dark:text-white">
                        ¥{row.jpy_cost} * {row.pcs} Pcs
                      </p>
                      <p className="text-sm  text-gray-600 dark:text-gray-300">
                        ¥{row.jpy_total}
                      </p>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="flex flex-col text-right">
                      <p className=" text-dark dark:text-white">
                        {row.customer_name}
                      </p>
                      <p className="text-sm  text-gray-600 dark:text-gray-300">
                        {row.location_name && (`📍 ${row.location_name}`)}
                      </p>
                    </div>
                  </TableCell>

                  {input_columns?.map(({ key, Header, type }) => (
                    <TableCell key={key} className="text-right">                      <input
                        type={type}
                        value={row[key] || ""}
                        onChange={(e) => handleInputChange(row.picture_id, key, e.target.value)}
                        className={cn(
                          "w-full text-right border border-gray-100 rounded-md p-2 ",
                          key === "date" && isSelected && "border-blue-300 bg-blue-50 dark:bg-blue-900/20"
                        )}
                      />
                    </TableCell>
                  ))}                  <TableCell className="text-right">
                    {(row.box_count && row.weight_of_box) ? (
                      <div className="flex flex-col text-right">
                        <p className=" text-dark dark:text-white">
                          {row.box_count * row.weight_of_box} KG
                        </p>
                        <p className="text-sm  text-gray-600 dark:text-gray-300">
                          {row.weight_of_box} x {row.box_count}
                        </p>
                      </div>
                    ) : <></>}
                  </TableCell>

                  <TableCell className="text-right">
                    <input
                      type="text"
                      value={row["grouping"] || ""}
                      onChange={(e) => handleInputChange(row.picture_id, "grouping", e.target.value)}
                      className="w-full text-right border border-gray-100 rounded-md p-2 "
                    />
                  </TableCell>

                  <TableCell className="text-right">
                    {row.grouping && totalsByGroup[row.grouping] !== undefined && (
                      <p className=" text-dark dark:text-white">
                        {totalsByGroup[row.grouping].toFixed(2)}
                      </p>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}