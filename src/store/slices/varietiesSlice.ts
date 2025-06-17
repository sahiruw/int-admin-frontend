import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Varity } from '@/types/koi';

interface VarietiesState {
  varieties: Varity[];
  isLoading: boolean;
  error: string | null;
  selectedVariety: Varity | null;
}

const initialState: VarietiesState = {
  varieties: [],
  isLoading: false,
  error: null,
  selectedVariety: null,
};

// Async thunks
export const fetchVarieties = createAsyncThunk(
  'varieties/fetchVarieties',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/varieties');
      if (!response.ok) {
        throw new Error('Failed to fetch varieties');
      }
      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

export const addVariety = createAsyncThunk(
  'varieties/addVariety',
  async (varietyData: Omit<Varity, 'id'>, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/varieties', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ payload: varietyData }),
      });
      if (!response.ok) {
        throw new Error('Failed to add variety');
      }
      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

export const updateVariety = createAsyncThunk(
  'varieties/updateVariety',
  async ({ id, data }: { id: number; data: Partial<Varity> }, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/varieties', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ payload: { id, ...data } }),
      });
      if (!response.ok) {
        throw new Error('Failed to update variety');
      }
      const updatedData = await response.json();
      return updatedData;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

export const deleteVariety = createAsyncThunk(
  'varieties/deleteVariety',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/varieties', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ payload: { id } }),
      });
      if (!response.ok) {
        throw new Error('Failed to delete variety');
      }
      return id;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

const varietiesSlice = createSlice({
  name: 'varieties',
  initialState,
  reducers: {
    setSelectedVariety: (state, action: PayloadAction<Varity | null>) => {
      state.selectedVariety = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch varieties
    builder
      .addCase(fetchVarieties.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchVarieties.fulfilled, (state, action) => {
        state.isLoading = false;
        state.varieties = action.payload;
      })
      .addCase(fetchVarieties.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Add variety
    builder
      .addCase(addVariety.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addVariety.fulfilled, (state, action) => {
        state.isLoading = false;
        state.varieties.push(action.payload);
      })
      .addCase(addVariety.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update variety
    builder
      .addCase(updateVariety.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateVariety.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.varieties.findIndex(variety => variety.id === action.payload.id);
        if (index !== -1) {
          state.varieties[index] = action.payload;
        }
      })
      .addCase(updateVariety.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Delete variety
    builder
      .addCase(deleteVariety.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteVariety.fulfilled, (state, action) => {
        state.isLoading = false;
        state.varieties = state.varieties.filter(variety => variety.id !== action.payload);
      })
      .addCase(deleteVariety.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setSelectedVariety, clearError } = varietiesSlice.actions;
export default varietiesSlice.reducer;
