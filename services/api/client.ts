import axios, {AxiosResponse, InternalAxiosRequestConfig} from 'axios';
import {secureStorage} from '@/services/storage/secureStorage';
import {API_CONFIG} from "@/config/api";
import { Platform } from 'react-native';

export interface ApiResponse<T = any> {
    data: T;
    status: number;
    message?: string;
}

const currentConfig = API_CONFIG.development;

const apiClient = axios.create({
    baseURL: currentConfig.host,
    timeout: currentConfig.timeout,
    headers: {
        'Content-Type': 'application/json',
    },
});

/**
 * Interceptor to add JWT to every request
 */
apiClient.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
        const token = await secureStorage.getToken();
        if (token) {
            config.headers['X-Platform-Type'] = Platform.OS;
            config.headers['X-Platform-Version'] = Platform.Version?.toString();
            // config.headers['X-App-Version'] = Constants.expoConfig?.version;
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);
/**
 * Interceptor to handle 401 response, which probably would mean JWT is expired
 */
apiClient.interceptors.response.use(
    (response: AxiosResponse) => response,
    async (error) => {
        if (error.response?.status === 401) {
            if (error.response.data.reason =="token_expired"){
                await secureStorage.removeToken(); //todo refactor
            }
        }
        return Promise.reject(error);
    }
);
/**
 * Wrapper around axios to handle API responses and errors.
 * Not used right now, but /todo implement this in the future
 * @param config Axios request config
 */
export const createApiRequest = async <T>(
    config: InternalAxiosRequestConfig
): Promise<ApiResponse<T>> => {
    try {
        const response: AxiosResponse<ApiResponse<T>> = await apiClient(config);
        return response.data;
    } catch (error: any) {
        throw {
            message: error.response?.data?.message || 'An error occurred',
            status: error.response?.status || 500,
            errors: error.response?.data?.errors,
        };
    }
};
export default apiClient; 