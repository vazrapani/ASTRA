import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface TarotCard {
  id: number;
  name: string;
  imageUrl: string;
  meaning: string;
  reversedMeaning: string;
}

interface TarotReading {
  id: string;
  type: 'daily' | 'weekly' | 'love' | 'career';
  cards: TarotCard[];
  date: string;
  interpretation: string;
}

interface TarotState {
  selectedCards: TarotCard[];
  readings: TarotReading[];
  isLoading: boolean;
  error: string | null;
}

const initialState: TarotState = {
  selectedCards: [],
  readings: [],
  isLoading: false,
  error: null,
};

const tarotSlice = createSlice({
  name: 'tarot',
  initialState,
  reducers: {
    selectCard: (state, action: PayloadAction<TarotCard>) => {
      if (state.selectedCards.length < 3) {
        state.selectedCards.push(action.payload);
      }
    },
    clearSelectedCards: (state) => {
      state.selectedCards = [];
    },
    saveReading: (state, action: PayloadAction<TarotReading>) => {
      state.readings.push(action.payload);
      state.selectedCards = [];
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  selectCard,
  clearSelectedCards,
  saveReading,
  setLoading,
  setError,
} = tarotSlice.actions;

export default tarotSlice.reducer; 