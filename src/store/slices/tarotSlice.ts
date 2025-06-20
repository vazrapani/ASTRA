import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TarotCard, TarotReading } from '../../types/tarot';

interface DailyTarotStatus {
  lastReadDate?: string;
  result?: any;
  isDailyAvailable: boolean;
}

interface TarotState {
  selectedCards: TarotCard[];
  readings: TarotReading[];
  isLoading: boolean;
  error: string | null;
  question: string;
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
  spread: 'three',
  interpretation: '',
  dailyTarotStatus: {
    isDailyAvailable: true
  },
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
    setSpread: (state, action: PayloadAction<string>) => {
      state.spread = action.payload;
    },
    setInterpretation: (state, action: PayloadAction<string>) => {
      state.interpretation = action.payload;
    },
    setDailyTarotResult: (state, action: PayloadAction<{ isDailyAvailable: boolean; result?: any }>) => {
      state.dailyTarotStatus = {
        lastReadDate: new Date().toISOString().split('T')[0],
        isDailyAvailable: action.payload.isDailyAvailable,
        result: action.payload.result,
      };
    },
    resetTarot: (state) => {
      state.selectedCards = [];
      state.question = '';
      state.spread = 'three';
      state.interpretation = '';
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
  setSpread,
  setInterpretation,
  setDailyTarotResult,
  resetTarot,
} = tarotSlice.actions;

export default tarotSlice.reducer; 