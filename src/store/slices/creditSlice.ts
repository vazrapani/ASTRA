import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface CreditSystem {
  readingCost: {
    singleCard: number;
    threeCards: number;
    fiveCards: number;
    celticCross: number;
  };
  adReward: {
    shortAd: number;
    longAd: number;
  };
}

interface CreditState {
  balance: number;
  system: CreditSystem;
  isLoading: boolean;
  error: string | null;
}

const initialState: CreditState = {
  balance: 0,
  system: {
    readingCost: {
      singleCard: 1,
      threeCards: 3,
      fiveCards: 5,
      celticCross: 10,
    },
    adReward: {
      shortAd: 1,
      longAd: 3,
    },
  },
  isLoading: false,
  error: null,
};

const creditSlice = createSlice({
  name: 'credit',
  initialState,
  reducers: {
    setBalance: (state, action: PayloadAction<number>) => {
      state.balance = action.payload;
    },
    addCredits: (state, action: PayloadAction<number>) => {
      state.balance += action.payload;
    },
    deductCredits: (state, action: PayloadAction<number>) => {
      state.balance -= action.payload;
    },
    updateSystem: (state, action: PayloadAction<CreditSystem>) => {
      state.system = action.payload;
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
  setBalance,
  addCredits,
  deductCredits,
  updateSystem,
  setLoading,
  setError,
} = creditSlice.actions;

export default creditSlice.reducer; 