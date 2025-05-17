import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import {authService, User, AuthState} from '@/services/auth/authService';

const initialState: AuthState = {
    isAuthenticated: false,
    isLoading: true,
    user: null
};

export const checkAuthStatus = createAsyncThunk(
    'auth/checkStatus',
    async () => {
        return await authService.checkAuthStatus();
    }
);

export const login = createAsyncThunk(
    'auth/login',
    async ({ token, userData }: { token: string; userData: User }) => {
        return await authService.login(token, userData);
    }
);

export const logout = createAsyncThunk(
    'auth/logout',
    async () => {
        await authService.logout();
        return null;
    }
);

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setLoading: (state, action) => {
            state.isLoading = action.payload;
        },
        clearAuth: (state) => {
            state.isAuthenticated = false;
            state.user = null;
            state.isLoading = false;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(checkAuthStatus.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(checkAuthStatus.fulfilled, (state, action) => {
                const newState = authService.getAuthState(action.payload);
                state.isLoading = newState.isLoading;
                state.isAuthenticated = newState.isAuthenticated;
                state.user = newState.user;
            })
            .addCase(checkAuthStatus.rejected, (state) => {
                state.isLoading = false;
                state.isAuthenticated = false;
                state.user = null;
            })
            .addCase(login.fulfilled, (state, action) => {
                const newState = authService.getAuthState(action.payload);
                state.isAuthenticated = newState.isAuthenticated;
                state.user = newState.user;
            })
            .addCase(logout.fulfilled, (state) => {
                state.isAuthenticated = false;
                state.user = null;
            });
    }
});

export const { setLoading, clearAuth } = authSlice.actions;
export default authSlice.reducer; 