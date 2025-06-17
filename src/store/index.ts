import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import koiReducer from './slices/koiSlice';
import breedersReducer from './slices/breedersSlice';
import customersReducer from './slices/customersSlice';
import varietiesReducer from './slices/varietiesSlice';
import shippingLocationsReducer from './slices/shippingLocationsSlice';
import configurationReducer from './slices/configurationSlice';
import uiReducer from './slices/uiSlice';
import reportsReducer from './slices/reportsSlice';
import boxSizesReducer from './slices/boxSizesSlice';
import shippingReducer from './slices/shippingSlice';
import invoiceReducer from './slices/invoiceSlice';

export const store = configureStore({
  reducer: {
    koi: koiReducer,
    breeders: breedersReducer,
    customers: customersReducer,
    varieties: varietiesReducer,
    shippingLocations: shippingLocationsReducer,
    configuration: configurationReducer,
    ui: uiReducer,    reports: reportsReducer,
    boxSizes: boxSizesReducer,
    shipping: shippingReducer,
    invoice: invoiceReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Typed hooks
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
