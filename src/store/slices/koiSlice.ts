import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { KoiInfo, KoiSaleRecord } from '@/types/koi';

interface KoiState {
  koiList: KoiInfo[];
  filteredKoiList: KoiInfo[];
  salesRecords: KoiSaleRecord[];
  filters: Record<string, string[]>;
  isLoading: boolean;
  error: string | null;
  selectedKoi: KoiInfo | null;
}

const initialState: KoiState = {
  koiList: [],
  filteredKoiList: [],
  salesRecords: [],
  filters: {},
  isLoading: false,
  error: null,
  selectedKoi: null,
};

// Async thunks
export const fetchKoiList = createAsyncThunk(
  'koi/fetchKoiList',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/koi');
      if (!response.ok) {
        throw new Error('Failed to fetch koi data');
      }
      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

export const fetchUnshippedKoi = createAsyncThunk(
  'koi/fetchUnshippedKoi',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/koi?shipped=false');
      if (!response.ok) {
        throw new Error('Failed to fetch unshipped koi data');
      }
      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

export const addKoi = createAsyncThunk(
  'koi/addKoi',
  async (koiData: Partial<KoiInfo>, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/koi', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(koiData),
      });
      if (!response.ok) {
        throw new Error('Failed to add koi');
      }
      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

export const updateKoi = createAsyncThunk(
  'koi/updateKoi',
  async ({ id, data }: { id: number; data: Partial<KoiInfo> }, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/koi', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, ...data }),
      });
      if (!response.ok) {
        throw new Error('Failed to update koi');
      }
      const updatedData = await response.json();
      return updatedData;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

export const deleteKoi = createAsyncThunk(
  'koi/deleteKoi',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/koi', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      });
      if (!response.ok) {
        throw new Error('Failed to delete koi');
      }
      return id;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

const koiSlice = createSlice({
  name: 'koi',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<Record<string, string[]>>) => {
      state.filters = action.payload;
      // Apply filters to the koi list
      let filteredData = state.koiList;
      for (const key in state.filters) {
        if (state.filters[key].length > 0) {
          filteredData = filteredData.filter((item) =>
            state.filters[key].includes(item[key as keyof KoiInfo] as string)
          );
        }
      }
      state.filteredKoiList = filteredData;
    },
    resetFilters: (state) => {
      state.filters = {};
      state.filteredKoiList = state.koiList;
    },
    setSelectedKoi: (state, action: PayloadAction<KoiInfo | null>) => {
      state.selectedKoi = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {    // Fetch koi list
    builder
      .addCase(fetchKoiList.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchKoiList.fulfilled, (state, action) => {
        state.isLoading = false;
        state.koiList = action.payload;
        state.filteredKoiList = action.payload;
      })
      .addCase(fetchKoiList.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch unshipped koi
    builder
      .addCase(fetchUnshippedKoi.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUnshippedKoi.fulfilled, (state, action) => {
        state.isLoading = false;
        state.koiList = action.payload;
        state.filteredKoiList = action.payload;
      })
      .addCase(fetchUnshippedKoi.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Add koi
    builder
      .addCase(addKoi.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addKoi.fulfilled, (state, action) => {
        state.isLoading = false;
        state.koiList.push(action.payload);
        state.filteredKoiList.push(action.payload);
      })
      .addCase(addKoi.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update koi
    builder
      .addCase(updateKoi.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateKoi.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.koiList.findIndex(koi => koi.koi_id === action.payload.koi_id);
        if (index !== -1) {
          state.koiList[index] = action.payload;
        }
        const filteredIndex = state.filteredKoiList.findIndex(koi => koi.koi_id === action.payload.koi_id);
        if (filteredIndex !== -1) {
          state.filteredKoiList[filteredIndex] = action.payload;
        }
      })
      .addCase(updateKoi.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Delete koi
    builder
      .addCase(deleteKoi.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteKoi.fulfilled, (state, action) => {
        state.isLoading = false;
        state.koiList = state.koiList.filter(koi => koi.koi_id !== action.payload);
        state.filteredKoiList = state.filteredKoiList.filter(koi => koi.koi_id !== action.payload);
      })
      .addCase(deleteKoi.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setFilters, resetFilters, setSelectedKoi, clearError } = koiSlice.actions;
export default koiSlice.reducer;
