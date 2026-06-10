import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { api } from '../services/api';
import type { FetchTasksParams } from '../services/api';

/**
 * Custom Query Key Factory
 * Best Practice: Centralize your query keys. This helps prevent typos 
 * when invalidating or prefetching queries across different components.
 */
export const taskKeys = {
  all: ['tasks'] as const,
  lists: () => [...taskKeys.all, 'list'] as const,
  list: (filters: FetchTasksParams) => [...taskKeys.lists(), filters] as const,
  details: () => [...taskKeys.all, 'detail'] as const,
  detail: (id: string) => [...taskKeys.details(), id] as const,
};

/**
 * useTasks Custom Hook
 * Wraps useQuery to decouple UI components from React Query details.
 * 
 * JUNIOR DEV TIP: 
 * - We pass query keys as a structured array `['tasks', 'list', filters]`.
 * - Whenever the filters (page, search, status) change, React Query 
 *   automatically triggers a refetch because the query key is a dependency array.
 */
export const useTasks = (filters: FetchTasksParams) => {
  return useQuery({
    // 1. Query Key: Defines the identity of the query in the cache
    queryKey: taskKeys.list(filters),

    // 2. Query Function: The actual fetch promise generator
    queryFn: () => api.getTasks(filters),

    // 3. Stale Time (Default: 0): Time in milliseconds before data is marked "stale".
    // Fresh data is served directly from cache without background refetching.
    staleTime: 5000, // 5 seconds (to visually show stale status transitions)

    // 4. Garbage Collection Time (Default: 5 minutes / 300,000ms): 
    // Time unused query data remains in cache before being cleaned up.
    gcTime: 30000, // 30 seconds (reduced for demonstration purposes)

    // 5. Retry configuration: React Query by default retries failed requests 3 times
    retry: 2, 
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 3000),

    // 6. Keep Previous Data: Prevents layout layout-flickering during pagination 
    // by keeping the old page data visible in "success" state while the next page loads.
    placeholderData: keepPreviousData,
  });
};
