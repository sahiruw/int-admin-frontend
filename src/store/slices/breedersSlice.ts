import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Breeder } from '@/types/koi';

interface BreedersState {
  breeders: Breeder[];
  isLoading: boolean;
  error: string | null;
  selectedBreeder: Breeder | null;
}

const initialState: BreedersState = {
  breeders: [],
  isLoading: false,
  error: null,
  selectedBreeder: null,
};

// Async thunks
export const fetchBreeders = createAsyncThunk(
  'breeders/fetchBreeders',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/breeders');
      if (!response.ok) {
        throw new Error('Failed to fetch breeders');
      }
      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

export const addBreeder = createAsyncThunk(
  'breeders/addBreeder',
  async (breederData: Omit<Breeder, 'id'>, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/breeders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ payload: breederData }),
      });
      if (!response.ok) {
        throw new Error('Failed to add breeder');
      }
      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

export const updateBreeder = createAsyncThunk(
  'breeders/updateBreeder',
  async ({ id, data }: { id: number; data: Partial<Breeder> }, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/breeders', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ payload: { id, ...data } }),
      });
      if (!response.ok) {
        throw new Error('Failed to update breeder');
      }
      const updatedData = await response.json();
      return updatedData;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

export const deleteBreeder = createAsyncThunk(
  'breeders/deleteBreeder',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/breeders', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ payload: { id } }),
      });
      if (!response.ok) {
        throw new Error('Failed to delete breeder');
      }
      return id;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

const breedersSlice = createSlice({
  name: 'breeders',
  initialState,
  reducers: {
    setSelectedBreeder: (state, action: PayloadAction<Breeder | null>) => {
      state.selectedBreeder = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch breeders
    builder
      .addCase(fetchBreeders.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBreeders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.breeders = action.payload;
      })
      .addCase(fetchBreeders.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Add breeder
    builder
      .addCase(addBreeder.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addBreeder.fulfilled, (state, action) => {
        state.isLoading = false;
        state.breeders.push(action.payload);
      })
      .addCase(addBreeder.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update breeder
    builder
      .addCase(updateBreeder.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateBreeder.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.breeders.findIndex(breeder => breeder.id === action.payload.id);
        if (index !== -1) {
          state.breeders[index] = action.payload;
        }
      })
      .addCase(updateBreeder.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Delete breeder
    builder
      .addCase(deleteBreeder.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteBreeder.fulfilled, (state, action) => {
        state.isLoading = false;
        state.breeders = state.breeders.filter(breeder => breeder.id !== action.payload);
      })
      .addCase(deleteBreeder.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setSelectedBreeder, clearError } = breedersSlice.actions;
export default breedersSlice.reducer;
