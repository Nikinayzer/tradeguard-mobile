import apiClient from './client';
import {API_ENDPOINTS} from '@/config/api';

export type JobStrategy = 'DCA' | 'LIQ';
export type JobStatus = 'CREATED' | 'PAUSED' | 'IN_PROGRESS' | 'CANCELED' | 'FINISHED';
export type JobSide = 'BUY' | 'SELL' | 'BOTH' ; //todo both or not to both

interface BaseJobParams {
    amount: number;
    coins: string[];
    side: JobSide;
    totalSteps: number;
    durationMinutes: number;
    discountPct: number;
}

export interface DCAJobParams extends BaseJobParams {
}

export interface LIQJobParams extends BaseJobParams {
}

export type JobParams = DCAJobParams | LIQJobParams;

export interface Job {
    id: string;
    jobId: number;
    strategy: JobStrategy;
    status: JobStatus;
    stepsDone: number;
    coins: string[];
    side: JobSide;
    discountPct: number;
    amount: number;
    stepsTotal: number;
    durationMinutes: number;
    params: JobParams;
    createdAt: string;
    updatedAt: string;
}

export interface JobEvent {
    id: number;
    jobId: number;
    eventType: "CREATED" | "PAUSED" | "RESUMED" | "STEP_DONE" | "CANCELED_ORDERS" | "STOPPED" | "FINISHED";
    stepsDone: number;
    durationMinutes: number;
    timestamp: string;
}

export const autoService = {
    createDCAJob: async (params: DCAJobParams): Promise<Job> => {
        console.log("SENDING DCA REQUEST")
        console.log(params)
        const response = await apiClient.post(
            `${API_ENDPOINTS.auto.createDCA}`,
            params
        );
        return response.data;
    },
    createLIQJob: async (params: LIQJobParams): Promise<Job> => {
        console.log("SENDING LIQ REQUEST")
        console.log(params)
        const response = await apiClient.post(
            `${API_ENDPOINTS.auto.createLIQ}`,
            params
        );
        return response.data;
    },
    getAllJobs: async (): Promise<Job[]> => {
        const response = await apiClient.get(
            `${API_ENDPOINTS.auto.getAll}`
        );
        return response.data;
    },
    getAllActiveJobs: async (): Promise<Job[]> => {
        const response = await apiClient.get(
            `${API_ENDPOINTS.auto.getAllActive}`
        );
        return response.data;
    },
    getJob: async (id: string): Promise<Job> => {
        const response = await apiClient.get(
            `${API_ENDPOINTS.auto.getById(id)}`
        );
        return response.data;
    },
    getJobEvents: async (id: string): Promise<JobEvent[]> => {
        const response = await apiClient.get(
            `${API_ENDPOINTS.auto.getJobEventsById(id)}`
        )
        return response.data;
    },
    pauseJob: async (id: string): Promise<Job> => {
        const response = await apiClient.post(
            `${API_ENDPOINTS.auto.pause(id)}`
        );
        return response.data;
    },
    resumeJob: async (id: string): Promise<Job> => {
        const response = await apiClient.post(
            `${API_ENDPOINTS.auto.resume(id)}`
        );
        return response.data;
    },
    cancelJob: async (id: string): Promise<Job> => {
        const response = await apiClient.post(
            `${API_ENDPOINTS.auto.cancel(id)}`
        );
        return response.data;
    }
}; 