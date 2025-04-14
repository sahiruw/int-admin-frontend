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
};

type DataTableProps<T> = {
  data: T[];
  editData?: (data: T[]) => void; // This function is used to update the data in the parent component
  onEdit?: (id: string, data: T) => void;
  onDelete?: (id: string) => void;
  onAdd?: (data: T) => void;
  excludeKeys?: string[];
  isEditable?: boolean;
  preHeaders?: PreHeader[];
};

export function DataTable<T extends { id: string }>({
  data,
  editData,
  onEdit,
  onDelete,
  onAdd,
  excludeKeys = [],
  isEditable = true,
  preHeaders = [],
}: DataTableProps<T>) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editableData, setEditableData] = useState<Partial<T>>({});
  const [showAddNewForm, setShowAddNewForm] = useState(false);
  const [confirmationProps, setConfirmationProps] = useState<ConfirmationDialogProps | null>(null);
  const [sortColumn, setSortColumn] = useState<string>("id");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const columns = data.length > 0
    ? Object.keys(data[0])
      .filter(key => !excludeKeys.includes(key))
      .map(key => ({
        key,
        header: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      }))
    : [];

  const handleSort = (columnKey: string) => {
    if (sortColumn === columnKey) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(columnKey);
      setSortDirection("asc");
    }
  };

  const sortedData = data.length ? [...data].sort((a, b) => {
    if (!sortColumn) return 0;
    const aValue = (a as any)[sortColumn];
    const bValue = (b as any)[sortColumn];

    if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
    if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
    return 0;
  }) : [];

  const handleEditClick = (row: T) => {
    setEditingId(row.id);
    setEditableData({ ...row });
  };

  const handleSave = () => {
    setConfirmationProps({
      isOpen: true,
      title: "Save Changes",
      message: "Are you sure you want to save the changes?",
      onConfirm: handleSaveConfirmed,
      onCancel: () => setConfirmationProps(null),
      confirmText: "Save",
      cancelText: "Cancel",
    });
  };

  const handleSaveConfirmed = () => {
    if (editingId && onEdit) {
      const updatedData = data.map(row => row.id === editingId ? editableData as T : row);
      editData?.(updatedData);
      onEdit(editingId, editableData as T);
    }
    setEditingId(null);
    setEditableData({});
    setConfirmationProps(null);
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditableData({});
  };

  const handleChange = (key: string, value: any) => {
    setEditableData(prev => ({ ...prev, [key]: value }));
  };

  const handleAdd = (data: T) => {
    onAdd(data);
    setShowAddNewForm(false);
  };

  const handleDelete = (id: string) => {
    setConfirmationProps({
      isOpen: true,
      title: "Delete",
      message: "Are you sure you want to delete this item?",
      onConfirm: () => {
        onDelete(id);
        setConfirmationProps(null);
      },
      onCancel: () => setConfirmationProps(null),
      confirmText: "Delete",
      cancelText: "Cancel",
      variant: "destructive",
    });
  };

  return (
    <div>
      <div className="flex justify-end my-3">
        <button
          className="flex max-w-xl justify-center rounded-lg bg-primary p-2 px-6 font-medium text-white hover:bg-opacity-90"
          onClick={() => setShowAddNewForm(true)}
        >
          Add New
        </button>
      </div>
      {confirmationProps && <ConfirmationDialog {...confirmationProps} />}
      {showAddNewForm && (
        <FormPopup
          title="Add New"
          fields={columns.filter(x => x.key !== "id")}
          onOkay={handleAdd}
          onCancel={() => setShowAddNewForm(false)}
        />
      )}
      <div style={{ height: "60vh", overflow: "auto" }}>
      <Table className="w-full table-fixed">

          <TableHeader>
            <TableRow className=" border-none bg-[#F7F9FC] dark:bg-dark-2 [&>th]:py-4 [&>th]:text-base [&>th]:text-dark [&>th]:dark:text-white">
              {preHeaders.map(({ header, colspan }) => (
                <TableHead key={header} colSpan={colspan} className="text-center w-auto">{header}</TableHead>
              ))}
            </TableRow>

            <TableRow className="border-none bg-[#F7F9FC] dark:bg-dark-2 [&>th]:py-4 [&>th]:text-base [&>th]:text-dark [&>th]:dark:text-white">
              {columns.map(({ key, header }) => (
                <TableHead
                  key={key}
                  onClick={() => handleSort(key)}
                  className="cursor-pointer w-auto"
                >
                  {header}{" "}
                  {sortColumn === key && (sortDirection === "asc" ? "↑" : "↓")}
                </TableHead>
              ))}
              {isEditable && <TableHead>Actions</TableHead>}
            </TableRow>
          </TableHeader>

          <TableBody>
            {sortedData.map((row, index) => {
              const isEditing = editingId === row.id;
              const rowData = isEditing ? editableData : row;

              return (
                <TableRow key={row.id} className="border-[#eee] dark:border-dark-3">
                  {columns.map(({ key }) => (
                    <TableCell key={key} className="p-4 w-auto">
                      {isEditing && key.toLowerCase() !== "id" ? (
                        <input
                          value={(rowData as any)[key] ?? ""}
                          onChange={(e) => handleChange(key, e.target.value)}
                          className="dark:bg-dark-2 border rounded px-2 w-full border-dark-1 dark:border-dark-3"
                        />
                      ) : (
                        <span className="py-35">{(row as any)[key]}</span>
                      )}
                    </TableCell>
                  ))}

                  {isEditable && (
                    <TableCell className="p-4 w-auto">
                      {isEditing ? (
                        <div className="flex gap-3">
                          <button
                            onClick={handleSave}
                            className="text-green-600 hover:text-green-800"
                            title="Save"
                          >
                            <SaveIcon className="w-5 h-5" />
                          </button>

                          <button
                            onClick={() => setEditableData({})}
                            className="text-red-600 hover:text-red-800"
                            title="Clear"
                          >
                            <ClearIcon className="w-5 h-5" />
                          </button>
                          <button
                            onClick={handleCancel}
                            className="text-yellow-600 hover:text-yellow-800"
                            title="Cancel"
                          >
                            <RedoIcon className="w-5 h-5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditClick(row)}
                            className="hover:text-primary"
                            title="Edit"
                          >
                            <EditIcon className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(row.id)}
                            className="hover:text-primary"
                            title="Delete"
                          >
                            <TrashIcon className="w-5 h-5" />
                          </button>
                        </div>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}