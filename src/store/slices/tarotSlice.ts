import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface TarotCard {
  id: number;
  name: string;
  imageUrl: string;
  meaning: string;
  reversedMeaning: string;
}

interface DailyTarotResult {
  card: {
    name: string;
    meaning: string;
  };
  date: Date;
}

interface DailyTarotStatus {
  isDailyAvailable: boolean;
  result: DailyTarotResult | null;
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
  question: string;
  category: string;
  spread: string; // 예: 'one', 'three', 'five', 'celtic'
  interpretation: string;
  dailyTarotStatus: DailyTarotStatus;
}

const initialState: TarotState = {
  selectedCards: [],
  readings: [],
  isLoading: false,
  error: null,
  question: '',
  category: '',
  spread: 'three',
  interpretation: '',
  dailyTarotStatus: {
    isDailyAvailable: true,
    result: null
  }
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
    setQuestion: (state, action: PayloadAction<string>) => {
      state.question = action.payload;
    },
    setCategory: (state, action: PayloadAction<string>) => {
      state.category = action.payload;
    },
    setSpread: (state, action: PayloadAction<string>) => {
      state.spread = action.payload;
    },
    setInterpretation: (state, action: PayloadAction<string>) => {
      state.interpretation = action.payload;
    },
    setDailyTarotResult: (state, action: PayloadAction<DailyTarotStatus>) => {
      state.dailyTarotStatus = action.payload;
    },
  },
});

export const {
  selectCard,
  clearSelectedCards,
  saveReading,
  setLoading,
  setError,
  setQuestion,
  setCategory,
  setSpread,
  setInterpretation,
  setDailyTarotResult,
} = tarotSlice.actions;

export default tarotSlice.reducer; 