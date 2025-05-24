import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {JobStrategy, JobParams} from '@/services/api/auto';

interface JobState {
    jobType: JobStrategy;
    jobParams: JobParams;
    selectedCoins: string[];
}

const initialState: JobState = {
    jobType: 'DCA',
    jobParams: {
        amount: 100,
        side: 'BUY',
        coins: [],
        totalSteps: 10,
        discountPct: 0.5,
        durationMinutes: 60,
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
                    ...state.jobParams,
                    amount: 100,
                    side: 'BUY',
                    coins: [],
                };
            } else if (action.payload === 'LIQ') {
                state.jobParams = {
                    ...state.jobParams,
                    amount: 10.0,
                    side: 'SELL',
                    coins: [],
                };
            }
        },
        setJobParams: (state, action: PayloadAction<JobParams>) => {
            state.jobParams = action.payload;
        },
        setSelectedCoins: (state, action: PayloadAction<string[]>) => {
            state.selectedCoins = action.payload;
        },
        addCoin: (state, action: PayloadAction<string>) => {
            if (!state.selectedCoins.includes(action.payload)) {
                state.selectedCoins.push(action.payload);
            }
        },
        removeCoin: (state, action: PayloadAction<string>) => {
            state.selectedCoins = state.selectedCoins.filter(coin => coin !== action.payload);
        },
        clearSelectedCoins: (state) => {
            state.selectedCoins = [];
        },
    },
});

export const {
    setJobType,
    setJobParams,
    setSelectedCoins,
    addCoin,
    removeCoin,
    clearSelectedCoins,
} = jobSlice.actions;

export default jobSlice.reducer;
