import { NavigatorScreenParams } from '@react-navigation/native';

export type RootStackParamList = {
    Auth: undefined;
    Main: NavigatorScreenParams<MainTabParamList>;
    Jobs: undefined;
    JobDetails: { jobId: string };
};

export type AuthStackParamList = {
    Login: undefined;
    Register: undefined;
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


export type ProfileStackParamList = {
    ProfileMain: undefined;
    AccountLimits: undefined;
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