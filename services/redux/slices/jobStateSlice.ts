import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {Coin} from '@/services/MarketDataManager';
import {JobStrategy, JobParams} from '@/services/api/auto';

interface JobState {
    jobType: JobStrategy;
    jobParams: JobParams;
    selectedCoins: Coin[]; //todo refactor to string[]
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
                    amount: 100,
                    side: 'BUY',
                    coins: [],
                    totalSteps: 10,
                    discountPct: 0.5,
                    durationMinutes: 60,

                };
            } else if (action.payload === 'LIQ') {
                state.jobParams = {
                    amount: 10.0,
                    side: 'SELL',
                    coins: [],
                    totalSteps: 10,
                    discountPct: 0.5,
                    durationMinutes: 60,
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

export const {setJobType, setJobParams, setSelectedCoins} = jobSlice.actions;

export default jobSlice.reducer;
