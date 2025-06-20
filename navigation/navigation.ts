import { NavigatorScreenParams } from '@react-navigation/native';

export type RootStackParamList = {
    //Auth: undefined;
    Auth: NavigatorScreenParams<AuthStackParamList>;
    Main: NavigatorScreenParams<MainTabParamList>;
    DiscordAuth: { code: string; state?: string; codeVerifier: string | undefined} | undefined;
};

export type AuthStackParamList = {
    Login: {
        autoLogin?: {
            username: string;
            password: string;
        }
    };
    Register: undefined;
    TwoFactor: {
        code: string,
        name: string;
        email: string;
    };
    DiscordAuth: { code: string; state?: string; codeVerifier: string | undefined} | undefined;
};

export type MainTabParamList = {
    Home: NavigatorScreenParams<HomeStackParamList>;
    Market: NavigatorScreenParams<MarketStackParamList>;
    Auto: NavigatorScreenParams<AutoStackParamList>;
    Portfolio: NavigatorScreenParams<PortfolioStackParamList>;
    Health: NavigatorScreenParams<HealthStackParamList>;
    Profile: NavigatorScreenParams<ProfileStackParamList>;
};

export type MarketStackParamList = {
    MarketMain: undefined;
    CoinDetail: { symbol: string };
    AllTokens: { category: string };
    News: { initialPage: number; coin?: string };
};

export type AutoStackParamList = {
    AutoMain: undefined;
    JobDetail: { id: string };
    JobList: undefined;
    CoinSelector: undefined;
    AutoFAQ: undefined;
};

export type HealthStackParamList = {
    HealthMain: undefined;
    PatternDetail: {
        patternId: string;
        isComposite: boolean;
        riskStateSnapshot?: any;
    };
    HealthFAQ: undefined;
};

export type HomeStackParamList = {
    HomeMain: undefined;
    Notifications: undefined;
    News: { initialPage: number; coin?: string };
};

export type PortfolioStackParamList = {
    PortfolioMain: undefined;
    AllPositions: { type: 'active' | 'closed' };
};

export type ProfileStackParamList = {
    ProfileMain: undefined;
    AccountLimits: undefined;
    ExchangeAccount: { accountId: string };
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