import { Routes, Route } from 'react-router-dom';
import Sidebar from './Sidebar';
import Dashboard from './Dashboard';
import Tracking from './Tracking';
import Messages from './Messages';
import Settings from './Settings';

function Website() {
  return (
    <div style={{ display: 'flex' }}>
      {/* Sidebar only here, not inside Dashboard or others */}
      <Sidebar />

      {/* Page content */}
      <div style={{ flex: 1, padding: '1rem' }}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/tracking" element={<Tracking />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </div>
    </div>
  );
}

export default Website;
