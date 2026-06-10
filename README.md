# TanStack React Query v5 Learning Hub

Welcome! This repository is an **interactive playground and learning hub** designed to teach developers how to transition from global client-side state management (like Redux or Context API) to modern **Server State Cache** using **TanStack React Query v5**.

It features a fully functioning Task Management application with an inline Query Cache Monitor, a configurable network conditions simulator, and a hand-crafted developer guide.

---

## 🚀 Quick Start (How to Run)

To run the application locally:

```bash
# 1. Clone the repository
git clone https://github.com/Eli-Keli/react-query-learning-hub.git
cd react-query-learning-hub

# 2. Install dependencies
npm install

# 3. Start the Vite development server
npm run dev
```

Open **[http://localhost:5173/](http://localhost:5173/)** in your browser. 

---

## 🛠️ Main Features

1. **Interactive Task Manager**: Add, delete, and toggle tasks paginated, filtered, and searched in real-time.
2. **Network Simulator**: Sliders to adjust simulated network latency (0 to 5 seconds) and failure rates (0% to 100%) to see how React Query handles loading states, retries, and rollbacks.
3. **Query Cache Monitor**: A custom-built, real-time dashboard displaying active query keys, payload sizes, timestamps, and cache statuses (`fresh`, `stale`, `fetching`, `inactive`).
4. **Interactive Developer Guide**: A readable documentation portal compiled inside the app.
5. **Theme Selector**: Full dark-mode and light-mode theme switcher.

---

## 📂 Code Tour (Where to Start)

If you are exploring the codebase to learn TanStack React Query, check out these files in order:

1. **`src/services/api.ts`**: The mocked database layer stored in `localStorage` that introduces delay and errors dynamically based on simulator sliders.
2. **`src/hooks/useTasks.ts`**: Contains our queries wrapping the `useQuery` hook. Focus on:
   - Query Key Factory structures.
   - Configuring custom `staleTime` and `gcTime` properties.
   - Implementing pagination transitions with `placeholderData: keepPreviousData`.
3. **`src/hooks/useMutations.ts`**: Custom mutations using `useMutation`. Focus on:
   - Simple cache invalidation (`queryClient.invalidateQueries`).
   - The **Optimistic Update** workflow on status toggles (canceling queries, snapshotting cache, updating instantly, rolling back on errors, and syncing on settled).
4. **`src/components/QueryMonitor.tsx`**: How we subscribe directly to `queryClient.getQueryCache()` to visualize the cache lifecycle without external DevTools.
5. **`src/App.tsx`**: Setting up `QueryClient`, wrapping the application tree in `QueryClientProvider`, and mounting the official floating DevTools.
