import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Reading } from '../../types';
import { getReadings, getReading, addReading, updateReading, deleteReading } from '../../services/firebase/readingService';

interface ReadingState {
  readings: Reading[];
  currentReading: Reading | null;
  loading: boolean;
  error: string | null;
  filter: {
    period: string;
    category: string;
  };
  search: string;
}

const initialState: ReadingState = {
  readings: [],
  currentReading: null,
  loading: false,
  error: null,
  filter: { period: '전체', category: '전체' },
  search: '',
};

export const fetchReadings = createAsyncThunk(
  'reading/fetchReadings',
  async (userId: string) => {
    return await getReadings(userId);
  }
);

export const fetchReading = createAsyncThunk(
  'reading/fetchReading',
  async ({ userId, readingId }: { userId: string; readingId: string }) => {
    return await getReading(userId, readingId);
  }
);

const readingSlice = createSlice({
  name: 'reading',
  initialState,
  reducers: {
    setFilter(state, action: PayloadAction<{ period: string; category: string }>) {
      state.filter = action.payload;
    },
    setSearch(state, action: PayloadAction<string>) {
      state.search = action.payload;
    },
    clearCurrentReading(state) {
      state.currentReading = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchReadings.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReadings.fulfilled, (state, action) => {
        state.readings = action.payload;
        state.loading = false;
      })
      .addCase(fetchReadings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || '불러오기 실패';
      })
      .addCase(fetchReading.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReading.fulfilled, (state, action) => {
        state.currentReading = action.payload;
        state.loading = false;
      })
      .addCase(fetchReading.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || '불러오기 실패';
      });
  },
});

export const { setFilter, setSearch, clearCurrentReading } = readingSlice.actions;
export default readingSlice.reducer; 