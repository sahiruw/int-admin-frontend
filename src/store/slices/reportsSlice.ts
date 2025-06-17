import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { KoiSaleRecord, ShippingData } from '@/types/koi';

type SummaryResult = {
  [key: string]: string | number | string[];
  pcs: number;
  jpy_total_cost: number;
  jpy_total_sale: number;
  jpy_profit_total: number;
  usd_total_sale: number;
  usd_total_cost: number;
  usd_profit_total: number;
  picture_ids: string[];
};

function groupAndSum(data: KoiSaleRecord[], key: keyof KoiSaleRecord): SummaryResult[] {
  const result: Record<string, SummaryResult> = {};

  data.forEach(item => {
    const groupKey = String(item[key]);

    if (!result[groupKey]) {
      result[groupKey] = {
        [key]: groupKey,
        pcs: 0,
        jpy_total_cost: 0,
        jpy_total_sale: 0,
        usd_total_sale: 0,
        jpy_profit_total: 0,
        usd_total_cost: 0,
        usd_profit_total: 0,
        picture_ids: [],
      };
    }

    result[groupKey].pcs += item.pcs || 0;
    result[groupKey].jpy_total_cost += item.jpy_total_cost || 0;
    result[groupKey].jpy_total_sale += item.jpy_total_sale || 0;
    result[groupKey].usd_total_sale += item.usd_total_sale || 0;
    result[groupKey].picture_ids.push(item.picture_id);
    result[groupKey].usd_total_cost += item.usd_total_cost || 0;
  });

  // convert all floats to 2 decimal places
  Object.values(result).forEach((item) => {
    item.pcs = item.pcs;
    item.jpy_total_cost = item.jpy_total_sale ? Number(item.jpy_total_cost.toFixed(2)) : 0;
    item.jpy_total_sale = Number(item.jpy_total_sale.toFixed(2));
    item.usd_total_sale = Number(item.usd_total_sale.toFixed(2));
    item.usd_total_cost = item.usd_total_sale ? Number(item.usd_total_cost.toFixed(2)) : 0;
    item.usd_profit_total = item.usd_total_sale - item.usd_total_cost;
    item.jpy_profit_total = item.jpy_total_sale - item.jpy_total_cost;
  });

  return Object.values(result);
}

interface ReportsState {
  salesData: KoiSaleRecord[];
  shippingData: ShippingData[];
  invoiceData: KoiSaleRecord[];
  salesByCustomer: any[];
  salesByBreeder: any[];
  salesByDivision: any[];
  filteredSales: any[];
  dateRange: {
    startDate: string;
    endDate: string;
  };
  isLoading: boolean;
  error: string | null;
}

const initialState: ReportsState = {
  salesData: [],
  shippingData: [],
  invoiceData: [],
  salesByCustomer: [],
  salesByBreeder: [],
  salesByDivision: [],
  filteredSales: [],
  dateRange: {
    startDate: '',
    endDate: '',
  },
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchSalesReport = createAsyncThunk(
  'reports/fetchSalesReport',
  async (dateRange: { startDate: string; endDate: string }, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/koi/sales?start=${dateRange.startDate}&end=${dateRange.endDate}`);
      if (!response.ok) {
        throw new Error('Failed to fetch sales report');
      }
      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

export const fetchShippingList = createAsyncThunk(
  'reports/fetchShippingList',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/koi/shipping-list');
      if (!response.ok) {
        throw new Error('Failed to fetch shipping list');
      }
      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

export const fetchInvoiceData = createAsyncThunk(
  'reports/fetchInvoiceData',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/koi');
      if (!response.ok) {
        throw new Error('Failed to fetch invoice data');
      }
      const data = await response.json();
      return data.filter((record: any) => record.date && !record.shipped);
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

export const generateInvoiceReport = createAsyncThunk(
  'reports/generateInvoiceReport',
  async (reportData: {
    customer: string;
    records: any[];
  }, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/excel-report/invoice-by-customer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ payload: reportData }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate invoice report');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `Invoice_Report_${Date.now()}.xlsx`;
      document.body.appendChild(link);
      link.click();
      
      link.remove();
      window.URL.revokeObjectURL(url);
      
      return 'Invoice report generated successfully';
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

const reportsSlice = createSlice({
  name: 'reports',
  initialState,
  reducers: {
    setDateRange: (state, action: PayloadAction<{ startDate: string; endDate: string }>) => {
      state.dateRange = action.payload;
    },
    setFilteredSales: (state, action: PayloadAction<any[]>) => {
      state.filteredSales = action.payload;
      // Update grouped data when filtered sales change
      state.salesByCustomer = groupAndSum(action.payload.filter((sale) => sale.customer_name), 'customer_name');
      state.salesByBreeder = groupAndSum(action.payload.filter((sale) => sale.breeder_name), 'breeder_name');
      state.salesByDivision = groupAndSum(action.payload.filter((sale) => sale.location_name), 'location_name');
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch sales report
    builder
      .addCase(fetchSalesReport.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSalesReport.fulfilled, (state, action) => {
        state.isLoading = false;
        state.salesData = action.payload;
        state.filteredSales = action.payload;
        // Update grouped data
        state.salesByCustomer = groupAndSum(action.payload.filter((sale: any) => sale.customer_name), 'customer_name');
        state.salesByBreeder = groupAndSum(action.payload.filter((sale: any) => sale.breeder_name), 'breeder_name');
        state.salesByDivision = groupAndSum(action.payload.filter((sale: any) => sale.location_name), 'location_name');
      })
      .addCase(fetchSalesReport.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });    // Fetch shipping list
    builder
      .addCase(fetchShippingList.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchShippingList.fulfilled, (state, action) => {
        state.isLoading = false;
        state.shippingData = action.payload;
      })
      .addCase(fetchShippingList.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch invoice data
    builder
      .addCase(fetchInvoiceData.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchInvoiceData.fulfilled, (state, action) => {
        state.isLoading = false;
        state.invoiceData = action.payload;
      })
      .addCase(fetchInvoiceData.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Generate invoice report
    builder
      .addCase(generateInvoiceReport.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(generateInvoiceReport.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(generateInvoiceReport.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setDateRange, setFilteredSales, clearError } = reportsSlice.actions;
export default reportsSlice.reducer;