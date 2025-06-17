import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

interface ConfigurationData {
  ex_rate: number;
  shipping_cost: number;
  commission: number;
}

interface ConfigurationState {
  configuration: ConfigurationData;
  isLoading: boolean;
  error: string | null;
}

const initialState: ConfigurationState = {
  configuration: {
    ex_rate: 0,
    shipping_cost: 0,
    commission: 0,
  },
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchConfiguration = createAsyncThunk(
  'configuration/fetchConfiguration',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/config');
      if (!response.ok) {
        throw new Error('Failed to fetch configuration');
      }
      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

export const updateConfiguration = createAsyncThunk(
  'configuration/updateConfiguration',
  async (configData: ConfigurationData, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/config', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(configData),
      });
      if (!response.ok) {
        throw new Error('Failed to update configuration');
      }
      const data = await response.json();
      return configData; // Return the submitted data since API might not return updated data
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

const configurationSlice = createSlice({
  name: 'configuration',
  initialState,
  reducers: {
    setConfiguration: (state, action: PayloadAction<ConfigurationData>) => {
      state.configuration = action.payload;
    },
    setExchangeRate: (state, action: PayloadAction<number>) => {
      state.configuration.ex_rate = action.payload;
    },
    setShippingCost: (state, action: PayloadAction<number>) => {
      state.configuration.shipping_cost = action.payload;
    },
    setCommission: (state, action: PayloadAction<number>) => {
      state.configuration.commission = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch configuration
    builder
      .addCase(fetchConfiguration.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchConfiguration.fulfilled, (state, action) => {
        state.isLoading = false;
        state.configuration = action.payload;
      })
      .addCase(fetchConfiguration.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update configuration
    builder
      .addCase(updateConfiguration.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateConfiguration.fulfilled, (state, action) => {
        state.isLoading = false;
        state.configuration = action.payload;
      })
      .addCase(updateConfiguration.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setConfiguration,
  setExchangeRate,
  setShippingCost,
  setCommission,
  clearError,
} = configurationSlice.actions;

export default configurationSlice.reducer;