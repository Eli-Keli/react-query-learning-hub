export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
}

export interface FetchTasksParams {
  search?: string;
  priority?: 'low' | 'medium' | 'high' | 'all';
  status?: 'pending' | 'in-progress' | 'completed' | 'all';
  page?: number;
  limit?: number;
}

export interface FetchTasksResponse {
  tasks: Task[];
  totalCount: number;
  page: number;
  totalPages: number;
}

// Global network simulation state
export const networkSettings = {
  delayMs: 1000,
  errorRate: 0, // 0 to 1 (0% to 100%)
};

// Default seed data
const DEFAULT_TASKS: Task[] = [
  {
    id: '1',
    title: 'Learn TanStack React Query basics',
    description: 'Read the guide and understand queries, mutations, and query keys.',
    status: 'completed',
    priority: 'high',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
  {
    id: '2',
    title: 'Configure a query client with custom staleTime',
    description: 'Set up QueryClientProvider and adjust staleTime and gcTime default values.',
    status: 'in-progress',
    priority: 'medium',
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
  {
    id: '3',
    title: 'Implement optimistic updates on checkboxes',
    description: 'Write custom onMutate, onError, and onSettled callback logic to instantly update local cache.',
    status: 'pending',
    priority: 'high',
    createdAt: new Date(Date.now() - 3600000 * 6).toISOString(),
  },
  {
    id: '4',
    title: 'Review React Query cache state indicators',
    description: 'Use the visual query monitor to inspect fresh, stale, and fetching query lifecycles.',
    status: 'pending',
    priority: 'low',
    createdAt: new Date().toISOString(),
  },
  {
    id: '5',
    title: 'Build custom query hooks factory',
    description: 'Refactor direct useQuery calls into reusable useTasks and useMutations files.',
    status: 'pending',
    priority: 'medium',
    createdAt: new Date().toISOString(),
  }
];

const getStoredTasks = (): Task[] => {
  const data = localStorage.getItem('react-query-demo-tasks');
  if (!data) {
    localStorage.setItem('react-query-demo-tasks', JSON.stringify(DEFAULT_TASKS));
    return DEFAULT_TASKS;
  }
  return JSON.parse(data);
};

const saveStoredTasks = (tasks: Task[]) => {
  localStorage.setItem('react-query-demo-tasks', JSON.stringify(tasks));
};

// Helper to simulate network conditions
const simulateNetwork = async () => {
  await new Promise((resolve) => setTimeout(resolve, networkSettings.delayMs));
  if (Math.random() < networkSettings.errorRate) {
    throw new Error('Simulated network error! The API request failed.');
  }
};

export const api = {
  getTasks: async (params: FetchTasksParams): Promise<FetchTasksResponse> => {
    await simulateNetwork();
    
    const allTasks = getStoredTasks();
    const { search = '', priority = 'all', status = 'all', page = 1, limit = 3 } = params;

    // Filter tasks
    let filtered = allTasks;

    if (search.trim() !== '') {
      const query = search.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.title.toLowerCase().includes(query) ||
          t.description.toLowerCase().includes(query)
      );
    }

    if (priority !== 'all') {
      filtered = filtered.filter((t) => t.priority === priority);
    }

    if (status !== 'all') {
      filtered = filtered.filter((t) => t.status === status);
    }

    // Sort by createdAt descending
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Pagination
    const totalCount = filtered.length;
    const totalPages = Math.ceil(totalCount / limit);
    const startIndex = (page - 1) * limit;
    const tasks = filtered.slice(startIndex, startIndex + limit);

    return {
      tasks,
      totalCount,
      page,
      totalPages,
    };
  },

  addTask: async (task: Omit<Task, 'id' | 'createdAt'>): Promise<Task> => {
    await simulateNetwork();
    
    const newTask: Task = {
      ...task,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
    };
    
    const tasks = getStoredTasks();
    tasks.push(newTask);
    saveStoredTasks(tasks);
    return newTask;
  },

  deleteTask: async (id: string): Promise<string> => {
    await simulateNetwork();
    
    const tasks = getStoredTasks();
    const filtered = tasks.filter((t) => t.id !== id);
    saveStoredTasks(filtered);
    return id;
  },

  updateTaskStatus: async (id: string, status: Task['status']): Promise<Task> => {
    await simulateNetwork();
    
    const tasks = getStoredTasks();
    const taskIndex = tasks.findIndex((t) => t.id === id);
    if (taskIndex === -1) {
      throw new Error(`Task with id ${id} not found.`);
    }
    
    tasks[taskIndex].status = status;
    saveStoredTasks(tasks);
    return tasks[taskIndex];
  },
  
  resetTasks: async (): Promise<Task[]> => {
    await simulateNetwork();
    localStorage.setItem('react-query-demo-tasks', JSON.stringify(DEFAULT_TASKS));
    return DEFAULT_TASKS;
  }
};
