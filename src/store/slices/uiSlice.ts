import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UIState {
  isLoading: boolean;
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  expandedSections: string[];
  theme: 'light' | 'dark';
  isMobile: boolean;
}

const initialState: UIState = {
  isLoading: false,
  sidebarOpen: true,
  sidebarCollapsed: false,
  expandedSections: [
    'KOI MANAGEMENT',
    'REPORTS & ANALYTICS',
    'MASTER DATA',
    'ADMIN PANEL'
  ],
  theme: 'light',
  isMobile: false,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarCollapsed: (state, action: PayloadAction<boolean>) => {
      state.sidebarCollapsed = action.payload;
    },
    toggleSidebarCollapsed: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
    toggleSection: (state, action: PayloadAction<string>) => {
      const sectionLabel = action.payload;
      if (state.expandedSections.includes(sectionLabel)) {
        state.expandedSections = state.expandedSections.filter(
          (section) => section !== sectionLabel
        );
      } else {
        state.expandedSections.push(sectionLabel);
      }
    },
    setExpandedSections: (state, action: PayloadAction<string[]>) => {
      state.expandedSections = action.payload;
    },
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload;
    },
    setIsMobile: (state, action: PayloadAction<boolean>) => {
      state.isMobile = action.payload;
    },
  },
});

export const {
  setLoading,
  setSidebarOpen,
  toggleSidebar,
  setSidebarCollapsed,
  toggleSidebarCollapsed,
  toggleSection,
  setExpandedSections,
  setTheme,
  setIsMobile,
} = uiSlice.actions;

export default uiSlice.reducer;
