# React Query: The Complete Developer Guide

Hello! This guide is written to help you transition from traditional client-side state management (like Redux or Context API) to modern **Server State Cache** using **TanStack React Query v5**.

---

## 1. The Core Paradigm Shift

### Client State vs. Server State
* **Client State**: Data owned by the browser (e.g., UI theme, modal toggle state, active tab index).
* **Server State**: Data owned by the server (e.g., tasks, user profiles, invoices). It is asynchronous, out of your direct control, and can be changed by other users at any time.

In the past, developers fetched server data and crammed it into Redux. This required writing hundreds of lines of boilerplate (actions, reducers, sagas/thunks, loading states, error states).

**React Query** replaces Redux for server state. It acts as an **asynchronous state manager** and **cache layer**.

---

## 2. Queries: Fetching Data

To fetch data, we use the `useQuery` hook.

```typescript
const { data, isLoading, isError, error, isFetching } = useQuery({
  queryKey: ['tasks', { status: 'pending' }],
  queryFn: () => fetchTasks({ status: 'pending' }),
});
```

### The Query Key Array
React Query caches data based on the **Query Key**.
* Query keys **MUST** be arrays.
* They behave exactly like React's `useEffect` dependency arrays.
* If any element in the query key array changes (e.g., status changes from `'pending'` to `'completed'`), React Query will automatically refetch!

```typescript
// Good Query Key Factory Pattern:
export const taskKeys = {
  all: ['tasks'] as const,
  lists: () => [...taskKeys.all, 'list'] as const,
  list: (filters: object) => [...taskKeys.lists(), filters] as const,
};
```

### Stale Time vs. GC (Garbage Collection) Time
This is the most critical concept to master:

1. **`staleTime` (Default: 0)**
   * How long is data considered "fresh"?
   * While data is **fresh**, React Query will serve it instantly from the cache **without refetching** in the background.
   * When data becomes **stale**, the user still sees the cached data, but React Query will refetch it in the background when:
     * The component mounts.
     * The window is refocused.
     * The network reconnects.

2. **`gcTime` (Default: 5 minutes)**
   * Previously called `cacheTime` in v4.
   * How long does data remain in the cache after a query becomes **inactive** (i.e., when no components are currently using it).
   * Once `gcTime` runs out, the data is deleted from memory.

---

## 3. Mutations: Modifying Data

To add, delete, or update data, we use the `useMutation` hook. Unlike queries, mutations run only when you explicitly invoke their `mutate` function.

### Basic Mutation with Cache Invalidation
The simplest mutation workflow is to update the server and then invalidate the query key so React Query automatically fetches the fresh data.

```typescript
const queryClient = useQueryClient();

const addTaskMutation = useMutation({
  mutationFn: (newTask) => api.addTask(newTask),
  onSuccess: () => {
    // Invalidate the cache for tasks so they automatically refresh!
    queryClient.invalidateQueries({ queryKey: ['tasks'] });
  },
});
```

---

## 4. Advanced: Optimistic Updates

An **Optimistic Update** is a UI pattern where you update the UI immediately before the server response returns, assuming the request will succeed. If the server request fails, you roll back the changes to their previous state.

### The 3-Step Lifecycle Pattern

Here is the exact pattern we used in `useMutations.ts` for toggling task status:

```typescript
const toggleMutation = useMutation({
  mutationFn: ({ id, status }) => api.updateTaskStatus(id, status),

  // Step 1: onMutate is triggered instantly before mutationFn starts
  onMutate: async ({ id, status }) => {
    // 1. Cancel outgoing queries for tasks so they don't overwrite our optimistic update
    await queryClient.cancelQueries({ queryKey: ['tasks', 'list'] });

    // 2. Snapshot the current cached data to roll back to if things fail
    const previousQueries = queryClient.getQueriesData({ queryKey: ['tasks', 'list'] });

    // 3. Update the cache optimistically
    queryClient.setQueriesData({ queryKey: ['tasks', 'list'] }, (oldData) => {
      if (!oldData) return oldData;
      return {
        ...oldData,
        tasks: oldData.tasks.map((task) =>
          task.id === id ? { ...task, status } : task
        ),
      };
    });

    // 4. Return context containing the snapshot
    return { previousQueries };
  },

  // Step 2: Called if mutationFn throws an error
  onError: (error, variables, context) => {
    // Roll back to the saved snapshot!
    if (context?.previousQueries) {
      context.previousQueries.forEach(([queryKey, oldData]) => {
        queryClient.setQueryData(queryKey, oldData);
      });
    }
  },

  // Step 3: Called always (on success or error)
  onSettled: () => {
    // Invalidate to make sure we are 100% in sync with the database
    queryClient.invalidateQueries({ queryKey: ['tasks', 'list'] });
  },
});
```

---

## 5. React Query Best Practices

1. **Wrap queries in Custom Hooks**
   * Keep your component files clean.
   * Don't call `useQuery` directly in your component. Instead, export `useTasks` and import that. This isolates your fetching logic in one place.

2. **Use Query Key Factories**
   * Maintain a single source of truth for query keys to prevent typo bugs when invalidating.

3. **Never sync query data to local useState**
   * Let React Query manage the cache. Syncing data into local `useState` creates multiple sources of truth and breaks SWR.

4. **Utilize placeholderData for pagination**
   * Set `placeholderData: keepPreviousData` (imported from `@tanstack/react-query`) to prevent pagination loading flickers.
