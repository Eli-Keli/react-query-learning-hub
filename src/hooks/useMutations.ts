import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import type { Task, FetchTasksResponse } from '../services/api';
import { taskKeys } from './useTasks';

/**
 * useMutations Custom Hook
 * Provides React Query mutation hooks for creating, deleting, and updating tasks.
 */
export const useMutations = () => {
  const queryClient = useQueryClient();

  // 1. ADD TASK MUTATION
  // Demonstrates basic cache invalidation: refresh data after a successful write
  const addTaskMutation = useMutation({
    mutationFn: api.addTask,
    onSuccess: () => {
      // Invalidate all active task list queries to trigger a background refetch
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
    },
  });

  // 2. DELETE TASK MUTATION
  // Demonstrates basic cache invalidation
  const deleteTaskMutation = useMutation({
    mutationFn: api.deleteTask,
    onSuccess: () => {
      // Refetch queries matching our list key pattern
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
    },
  });

  // 3. TOGGLE TASK STATUS MUTATION (OPTIMISTIC UPDATE)
  // Explains the classic 3-step optimistic update lifecycle:
  //   1) onMutate: Cancel outgoing queries, snapshot cache, update cache immediately.
  //   2) onError: If the request fails, roll back cache using the snapshot.
  //   3) onSettled: Invalidate queries to ensure local cache is fully synced with server.
  const toggleTaskStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: Task['status'] }) =>
      api.updateTaskStatus(id, status),

    // Step 1: Called before mutationFn runs
    onMutate: async ({ id, status }) => {
      // a) Cancel any outgoing refetches for tasks so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: taskKeys.lists() });

      // b) Snapshot the current cached values for all matching list queries
      // We use getQueriesData because we have paginated list keys like ['tasks', 'list', {page: 1}], etc.
      const previousQueries = queryClient.getQueriesData<FetchTasksResponse>({
        queryKey: taskKeys.lists(),
      });

      // c) Optimistically update the cache of all list queries containing this task
      queryClient.setQueriesData<FetchTasksResponse>(
        { queryKey: taskKeys.lists() },
        (oldData) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            tasks: oldData.tasks.map((task) =>
              task.id === id ? { ...task, status } : task
            ),
          };
        }
      );

      // d) Return a context object containing the snapshot for rollback on error
      return { previousQueries };
    },

    // Step 2: Called if the mutationFn throws an error
    onError: (_err, _variables, context) => {
      // Roll back the cache to the previous state using our snapshot
      if (context?.previousQueries) {
        context.previousQueries.forEach(([queryKey, oldData]) => {
          queryClient.setQueryData(queryKey, oldData);
        });
      }
    },

    // Step 3: Called when the mutation completes (success or failure)
    onSettled: () => {
      // Always refetch in the background to ensure we are in sync with the database
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
    },
  });

  // Reset demo data helper
  const resetTasksMutation = useMutation({
    mutationFn: api.resetTasks,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.all });
    }
  });

  return {
    addTask: addTaskMutation.mutate,
    isAdding: addTaskMutation.isPending,
    addError: addTaskMutation.error,
    
    deleteTask: deleteTaskMutation.mutate,
    isDeleting: deleteTaskMutation.isPending,
    
    toggleTaskStatus: toggleTaskStatusMutation.mutate,
    isToggling: toggleTaskStatusMutation.isPending,
    
    resetTasks: resetTasksMutation.mutate,
    isResetting: resetTasksMutation.isPending,
  };
};
