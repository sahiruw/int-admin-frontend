import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Location } from '@/types/koi';

interface ShippingLocationsState {
  locations: Location[];
  isLoading: boolean;
  error: string | null;
  selectedLocation: Location | null;
}

const initialState: ShippingLocationsState = {
  locations: [],
  isLoading: false,
  error: null,
  selectedLocation: null,
};

// Async thunks
export const fetchShippingLocations = createAsyncThunk(
  'shippingLocations/fetchShippingLocations',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/shipping-locations');
      if (!response.ok) {
        throw new Error('Failed to fetch shipping locations');
      }
      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

export const addShippingLocation = createAsyncThunk(
  'shippingLocations/addShippingLocation',
  async (locationData: Omit<Location, 'id'>, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/shipping-locations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ payload: locationData }),
      });
      if (!response.ok) {
        throw new Error('Failed to add shipping location');
      }
      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

export const updateShippingLocation = createAsyncThunk(
  'shippingLocations/updateShippingLocation',
  async ({ id, data }: { id: number; data: Partial<Location> }, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/shipping-locations', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ payload: { id, ...data } }),
      });
      if (!response.ok) {
        throw new Error('Failed to update shipping location');
      }
      const updatedData = await response.json();
      return updatedData;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

export const deleteShippingLocation = createAsyncThunk(
  'shippingLocations/deleteShippingLocation',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/shipping-locations', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ payload: { id } }),
      });
      if (!response.ok) {
        throw new Error('Failed to delete shipping location');
      }
      return id;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

const shippingLocationsSlice = createSlice({
  name: 'shippingLocations',
  initialState,
  reducers: {
    setSelectedLocation: (state, action: PayloadAction<Location | null>) => {
      state.selectedLocation = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch shipping locations
    builder
      .addCase(fetchShippingLocations.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchShippingLocations.fulfilled, (state, action) => {
        state.isLoading = false;
        state.locations = action.payload;
      })
      .addCase(fetchShippingLocations.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Add shipping location
    builder
      .addCase(addShippingLocation.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addShippingLocation.fulfilled, (state, action) => {
        state.isLoading = false;
        state.locations.push(action.payload);
      })
      .addCase(addShippingLocation.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update shipping location
    builder
      .addCase(updateShippingLocation.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateShippingLocation.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.locations.findIndex(location => location.id === action.payload.id);
        if (index !== -1) {
          state.locations[index] = action.payload;
        }
      })
      .addCase(updateShippingLocation.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Delete shipping location
    builder
      .addCase(deleteShippingLocation.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteShippingLocation.fulfilled, (state, action) => {
        state.isLoading = false;
        state.locations = state.locations.filter(location => location.id !== action.payload);
      })
      .addCase(deleteShippingLocation.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setSelectedLocation, clearError } = shippingLocationsSlice.actions;
export default shippingLocationsSlice.reducer;
