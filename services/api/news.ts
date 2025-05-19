import apiClient from './client';
import {API_ENDPOINTS} from '@/config/api';

export interface NewsSource {
    title: string;
    region: string;
    domain: string;
    path: string | null;
    type: string;
}

export interface NewsCurrency {
    code: string;
    title: string;
    slug: string;
    url: string;
}

export interface NewsVotes {
    negative: number;
    positive: number;
    important: number;
    liked: number;
    disliked: number;
    lol: number;
    toxic: number;
    saved: number;
    comments: number;
}

export interface NewsItem {
    kind: string;
    domain: string;
    source: NewsSource;
    title: string;
    published_at: string;
    slug: string;
    currencies: NewsCurrency[];
    id: number;
    url: string;
    created_at: string;
    votes: NewsVotes;
}

export interface NewsResponse {
    count: number;
    results: NewsItem[];
}

export const newsService = {
    getNews: async (page: number): Promise<NewsResponse> => {
        const response = await apiClient.get<NewsResponse>(API_ENDPOINTS.news.getNews(page));
        return response.data;
    },

    getNewsForCoin: async (coin: string, page: number): Promise<NewsResponse> => {
        const response = await apiClient.get<NewsResponse>(API_ENDPOINTS.news.getNewsForCoin(coin, page));
        return response.data;
    },
};
