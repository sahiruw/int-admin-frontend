import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { ShippingData } from '@/types/koi';

interface ShippingState {
  shippingData: Record<string, ShippingData>;
  isLoading: boolean;
  error: string | null;
}

const initialState: ShippingState = {
  shippingData: {},
  isLoading: false,
  error: null,
};

// Async thunks
export const updateShippingData = createAsyncThunk(
  'shipping/updateShippingData',
  async (payload: Array<{ picture_id: string } & ShippingData>, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/shipping', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ payload }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update shipping data');
      }
      
      const result = await response.json();
      return result;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

export const generateThumbnailPDF = createAsyncThunk(
  'shipping/generateThumbnailPDF',
  async (items: Array<{ picture_id: string; variety: string; size: number; }>, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/thumbnails/pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ items }),
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

      window.URL.revokeObjectURL(url);
      
      return 'PDF generated successfully';
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

export const generateShippingReport = createAsyncThunk(
  'shipping/generateShippingReport',
  async (reportData: {
    date: string | null;
    breeder: string;
    breederID: string;
    records: any[];
  }, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/excel-report/shipping-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ payload: reportData }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate report');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `Koi_Report_${Date.now()}.xlsx`;
      document.body.appendChild(link);
      link.click();
      
      link.remove();
      window.URL.revokeObjectURL(url);
      
      return 'Report generated successfully';
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

const shippingSlice = createSlice({
  name: 'shipping',
  initialState,
  reducers: {
    setShippingData: (state, action: PayloadAction<Record<string, ShippingData>>) => {
      state.shippingData = action.payload;
    },
    updateSingleShipping: (state, action: PayloadAction<{ id: string; data: ShippingData }>) => {
      state.shippingData[action.payload.id] = action.payload.data;
    },
    clearShippingData: (state) => {
      state.shippingData = {};
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Update shipping data
    builder
      .addCase(updateShippingData.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateShippingData.fulfilled, (state) => {
        state.isLoading = false;
        state.shippingData = {};
      })
      .addCase(updateShippingData.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Generate thumbnail PDF
    builder
      .addCase(generateThumbnailPDF.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(generateThumbnailPDF.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(generateThumbnailPDF.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Generate shipping report
    builder
      .addCase(generateShippingReport.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(generateShippingReport.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(generateShippingReport.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { 
  setShippingData, 
  updateSingleShipping, 
  clearShippingData, 
  clearError 
} = shippingSlice.actions;

export default shippingSlice.reducer;
