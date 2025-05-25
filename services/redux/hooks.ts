import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from './store';
import { PositionsState } from './slices/positionsSlice';
import { EquityState } from './slices/equitySlice';
import { RiskState } from './slices/riskSlice';
import { ActiveJobsState } from './slices/activeJobsSlice';
import { useState, useEffect } from 'react';
import { autoService, Job } from '@/services/api';

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export const usePositions = (): PositionsState => {
  return useAppSelector((state) => state.positions);
};

export const useEquity = (): EquityState => {
  return useAppSelector((state) => state.equity);
};

export const useRisk = (): RiskState => {
  return useAppSelector((state) => state.risk);
};

export const useActiveJobs = (): ActiveJobsState => {
  return useAppSelector((state) => state.activeJobs);
};

export const useJob = (jobId?: string | number) => {
  const dispatch = useAppDispatch();
  const { jobs } = useActiveJobs();
  const [job, setJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!jobId) return;

    // First check if the job is in active jobs state
    const activeJob = jobs.find(j => j.id.toString() === jobId.toString());
    if (activeJob) {
      setJob(activeJob);
      return;
    }

    // If not, fetch
    const fetchJob = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const fetchedJob = await autoService.getJob(jobId.toString());
        if (fetchedJob) {
          setJob(fetchedJob);
        }
      } catch (err) {
        console.error('Error fetching job:', err);
        setError('Failed to load job details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchJob();
  }, [jobId, jobs]);

  return {
    job,
    isLoading,
    error,
    isActive: job?.status === 'IN_PROGRESS',
    isPaused: job?.status === 'PAUSED',
    isFinished: job?.status === 'FINISHED' || job?.status === 'CANCELED',
  };
};

export const useActivePositions = () => {
  return useAppSelector((state) => state.positions.activePositions);
};

export const useVenueEquities = () => {
  return useAppSelector((state) => state.equity.venueEquities);
}; 