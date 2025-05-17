const apiUrl = process.env.EXPO_PUBLIC_API_URL;

export const API_CONFIG = {
    development: {
        host: apiUrl,
        timeout: 10000,
    },
    production: {
        host: 'tradeguardblahblahblah:8080/api',
        timeout: 10000,
    },
};

export const API_ENDPOINTS = {
    auth: {
        login: '/auth/login',
        register: '/auth/register',
        logout: '/auth/logout',
        discord: '/auth/discord/exchange',
    },
    profile: {
        getMe: '/users/me',
        updateMe: '/users/me',
        getExchangeAccount: (id: string) => `/users/me/exchange-accounts/${id}`,
        updateExchangeAccount: (id: string) => `/users/me/exchange-accounts/${id}/update`,
        addExchangeAccount: '/users/me/exchange-accounts/add',
        deleteExchangeAccount: (id: string) => `/users/me/exchange-accounts/${id}/delete`,
        getLimits: '/users/me/limits',
        updateLimits: '/users/me/limits',
        getNotifications: '/users/me/notifications',
        markAsReadNotification: (id: string) => `/users/me/notifications/${id}/read`,
    },
    market: {
        getCategories: '/market/categories',
        getAll: '/market/all',
        getTokens: (symbols: string[]) => `/market/tokens?symbols=${symbols.join(',')}`,
    },
    portfolio: {
        getPortfolio: '/portfolio',
        getPositions: '/portfolio/positions',
        getHistory: '/portfolio/history',
    },
    auto: {
        createDCA: '/jobs/dca',
        createLIQ: '/jobs/liq',
        getAll: '/users/jobs',
        getAllActive: 'users/jobs/active',
        getById: (id: string) => `/jobs/${id}`,
        getJobEventsById: (id: string) => `/jobs/${id}/events`,
        pause: (id: string) => `/jobs/${id}/pause`,
        stop: (id: string) => `/jobs/${id}/stop`,
        resume: (id: string) => `/jobs/${id}/resume`,
        cancel: (id: string) => `/jobs/${id}/cancel`,
    },
    settings: {
        getSettings: '/settings',
        updateSettings: '/settings',
        updateNotifications: '/settings/notifications',
    },
    events: {
        stream: '/events/stream',
    },
} as const;