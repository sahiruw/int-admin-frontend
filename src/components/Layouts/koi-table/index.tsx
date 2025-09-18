"use client";

import { TrashIcon, EditIcon, TruckIcon } from "@/assets/icons";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ConfirmationDialog } from "@/components/Layouts/ConfirmationDialog";
import { cn } from "@/lib/utils";
import dayjs from "dayjs";
import { useState } from "react";
import { KoiInfo } from "@/types/koi";
import { toast } from "react-hot-toast";
import { useAuth } from "@/hooks/use-auth";


export function KoiInfoTable({ data, setEditingKoiId, onDataChange }: { 
  data: KoiInfo[]; 
  setEditingKoiId: (id: string | null) => void;
  onDataChange?: () => void;
}) {
  const pageSizeOptions = [5, 10, 20, 50, 100];
  const {user} = useAuth();

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(pageSizeOptions[Math.ceil(pageSizeOptions.length / 2)]);  const [confirmationDialog, setConfirmationDialog] = useState<{
    isOpen: boolean;
    pictureId: string | null;
    currentShippedStatus: boolean;
  }>({
    isOpen: false,
    pictureId: null,
    currentShippedStatus: false,
  });
  
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    pictureId: string | null;
  }>({
    isOpen: false,
    pictureId: null,
  });

  const totalPages = Math.ceil(data.length / itemsPerPage);
  const startEntry = (currentPage - 1) * itemsPerPage;
  const endEntry = startEntry + itemsPerPage;
  const paginatedData = data.length ? data.slice(startEntry, endEntry) : [];

  const start = data.length > 0 ? startEntry + 1 : 0;
  const end = Math.min(endEntry, data.length);

  const handleShippedToggle = (pictureId: string, currentStatus: boolean) => {
    setConfirmationDialog({
      isOpen: true,
      pictureId,
      currentShippedStatus: currentStatus,
    });
  };
  const confirmShippedToggle = async () => {
    if (!confirmationDialog.pictureId) return;

    try {
      const response = await fetch('/api/shipping', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          payload: {
            picture_id: confirmationDialog.pictureId,
            shipped: !confirmationDialog.currentShippedStatus,
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update shipping status');
      }

      // Show success message
      toast.success(`Koi ${!confirmationDialog.currentShippedStatus ? 'marked as shipped' : 'marked as not shipped'}`);
      
      // You might want to refresh the data here or update the local state
      // For now, the user would need to refresh to see the change
      window.location.reload();
      
    } catch (error) {
      console.error('Error updating shipped status:', error);
      toast.error('Failed to update shipping status');
    } finally {
      setConfirmationDialog({ isOpen: false, pictureId: null, currentShippedStatus: false });
    }
  };

  const handleDeleteKoi = (pictureId: string) => {
    setDeleteDialog({
      isOpen: true,
      pictureId,
    });
  };

  const confirmDeleteKoi = async () => {
    if (!deleteDialog.pictureId) return;

    try {
      const response = await fetch('/api/koi', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          picture_id: deleteDialog.pictureId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete koi');
      }

      // Show success message
      toast.success('Koi deleted successfully');
      
      // Refresh data if callback is provided
      if (onDataChange) {
        onDataChange();
      } else {
        window.location.reload();
      }
      
    } catch (error) {
      console.error('Error deleting koi:', error);
      toast.error('Failed to delete koi');
    } finally {
      setDeleteDialog({ isOpen: false, pictureId: null });
    }
  };



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
              {user?.role === 'admin' && (<TableHead>Actions</TableHead>)}
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
                </TableCell>                {SalesCell(row.sale_price_jpy, row.sale_price_usd)}
                {SalesCell(row.comm_jpy, row.comm_usd)}
                {SalesCell(
                  row.sale_price_jpy && row.comm_jpy ? row.sale_price_jpy + row.comm_jpy : row.sale_price_jpy, 
                  row.sale_price_usd && row.comm_usd ? row.sale_price_usd + row.comm_usd : row.sale_price_usd
                )}

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
                
                {user?.role === 'admin' && (<TableCell>
                  <div className="flex gap-2">
                    <button
                      className="hover:text-primary-600"
                      title="Edit"
                      onClick={() => setEditingKoiId(row.picture_id)}
                    >
                      <EditIcon className="w-5 h-5" />
                    </button>
                    <button
                      className={cn(
                        "transition-colors",
                        row.shipped 
                          ? "text-green-600 hover:text-green-700" 
                          : "text-gray-400 hover:text-primary-600"
                      )}
                      title={row.shipped ? "Mark as not shipped" : "Mark as shipped"}
                      onClick={() => handleShippedToggle(row.picture_id, row.shipped)}
                    >
                      <TruckIcon className="w-5 h-5" />
                    </button>                    <button
                      className="text-red-500 hover:text-red-700 transition-colors"
                      title="Delete"
                      onClick={() => handleDeleteKoi(row.picture_id)}
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </div>
                </TableCell>)}

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
          </div>        </div>
      </div>      <ConfirmationDialog
        isOpen={confirmationDialog.isOpen}
        title="Update Shipping Status"
        message={
          confirmationDialog.currentShippedStatus
            ? "Are you sure you want to mark this koi as not shipped?"
            : "Are you sure you want to mark this koi as shipped?"
        }
        onConfirm={confirmShippedToggle}
        onCancel={() => setConfirmationDialog({ isOpen: false, pictureId: null, currentShippedStatus: false })}
        confirmText={confirmationDialog.currentShippedStatus ? "Mark as Not Shipped" : "Mark as Shipped"}
        variant="default"
      />

      <ConfirmationDialog
        isOpen={deleteDialog.isOpen}
        title="Delete Koi"
        message="Are you sure you want to delete this koi? This action cannot be undone."
        onConfirm={confirmDeleteKoi}
        onCancel={() => setDeleteDialog({ isOpen: false, pictureId: null })}
        confirmText="Delete"
        variant="destructive"
      />
    </div>
  );
}


const SalesCell = (jpy?: number | null, usd?: number | null) => {
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
        
        {jpy && jpy > 0 && (<span className="flex items-center gap-1">
          <span
            className="w-3 h-3 rounded-full bg-[#BC002D]"
            aria-label="Red Ball"
          ></span>
          ¥{jpy.toLocaleString()}
        </span>)}

        {usd && usd > 0 && (<span className="flex items-center gap-1">
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
