import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Portfolio {
  id: number;
  name: string;
  created_at: string;
}

interface PortfolioState {
  list: Portfolio[];
}

const initialState: PortfolioState = {
  list: []
};

const portfolioSlice = createSlice({
  name: 'portfolio',
  initialState,
  reducers: {
    setPortfolios(state, action: PayloadAction<Portfolio[]>) {
      state.list = action.payload;
    }
  }
});

export const { setPortfolios } = portfolioSlice.actions;
export default portfolioSlice.reducer;
