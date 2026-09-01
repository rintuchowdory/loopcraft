import { Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar.jsx';
import Dashboard from './pages/Dashboard.jsx';
import AITutor from './pages/AITutor.jsx';
import AIPairProgrammer from './pages/AIPairProgrammer.jsx';
import ComingSoon from './pages/ComingSoon.jsx';

export default function App() {
  return (
    <div className="app-shell">
      <Sidebar />
      <main>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/tutor" element={<AITutor />} />
          <Route path="/pair" element={<AIPairProgrammer />} />
          <Route path="/courses" element={<ComingSoon title="Courses" />} />
          <Route path="/practice" element={<ComingSoon title="Practice" />} />
          <Route path="/challenges" element={<ComingSoon title="Challenges" />} />
          <Route path="/leaderboard" element={<ComingSoon title="Leaderboard" />} />
          <Route path="/achievements" element={<ComingSoon title="Achievements" />} />
          <Route path="/settings" element={<ComingSoon title="Settings" />} />
        </Routes>
      </main>

      <style>{`
        .app-shell {
          display: flex;
          height: 100vh;
        }
        main {
          flex: 1;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }
        main > * {
          height: 100%;
        }
      `}</style>
    </div>
  );
}
