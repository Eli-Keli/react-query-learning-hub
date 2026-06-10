import { useState } from 'react';
import { TaskList } from './TaskList';
import { NetworkSettings } from './NetworkSettings';
import { QueryMonitor } from './QueryMonitor';
import { DocViewer } from './DocViewer';
import { GraduationCap, Database, BookOpen } from 'lucide-react';

export const Dashboard = () => {
  const [activeTab, setActiveTab] = useState<'monitor' | 'guide'>('monitor');

  return (
    <div className="dashboard-container">
      {/* HEADER NAVBAR */}
      <header className="dashboard-header">
        <div className="header-logo-group">
          <div className="logo-badge animate-pulse-slow">
            <GraduationCap size={24} className="text-primary" />
          </div>
          <div>
            <h1>React Query Learning Hub</h1>
            <p className="subtitle">
              Interactive playground teaching TanStack React Query v5 concepts to junior-intermediate developers.
            </p>
          </div>
        </div>
      </header>

      {/* DUAL-COLUMN GRID LAYOUT */}
      <main className="dashboard-grid">
        {/* LEFT COLUMN: INTERACTIVE APP & CONTROLS */}
        <div className="grid-column left-column">
          <TaskList />
          <NetworkSettings />
        </div>

        {/* RIGHT COLUMN: VISUALIZERS & DOCUMENTATION */}
        <div className="grid-column right-column">
          {/* TAB SYSTEM */}
          <div className="tabs-header">
            <button
              onClick={() => setActiveTab('monitor')}
              className={`tab-btn ${activeTab === 'monitor' ? 'active' : ''}`}
            >
              <Database size={16} />
              <span>Cache Monitor</span>
            </button>
            <button
              onClick={() => setActiveTab('guide')}
              className={`tab-btn ${activeTab === 'guide' ? 'active' : ''}`}
            >
              <BookOpen size={16} />
              <span>Developer Guide</span>
            </button>
          </div>

          <div className="tab-content">
            {activeTab === 'monitor' ? (
              <div className="animate-fade-in">
                <QueryMonitor />
              </div>
            ) : (
              <div className="animate-fade-in">
                <DocViewer />
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};
export default Dashboard;
