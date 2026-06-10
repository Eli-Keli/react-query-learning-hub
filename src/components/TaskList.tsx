import { useState } from 'react';
import { useTasks } from '../hooks/useTasks';
import { useMutations } from '../hooks/useMutations';
import type { Task } from '../services/api';
import { 
  Plus, Trash2, Search, Filter, RefreshCw, AlertCircle, 
  ChevronLeft, ChevronRight, Loader2, CheckSquare, Square
} from 'lucide-react';

export const TaskList = () => {
  // 1. Local UI Filter State
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<Task['status'] | 'all'>('all');
  const [priority, setPriority] = useState<Task['priority'] | 'all'>('all');
  const [page, setPage] = useState(1);
  const limit = 3;

  // New task form state
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newPriority, setNewPriority] = useState<Task['priority']>('medium');
  const [showAddForm, setShowAddForm] = useState(false);

  // 2. React Query Hooks
  const { 
    data, 
    isLoading, // Initial hard load (no cached data at all)
    isError, 
    error, 
    isFetching, // Active background request (whether cached or not)
    failureCount, // Number of times query failed and is retrying
  } = useTasks({ search, status, priority, page, limit });

  const { 
    addTask, isAdding, 
    deleteTask, 
    toggleTaskStatus 
  } = useMutations();

  // Reset page when filters change
  const handleFilterChange = (setter: any, val: any) => {
    setter(val);
    setPage(1);
  };

  const handleAddTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    addTask({
      title: newTitle,
      description: newDesc,
      status: 'pending',
      priority: newPriority,
    }, {
      onSuccess: () => {
        setNewTitle('');
        setNewDesc('');
        setNewPriority('medium');
        setShowAddForm(false);
      }
    });
  };

  const handleToggle = (task: Task) => {
    const nextStatusMap: Record<Task['status'], Task['status']> = {
      'pending': 'in-progress',
      'in-progress': 'completed',
      'completed': 'pending'
    };
    toggleTaskStatus({ id: task.id, status: nextStatusMap[task.status] });
  };

  const renderStatusIcon = (status: Task['status']) => {
    switch (status) {
      case 'completed':
        return <CheckSquare className="icon text-primary cursor-pointer hover:scale-105 transition-transform" size={20} />;
      case 'in-progress':
        return (
          <div className="status-progress-box cursor-pointer hover:scale-105 transition-transform" title="In Progress">
            <span className="dot-in-progress"></span>
          </div>
        );
      default:
        return <Square className="icon text-muted cursor-pointer hover:scale-105 transition-transform" size={20} />;
    }
  };

  const getPriorityBadgeClass = (priority: Task['priority']) => {
    switch (priority) {
      case 'high': return 'priority-high';
      case 'medium': return 'priority-medium';
      default: return 'priority-low';
    }
  };

  // Helper to render skeleton loaders
  const renderSkeletons = () => (
    <div className="skeleton-container">
      {[1, 2, 3].map((n) => (
        <div key={n} className="skeleton-card">
          <div className="skeleton-line skeleton-header"></div>
          <div className="skeleton-line skeleton-body-1"></div>
          <div className="skeleton-line skeleton-body-2"></div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="card tasks-card">
      <div className="card-header">
        <div className="header-title">
          <CheckSquare className="icon text-primary" size={20} />
          <h2>Task Dashboard</h2>
          {isFetching && (
            <span className="bg-fetching-indicator animate-pulse-slow">
              <RefreshCw className="animate-spin text-primary mr-1" size={12} />
              SWR Background Syncing...
            </span>
          )}
        </div>
        
        <button 
          onClick={() => setShowAddForm(!showAddForm)} 
          className="btn btn-primary btn-sm"
        >
          <Plus size={16} className="mr-1" /> Add Task
        </button>
      </div>

      {/* FILTER BAR */}
      <div className="filter-bar">
        <div className="search-input-wrapper">
          <Search className="search-icon" size={16} />
          <input
            type="text"
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => handleFilterChange(setSearch, e.target.value)}
          />
        </div>

        <div className="select-filters">
          <div className="filter-select-wrapper">
            <Filter size={12} className="select-icon" />
            <select 
              value={status} 
              onChange={(e) => handleFilterChange(setStatus, e.target.value as any)}
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div className="filter-select-wrapper">
            <Filter size={12} className="select-icon" />
            <select 
              value={priority} 
              onChange={(e) => handleFilterChange(setPriority, e.target.value as any)}
            >
              <option value="all">All Priorities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* ADD TASK FORM */}
      {showAddForm && (
        <form onSubmit={handleAddTaskSubmit} className="add-task-form animate-fade-in">
          <h4>Create New Task</h4>
          <div className="form-group">
            <input
              type="text"
              placeholder="Task Title"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <textarea
              placeholder="Task Description"
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
            />
          </div>
          <div className="form-row">
            <div className="form-group half-width">
              <label>Priority:</label>
              <select 
                value={newPriority} 
                onChange={(e) => setNewPriority(e.target.value as any)}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div className="form-buttons">
              <button 
                type="button" 
                onClick={() => setShowAddForm(false)} 
                className="btn btn-secondary btn-sm"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={isAdding} 
                className="btn btn-primary btn-sm"
              >
                {isAdding ? <Loader2 className="animate-spin" size={14} /> : 'Save Task'}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* TASKS CONTENTS */}
      <div className="tasks-content-area">
        {/* Loading state: Only show skeleton loader when there is NO cached data at all */}
        {isLoading && renderSkeletons()}

        {/* Retry status warning */}
        {isFetching && failureCount > 0 && (
          <div className="alert-retry animate-bounce-subtle">
            <Loader2 className="animate-spin mr-2" size={16} />
            <span>API Request failed. Retrying in background... (Attempt {failureCount}/2)</span>
          </div>
        )}

        {/* Error state */}
        {isError && !isLoading && (
          <div className="error-panel animate-fade-in">
            <AlertCircle size={36} className="text-error" />
            <h3>Failed to load tasks</h3>
            <p>{error?.message || 'Unknown network error. Please check settings.'}</p>
          </div>
        )}

        {/* Success state */}
        {!isLoading && !isError && data && (
          <>
            {data.tasks.length === 0 ? (
              <div className="empty-tasks">
                <p>No tasks match your filters.</p>
              </div>
            ) : (
              <div className="task-list">
                {data.tasks.map((task) => (
                  <div key={task.id} className={`task-item status-${task.status}`}>
                    <div className="task-item-left" onClick={() => handleToggle(task)}>
                      {renderStatusIcon(task.status)}
                      <div className="task-info">
                        <span className={`task-title status-${task.status}`}>{task.title}</span>
                        {task.description && <p className="task-desc">{task.description}</p>}
                      </div>
                    </div>
                    <div className="task-item-right">
                      <span className={`priority-badge ${getPriorityBadgeClass(task.priority)}`}>
                        {task.priority}
                      </span>
                      <button 
                        onClick={() => deleteTask(task.id)} 
                        className="btn-icon text-error hover:bg-error-light"
                        title="Delete Task"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* PAGINATION CONTROLS */}
            {data.totalPages > 1 && (
              <div className="pagination-bar">
                <button
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  disabled={page === 1}
                  className="btn btn-icon-only"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="pagination-info">
                  Page <strong>{page}</strong> of {data.totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(p + 1, data.totalPages))}
                  disabled={page === data.totalPages}
                  className="btn btn-icon-only"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
