// Custom hook to migrate from loading context to Redux gradually
'use client';

import { useAppDispatch, useAppSelector } from '@/store';
import { setLoading } from '@/store/slices/uiSlice';

export const useReduxLoading = () => {
  const dispatch = useAppDispatch();
  const isLoading = useAppSelector((state) => state.ui.isLoading);

  const setLoadingState = (loading: boolean) => {
    dispatch(setLoading(loading));
  };

  return {
    isLoading,
    setLoading: setLoadingState,
  };
};

// Export for backward compatibility with existing loading context
export const useLoading = useReduxLoading;
