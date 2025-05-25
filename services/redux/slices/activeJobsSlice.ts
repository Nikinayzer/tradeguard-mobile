import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Job } from '@/services/api/auto';

export interface ActiveJobsState {
    jobs: Job[];
    lastUpdated: number | null;
}

const initialState: ActiveJobsState = {
    jobs: [],
    lastUpdated: null,
};

const activeJobsSlice = createSlice({
    name: 'activeJobs',
    initialState,
    reducers: {
        updateActiveJobs: (state, action: PayloadAction<Job[]>) => {
            state.jobs = action.payload;
            state.lastUpdated = Date.now();
        },
    },
});

export const { updateActiveJobs } = activeJobsSlice.actions;
export default activeJobsSlice.reducer; 