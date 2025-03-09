import {useState, useCallback, useRef, useEffect} from 'react';

/** Configuration options for the usePullToRefresh hook */
interface UsePullToRefreshOptions {
    /** The function to execute when pull-to-refresh is triggered */
    onRefresh: () => Promise<void>;
    /** Optional callback to reset any state after refresh completes */
    onReset?: () => void;
    onError?: (error: unknown) => void;
    refreshDelay?: number;
    shouldLogErrors?: boolean;
}

/** Return type for the usePullToRefresh hook */
interface UsePullToRefreshResult {
    isRefreshing: boolean;
    handleRefresh: () => Promise<void>;
    stopRefresh: () => void;
}

/** Default options for the hook */
const DEFAULT_OPTIONS = {
    refreshDelay: 1000,
    shouldLogErrors: process.env.NODE_ENV === 'development',
};

/**
 * A hook that handles pull-to-refresh functionality in React Native.
 * Provides smooth refresh experience with minimum duration to prevent flickering.
 *
 * Features:
 * - Prevents multiple simultaneous refreshes
 * - Type-safe implementation
 * - Optional reset callback
 * - Automatic error handling with custom error callback
 * - Configurable minimum refresh duration
 * - Manual refresh control
 * - Cleanup on unmount
 *
 * Usage:
 *
 * ```ts
 * const { isRefreshing, handleRefresh } = usePullToRefresh({
 *   onRefresh: async () => {
 *     const data = await api.getData();
 *     setItems(data);
 *   },
 *   onError: (error) => {
 *     showErrorToast('Failed to refresh data');
 *   },
 *   refreshDelay: 1000
 * });
 *
 * <ScrollView
 *   refreshControl={
 *     <RefreshControl
 *       refreshing={isRefreshing}
 *       onRefresh={handleRefresh}
 *       colors={["#3B82F6"]}
 *     />
 *   }
 * >
 *   {items.map(item => (
 *     <Item key={item.id} {...item} />
 *   ))}
 * </ScrollView>
 * ```
 */
export const usePullToRefresh = ({
                                     onRefresh,
                                     onReset,
                                     onError,
                                     refreshDelay = DEFAULT_OPTIONS.refreshDelay,
                                     shouldLogErrors = DEFAULT_OPTIONS.shouldLogErrors,
                                 }: UsePullToRefreshOptions): UsePullToRefreshResult => {
    const [isRefreshing, setIsRefreshing] = useState(false);
    const timeoutRef = useRef<NodeJS.Timeout>();
    const isMounted = useRef(true);

    //Prevent memory leaks and state updates after unmount
    useEffect(() => {
        return () => {
            isMounted.current = false;
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    /** Safely updates the refreshing state only if component is mounted */
    const safeSetIsRefreshing = useCallback((value: boolean) => {
        if (isMounted.current) {
            setIsRefreshing(value);
        }
    }, []);

    /** Manually stop the refresh state */
    const stopRefresh = useCallback(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        safeSetIsRefreshing(false);
    }, [safeSetIsRefreshing]);

    /** Handles the pull-to-refresh action with proper loading states and timing */
    const handleRefresh = useCallback(async () => {
        if (isRefreshing) return;

        safeSetIsRefreshing(true);
        const startTime = Date.now();

        try {
            await onRefresh();

            if (onReset) {
                onReset();
            }
        } catch (error) {
            if (shouldLogErrors) {
                console.error('Error during refresh:', error);
            }
            onError?.(error);
        } finally {
            const elapsedTime = Date.now() - startTime;
            const remainingDelay = Math.max(0, refreshDelay - elapsedTime);
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
            timeoutRef.current = setTimeout(() => {
                safeSetIsRefreshing(false);
            }, remainingDelay);
        }
    }, [
        isRefreshing,
        onRefresh,
        onReset,
        onError,
        refreshDelay,
        shouldLogErrors,
        safeSetIsRefreshing
    ]);

    return {
        isRefreshing,
        handleRefresh,
        stopRefresh,
    };
}; 