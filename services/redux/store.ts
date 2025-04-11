import { configureStore } from '@reduxjs/toolkit';
import jobReducer from './slices/jobStateSlice'; // Import the job reducer

export const store = configureStore({
    reducer: {
        job: jobReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;

export default store;
