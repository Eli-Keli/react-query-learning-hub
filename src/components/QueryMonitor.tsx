import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Activity, Database, RefreshCw } from 'lucide-react';

interface VisualQuery {
  key: string;
  status: 'fresh' | 'stale' | 'fetching' | 'inactive';
  dataCount: number;
  updatedAt: string;
  isFetching: boolean;
}

export const QueryMonitor = () => {
  const queryClient = useQueryClient();
  const [queries, setQueries] = useState<VisualQuery[]>([]);

  useEffect(() => {
    const cache = queryClient.getQueryCache();

    const getQueryStatus = (query: any): VisualQuery['status'] => {
      if (!query.isActive()) return 'inactive';
      if (query.state.fetchStatus === 'fetching') return 'fetching';
      if (query.isStale()) return 'stale';
      return 'fresh';
    };

    const updateCacheData = () => {
      const allQueries = cache.getAll();
      const mapped = allQueries.map((q) => {
        let count = 0;
        if (q.state.data) {
          if (Array.isArray(q.state.data)) {
            count = q.state.data.length;
          } else if (typeof q.state.data === 'object') {
            // Check if it's our paginated response
            const data = q.state.data as any;
            if (data.tasks && Array.isArray(data.tasks)) {
              count = data.tasks.length;
            } else {
              count = Object.keys(data).length;
            }
          }
        }

        return {
          key: JSON.stringify(q.queryKey),
          status: getQueryStatus(q),
          dataCount: count,
          updatedAt: new Date(q.state.dataUpdatedAt).toLocaleTimeString(),
          isFetching: q.state.fetchStatus === 'fetching',
        };
      });

      // Sort: fetching first, then fresh, then stale, then inactive
      mapped.sort((a, b) => {
        const order = { fetching: 0, fresh: 1, stale: 2, inactive: 3 };
        return order[a.status] - order[b.status];
      });

      setQueries(mapped);
    };

    // Initial load
    updateCacheData();

    // Subscribe to cache updates (on query added, updated, removed, etc.)
    const unsubscribe = cache.subscribe(() => {
      updateCacheData();
    });

    return () => unsubscribe();
  }, [queryClient]);

  const getStatusBadgeClass = (status: VisualQuery['status']) => {
    switch (status) {
      case 'fetching':
        return 'badge-fetching';
      case 'fresh':
        return 'badge-fresh';
      case 'stale':
        return 'badge-stale';
      default:
        return 'badge-inactive';
    }
  };

  return (
    <div className="card monitor-card">
      <div className="card-header">
        <div className="header-title">
          <Database className="icon text-primary animate-pulse-slow" size={20} />
          <h2>Query Cache Monitor</h2>
        </div>
        <span className="query-count-badge">{queries.length} Queries Cached</span>
      </div>
      
      <p className="card-desc">
        Observe how TanStack React Query stores data in memory. This panel updates in real time as network requests complete, queries expire, or filters change.
      </p>

      {queries.length === 0 ? (
        <div className="empty-monitor">
          <Activity size={36} className="text-muted" />
          <p>No queries currently in cache. Load the tasks page to populate.</p>
        </div>
      ) : (
        <div className="monitor-list">
          {queries.map((q) => (
            <div key={q.key} className={`monitor-item status-${q.status}`}>
              <div className="monitor-item-header">
                <code className="query-key">{q.key}</code>
                <span className={`status-badge ${getStatusBadgeClass(q.status)}`}>
                  {q.status === 'fetching' && <RefreshCw size={10} className="animate-spin mr-1" />}
                  {q.status}
                </span>
              </div>
              <div className="monitor-item-details">
                <div className="detail-col">
                  <span className="detail-label">Payload Size:</span>
                  <span className="detail-value">{q.dataCount} items</span>
                </div>
                <div className="detail-col">
                  <span className="detail-label">Last Updated:</span>
                  <span className="detail-value">{q.updatedAt}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <div className="monitor-legend">
        <h4>State Guide for the Junior Developer:</h4>
        <div className="legend-grid">
          <div className="legend-item">
            <span className="legend-dot status-fetching-dot"></span>
            <div>
              <strong>Fetching:</strong>
              <p>Active request currently fetching data in the background.</p>
            </div>
          </div>
          <div className="legend-item">
            <span className="legend-dot status-fresh-dot"></span>
            <div>
              <strong>Fresh:</strong>
              <p>Data matches staleTime. Served instantly without background fetching.</p>
            </div>
          </div>
          <div className="legend-item">
            <span className="legend-dot status-stale-dot"></span>
            <div>
              <strong>Stale:</strong>
              <p>Needs refetching. Next mount/query key change triggers background update.</p>
            </div>
          </div>
          <div className="legend-item">
            <span className="legend-dot status-inactive-dot"></span>
            <div>
              <strong>Inactive:</strong>
              <p>No active observers. Will remain in cache until gcTime runs out.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
