import { useState } from 'react';
import { networkSettings } from '../services/api';
import { Sliders, RefreshCw, AlertTriangle, Wifi } from 'lucide-react';
import { useMutations } from '../hooks/useMutations';

export const NetworkSettings = () => {
  const [delay, setDelay] = useState(networkSettings.delayMs);
  const [errorRate, setErrorRate] = useState(networkSettings.errorRate);
  const { resetTasks, isResetting } = useMutations();

  const handleDelayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    setDelay(val);
    networkSettings.delayMs = val;
  };

  const handleErrorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setErrorRate(val);
    networkSettings.errorRate = val;
  };

  return (
    <div className="card network-card">
      <div className="card-header">
        <div className="header-title">
          <Sliders className="icon text-secondary" size={20} />
          <h2>Network Simulator</h2>
        </div>
        <button 
          onClick={() => resetTasks()} 
          disabled={isResetting} 
          className="btn btn-secondary btn-sm"
          title="Reset database tasks to initial values"
        >
          {isResetting ? <RefreshCw className="animate-spin mr-1" size={12} /> : null}
          Reset Tasks DB
        </button>
      </div>
      
      <p className="card-desc">
        Tune these parameters to simulate real-world conditions. Adjust latency to test loading skeletons, and adjust error rates to inspect automatic query retries.
      </p>

      <div className="settings-controls">
        <div className="control-group">
          <div className="control-header">
            <label htmlFor="delay-slider">Simulated Latency:</label>
            <span className="control-value">{delay} ms</span>
          </div>
          <input
            id="delay-slider"
            type="range"
            min="0"
            max="5000"
            step="500"
            value={delay}
            onChange={handleDelayChange}
            className="slider"
          />
          <span className="control-hint">
            {delay === 0 ? 'Instantaneous local responses' : `Introduces a ${delay / 1000}s delay on all requests`}
          </span>
        </div>

        <div className="control-group">
          <div className="control-header">
            <label htmlFor="error-slider">Failure Probability:</label>
            <span className="control-value">{Math.round(errorRate * 100)}%</span>
          </div>
          <input
            id="error-slider"
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={errorRate}
            onChange={handleErrorChange}
            className="slider"
          />
          <span className="control-hint">
            {errorRate === 0 
              ? 'Network is 100% reliable' 
              : `Roughly ${Math.round(errorRate * 100)}% of API calls will throw errors`}
          </span>
        </div>
      </div>

      <div className="network-diagnostics">
        <div className="diagnostic-header">
          <h4>React Query Behaviors to Observe:</h4>
        </div>
        <div className="diagnostic-row">
          {delay > 0 ? (
            <Wifi className="text-secondary animate-pulse-slow mr-2" size={16} />
          ) : (
            <Wifi className="text-primary mr-2" size={16} />
          )}
          <span>
            {delay > 1500 
              ? 'Slow network: observe cached pages serving immediately while background updates load.' 
              : 'Normal network: observe the fast loading states.'}
          </span>
        </div>
        <div className="diagnostic-row">
          {errorRate > 0 ? (
            <AlertTriangle className="text-warning animate-pulse-slow mr-2" size={16} />
          ) : (
            <Wifi className="text-primary mr-2" size={16} />
          )}
          <span>
            {errorRate > 0 
              ? `Error retry: a query failure triggers 2 retries (with exponential backoff) before displaying an error.` 
              : 'Reliable connection: queries resolve on first try.'}
          </span>
        </div>
      </div>
    </div>
  );
};
