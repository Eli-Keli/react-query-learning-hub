import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Dashboard } from './components/Dashboard';

// 1. Initialize the QueryClient
// This instance manages the entire query cache and configurations.
// You can pass global defaults here (like retry logic, default staleTime).
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Global default config
      refetchOnWindowFocus: false, // Prevents aggressive refetches on browser focus changes
    },
  },
});

export default function App() {
  return (
    // 2. Wrap the application root with the QueryClientProvider
    <QueryClientProvider client={queryClient}>
      {/* Our custom application shell */}
      <Dashboard />
      
      {/* 3. Mount the official TanStack React Query DevTools 
          This renders a floating logo in the bottom right corner in development mode,
          letting developers inspect the cache state, refetch, invalidate, or delete queries. */}
      <ReactQueryDevtools initialIsOpen={false} position="bottom" />
    </QueryClientProvider>
  );
}
