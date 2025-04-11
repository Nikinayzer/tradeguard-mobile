import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Coin } from '@/services/MarketDataManager';
import { JobStrategy, JobParams, DCAJobParams, LIQJobParams } from '@/services/api/auto';

interface JobState {
    jobType: JobStrategy;
    jobParams: JobParams;
    selectedCoins: Coin[]; //todo refactor to string[]
}

const initialState: JobState = {
    jobType: 'DCA',
    jobParams: {
        coins: [],
        side: 'BUY',
        totalSteps: 10,
        discountPct: 0.5,
        durationMinutes: 60,
        amount: 100,
    },
    selectedCoins: [],
};

const jobSlice = createSlice({
    name: 'job',
    initialState,
    reducers: {
        setJobType: (state, action: PayloadAction<JobStrategy>) => {
            state.jobType = action.payload;
            if (action.payload === 'DCA') {
                state.jobParams = {
                    coins: [],
                    side: 'BUY',
                    totalSteps: 10,
                    discountPct: 0.5,
                    durationMinutes: 60,
                    amount: 100,
                };
            } else if (action.payload === 'LIQ') {
                state.jobParams = {
                    amount: 10,
                    coins: [],
                    side: 'SELL',
                    totalSteps: 10,
                    durationMinutes: 60,
                    discountPct: 0.5,
                };
            }
        },
        setJobParams: (state, action: PayloadAction<JobParams>) => {
            state.jobParams = action.payload;
        },
        setSelectedCoins: (state, action: PayloadAction<Coin[]>) => {
            state.selectedCoins = action.payload;
        },
    },
});

export const { setJobType, setJobParams, setSelectedCoins } = jobSlice.actions;

export default jobSlice.reducer;
