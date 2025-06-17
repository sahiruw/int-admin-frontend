import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { KoiSaleRecord } from '@/types/koi';
import { InvoiceByDate, InvoiceByDateTableRecord } from '@/types/report';
import { toast } from 'react-hot-toast';

// Types
interface InvoiceState {
  data: KoiSaleRecord[];
  tableData: KoiSaleRecord[];
  selectedDate: string;
  selectedBreeder: string;
  selectedRows: string[];
  loading: boolean;
  error: string | null;
  isConfirmationDialogOpen: boolean;
}

// Initial state
const initialState: InvoiceState = {
  data: [],
  tableData: [],
  selectedDate: '',
  selectedBreeder: '',
  selectedRows: [],
  loading: false,
  error: null,
  isConfirmationDialogOpen: false,
};

// Async thunks
export const fetchInvoiceData = createAsyncThunk(
  'invoice/fetchData',
  async () => {
    const response = await fetch('/api/koi', { next: { revalidate: 300 } });
    if (!response.ok) {
      throw new Error('Failed to fetch koi sales data');
    }
    const rawData: KoiSaleRecord[] = await response.json();
    const filtered = rawData.filter((record) => record.date && !record.shipped);
    return groupRecords(filtered);
  }
);

export const markAsShipped = createAsyncThunk(
  'invoice/markAsShipped',
  async (selectedRows: string[], { rejectWithValue }) => {
    try {
      const payload = selectedRows.map((rowId) => ({
        picture_id: rowId,
        shipped: true,
      }));

      const response = await fetch('/api/shipping', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ payload }),
      });

      if (!response.ok) {
        throw new Error('Failed to mark as shipped');
      }

      const result = await response.json();
      toast.success('Marked as shipped successfully');
      return selectedRows;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to mark as shipped';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const generateInvoiceReport = createAsyncThunk(
  'invoice/generateReport',
  async ({ selectedDate, tableData }: { selectedDate: string; tableData: KoiSaleRecord[] }, { rejectWithValue }) => {
    try {
      const data: InvoiceByDate = {
        date: selectedDate,
        records: tableData.map(
          row => ({
            container_number: row.container_number,
            age: row.age,
            variety_name: row.variety_name,
            breeder_name: row.breeder_name,
            size_cm: row.size_cm,
            total_weight: row.total_weight,
            pcs: row.pcs,
            jpy_cost: row.jpy_cost,
            jpy_total: row.jpy_total,
            box_count: row.box_count
          } as InvoiceByDateTableRecord)
        )
      };

      const response = await fetch('/api/excel-report/invoice-packing-list', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ payload: data }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate report');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      // Create a temporary link to download the file
      const link = document.createElement('a');
      link.href = url;
      link.download = `Koi_Report_${Date.now()}.xlsx`;
      document.body.appendChild(link);
      link.click();

      // Cleanup
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success('Report downloaded successfully');
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to generate report';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const generateThumbnailSheet = createAsyncThunk(
  'invoice/generateThumbnailSheet',
  async (tableData: KoiSaleRecord[], { rejectWithValue }) => {
    try {
      const data = tableData.map(row => ({
        picture_id: row.picture_id,
        variety: row.variety_name,
        size: row.size_cm,
      }));

      const response = await fetch('/api/thumbnails/pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ items: data }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate PDF');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = 'thumbnail-sheet.pdf';
      document.body.appendChild(link);
      link.click();
      link.remove();

      // Cleanup the blob URL after download
      window.URL.revokeObjectURL(url);

      toast.success('Thumbnail sheet downloaded successfully');
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error generating PDF';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

// Helper function for grouping records
export function groupRecords(records: KoiSaleRecord[]) {
  // Group records by date
  const recordsByDate: { [date: string]: KoiSaleRecord[] } = {};

  for (const record of records) {
    const date = record.date || 'unknown';
    if (!recordsByDate[date]) {
      recordsByDate[date] = [];
    }
    recordsByDate[date].push(record);
  }

  // Process each date group individually
  const allUpdatedRecords: KoiSaleRecord[] = [];

  for (const date of Object.keys(recordsByDate).sort()) {
    let containerIndex = 1;

    const grouped = recordsByDate[date].sort((a, b) => {
      if (a.breeder_name < b.breeder_name) return -1;
      if (a.breeder_name > b.breeder_name) return 1;

      const groupA = a.grouping ?? "";
      const groupB = b.grouping ?? "";
      const groupCompare = groupA.localeCompare(groupB);
      if (groupCompare !== 0) return groupCompare;

      // Tiebreaker: picture_id comparison
      return a.picture_id.localeCompare(b.picture_id);
    });

    const updatedGroup = grouped.map((record) => {
      if (record.box_count) {
        const start = containerIndex;
        const end = containerIndex + parseInt(record.box_count) - 1;

        const container_number =
          record.box_count === 1
            ? `C/NO. ${start}`
            : `C/NO. ${start}-${end}`;

        containerIndex = end + 1;

        return {
          ...record,
          container_number,
        };
      } else {
        return {
          ...record,
          container_number: "",
        };
      }
    });

    allUpdatedRecords.push(...updatedGroup);
  }

  return allUpdatedRecords;
}

// Slice
const invoiceSlice = createSlice({
  name: 'invoice',
  initialState,
  reducers: {
    setSelectedDate: (state, action: PayloadAction<string>) => {
      state.selectedDate = action.payload;
      state.selectedRows = []; // Clear selected rows when date changes
    },
    setSelectedBreeder: (state, action: PayloadAction<string>) => {
      state.selectedBreeder = action.payload;
    },
    setSelectedRows: (state, action: PayloadAction<string[]>) => {
      state.selectedRows = action.payload;
    },
    toggleSelectedRow: (state, action: PayloadAction<{ isSelected: boolean; row?: KoiSaleRecord }>) => {
      const { isSelected, row } = action.payload;
      if (row) {
        state.selectedRows = isSelected 
          ? [...state.selectedRows, row.picture_id]
          : state.selectedRows.filter((r) => r !== row.picture_id);
      } else {
        state.selectedRows = isSelected 
          ? state.tableData.map(row => row.picture_id)
          : [];
      }
    },
    setConfirmationDialogOpen: (state, action: PayloadAction<boolean>) => {
      state.isConfirmationDialogOpen = action.payload;
    },
    clearFilters: (state) => {
      state.selectedBreeder = '';
      state.selectedDate = '';
      state.selectedRows = [];
    },
    updateTableData: (state) => {
      // Filter data based on selected date and breeder
      state.tableData = state.data.filter(record => 
        (record.date === state.selectedDate || state.selectedDate === "") && 
        (record.breeder_name === state.selectedBreeder || state.selectedBreeder === "")
      );
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch invoice data
      .addCase(fetchInvoiceData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInvoiceData.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
        // Update table data based on current filters
        state.tableData = state.data.filter(record => 
          (record.date === state.selectedDate || state.selectedDate === "") && 
          (record.breeder_name === state.selectedBreeder || state.selectedBreeder === "")
        );
      })
      .addCase(fetchInvoiceData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch data';
      })
      // Mark as shipped
      .addCase(markAsShipped.pending, (state) => {
        state.loading = true;
      })
      .addCase(markAsShipped.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedRows = [];
        state.isConfirmationDialogOpen = false;
        // Remove shipped records from data
        state.data = state.data.filter((record) => !action.payload.includes(record.picture_id));
        state.tableData = state.tableData.filter((record) => !action.payload.includes(record.picture_id));
      })
      .addCase(markAsShipped.rejected, (state) => {
        state.loading = false;
        state.isConfirmationDialogOpen = false;
      })
      // Generate report
      .addCase(generateInvoiceReport.pending, (state) => {
        state.loading = true;
      })
      .addCase(generateInvoiceReport.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(generateInvoiceReport.rejected, (state) => {
        state.loading = false;
      })
      // Generate thumbnail sheet
      .addCase(generateThumbnailSheet.pending, (state) => {
        state.loading = true;
      })
      .addCase(generateThumbnailSheet.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(generateThumbnailSheet.rejected, (state) => {
        state.loading = false;
      });
  },
});

export const {
  setSelectedDate,
  setSelectedBreeder,
  setSelectedRows,
  toggleSelectedRow,
  setConfirmationDialogOpen,
  clearFilters,
  updateTableData,
} = invoiceSlice.actions;

export default invoiceSlice.reducer;
