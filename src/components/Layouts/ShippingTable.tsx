"use client";

import { useEffect, useState } from "react";
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

  useEffect(() => {
    setData(rawData);
  }, [rawData]);

  const handleInputChange = (picture_id: string, field: string, value: string | number): void => {
    setData((prev) => {
      return prev.map((item) => {
        if (item.picture_id === picture_id) {
          return {
            ...item,
            [field]: value,
          };
        }
        return item;
      });
    });


    setShippingData((prev) => ({
      ...prev,
      [picture_id]: {
        ...prev[picture_id],
        [field]: value,
      },
    }));
  }


  return (
    <div className="overflow-y-auto" style={{ maxHeight: "75vh", overflowY: "auto" }}>

      <Table className="w-full table-fixed">


        <TableHeader>
          <TableRow className="sticky top-0 z-10 bg-[#F7F9FC] dark:bg-dark-2 border-none [&>th]:text-base [&>th]:text-dark [&>th]:dark:text-white">
            {columns?.map((header, index) => (
              <TableHead
                key={index}
                className={cn("w-auto", index === 0 ? "text-left" : "text-right")}
              >
                {header}
              </TableHead>
            ))}
            <TableHead className="w-auto" colSpan={5}>
              Ship Info
            </TableHead>
          </TableRow>

          <TableRow className="sticky z-10 bg-[#F7F9FC] dark:bg-dark-2 border-none  [&>th]:text-base [&>th]:text-dark [&>th]:dark:text-white">
            <TableHead colSpan={4} />
            {input_columns.map((column) => (
              <TableHead key={column.key}>{column.Header}</TableHead>
            ))}
            <TableHead className="w-auto">
              Total KG
            </TableHead>
          </TableRow>
        </TableHeader>


        <TableBody>
          {data?.map((row, index) => {
            return (
              <TableRow key={index} className="border-[#eee] dark:border-dark-3">
                <TableCell>
                  <div className="flex flex-col">
                    <p className="font-medium text-dark dark:text-white">
                      {row.picture_id}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {row.sex} | {row.age} yrs | {row.size_cm} cm
                    </p>

                  </div>
                </TableCell>

                <TableCell>
                  <div className="flex flex-col">
                    <p className="font-medium text-dark dark:text-white">
                      {row.variety_name} ({row.koi_id})
                    </p>

                  </div>
                </TableCell>

                <TableCell>
                  <div className="flex flex-col text-right">
                    <p className="font-medium text-dark dark:text-white">
                      ¥{row.jpy_cost} * {row.pcs} Pcs
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      ¥{row.jpy_total}
                    </p>

                  </div>
                </TableCell>

                <TableCell>
                  <div className="flex flex-col text-right">
                    <p className="font-medium text-dark dark:text-white">
                      {row.customer_name}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {row.location_name && (`📍 ${row.location_name}`)}
                    </p>

                  </div>
                </TableCell>

                {input_columns?.map(({ key, Header, type }) => (
                  <TableCell key={key} className="text-right">
                    <input
                      type={type}
                      value={row[key] || ""}
                      onChange={(e) => handleInputChange(row.picture_id, key, e.target.value)}
                      className="w-full text-right border border-gray-100 rounded-md p-2"
                    />
                  </TableCell>


                )

                )}

                <TableCell className="text-right">
                  {(row.box_count && row.weight_of_box) ? (
                    <div className="flex flex-col text-right">
                      <p className="font-medium text-dark dark:text-white">
                        {row.box_count * row.weight_of_box} KG
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {row.weight_of_box} x {row.box_count}
                      </p>

                    </div>
                  ) : <></>}
                </TableCell>


              </TableRow>
            );
          })}



        </TableBody>
      </Table>
    </div>
  );
}