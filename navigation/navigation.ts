import { NavigatorScreenParams } from '@react-navigation/native';

export type RootStackParamList = {
    //Auth: undefined;
    Auth: NavigatorScreenParams<AuthStackParamList>;
    Main: NavigatorScreenParams<MainTabParamList>;
    DiscordAuth: { code: string; state?: string; codeVerifier: string | undefined} | undefined;
};

export type AuthStackParamList = {
    Login: undefined;
    Register: undefined;
    DiscordAuth: { code: string; state?: string; codeVerifier: string | undefined} | undefined;
};

export type MainTabParamList = {
    Portfolio: undefined;
    Trade: undefined;
    Automated: undefined;
    Settings: undefined;
};

export type MarketStackParamList = {
    MarketMain: undefined;
    CoinDetail: { symbol: string };
    AllTokens: { category: string };
};

export type HealthStackParamList = {
    HealthMain: undefined;
};

export type HomeStackParamList = {
    HomeMain: undefined;
    Notifications: undefined;
    Profile: NavigatorScreenParams<ProfileStackParamList>;
};

export type ProfileStackParamList = {
    ProfileMain: undefined;
    AccountLimits: undefined;
    ExchangeAccount: {
        accountId: string;
    };
    AddExchange: undefined;
    SettingsStack: NavigatorScreenParams<SettingsStackParamList>;
};

export type SettingsStackParamList = {
    Settings: undefined;
    AccountLimits: undefined;
    AccountSettings: undefined;
    Security: undefined;
    APISettings: undefined;
    Notifications: undefined;
    PersonalInfo: undefined;
}; 