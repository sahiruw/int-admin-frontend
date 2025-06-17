import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

export interface BoxSize {
  id?: number;
  size: string;
  length_cm?: number;
  width_cm?: number;
  thickness_cm?: number;
  breeder_name?: string;
  breeder_id?: number;
}

type CellData = {
  length_cm?: number;
  width_cm?: number;
  thickness_cm?: number;
};

type BreederRow = {
  breederName: string;
  data: { [size: string]: CellData };
};

interface BoxSizesState {
  boxSizes: BoxSize[];
  editableData: BreederRow[];
  sizes: string[];
  isLoading: boolean;
  error: string | null;
}

const initialState: BoxSizesState = {
  boxSizes: [],
  editableData: [],
  sizes: ['65', '70', '75', '80'],
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchBoxSizes = createAsyncThunk(
  'boxSizes/fetchBoxSizes',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/box-sizes');
      if (!response.ok) {
        throw new Error('Failed to fetch box sizes');
      }
      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

export const updateBoxSizes = createAsyncThunk(
  'boxSizes/updateBoxSizes',
  async (boxSizes: BoxSize[], { rejectWithValue }) => {
    try {
      const response = await fetch('/api/box-sizes', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ payload: boxSizes }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update box sizes');
      }
      
      const result = await response.json();
      return result;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

const boxSizesSlice = createSlice({
  name: 'boxSizes',
  initialState,
  reducers: {
    updateEditableData: (state, action: PayloadAction<BreederRow[]>) => {
      state.editableData = action.payload;
    },
    updateCell: (state, action: PayloadAction<{
      rowIdx: number;
      size: string;
      field: keyof CellData;
      value: number | undefined;
    }>) => {
      const { rowIdx, size, field, value } = action.payload;
      if (!state.editableData[rowIdx].data[size]) {
        state.editableData[rowIdx].data[size] = {};
      }
      state.editableData[rowIdx].data[size][field] = value;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch box sizes
    builder
      .addCase(fetchBoxSizes.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBoxSizes.fulfilled, (state, action) => {
        state.isLoading = false;
        state.boxSizes = action.payload;
        
        // Update sizes array
        const uniqueSizes = Array.from(new Set(action.payload.map((item: BoxSize) => item.size)));
        uniqueSizes.sort((a: string, b: string) => parseInt(a) - parseInt(b));
        state.sizes = uniqueSizes;
        
        // Convert to editable format
        state.editableData = mapKoiDataToEditableFormat(action.payload);
      })
      .addCase(fetchBoxSizes.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update box sizes
    builder
      .addCase(updateBoxSizes.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateBoxSizes.fulfilled, (state, action) => {
        state.isLoading = false;
        // Update the local state with the returned data
        if (action.payload) {
          state.boxSizes = action.payload;
          state.editableData = mapKoiDataToEditableFormat(action.payload);
        }
      })
      .addCase(updateBoxSizes.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

// Helper function to map data to editable format
function mapKoiDataToEditableFormat(data: BoxSize[]): BreederRow[] {
  const breeders: { [key: string]: BreederRow } = {};

  data.forEach((item) => {
    const breederName = item.breeder_name || 'Unknown';
    if (!breeders[breederName]) {
      breeders[breederName] = {
        breederName,
        data: {},
      };
    }

    const size = item.size;
    if (!breeders[breederName].data[size]) {
      breeders[breederName].data[size] = {};
    }

    breeders[breederName].data[size] = {
      length_cm: item.length_cm,
      width_cm: item.width_cm,
      thickness_cm: item.thickness_cm,
    };
  });

  return Object.values(breeders);
}

export const { updateEditableData, updateCell, clearError } = boxSizesSlice.actions;
export default boxSizesSlice.reducer;
