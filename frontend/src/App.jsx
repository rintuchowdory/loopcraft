import { Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar.jsx';
import Dashboard from './pages/Dashboard.jsx';
import AITutor from './pages/AITutor.jsx';
import AIPairProgrammer from './pages/AIPairProgrammer.jsx';
import Challenges from './pages/Challenges.jsx';
import ConceptExplorer from './pages/ConceptExplorer.jsx';
import SnippetLibrary from './pages/SnippetLibrary.jsx';

export default function App() {
  return (
    <div className="app-shell">
      <Sidebar />
      <main>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/tutor" element={<AITutor />} />
          <Route path="/pair" element={<AIPairProgrammer />} />
          <Route path="/challenges" element={<Challenges />} />
          <Route path="/concepts" element={<ConceptExplorer />} />
          <Route path="/snippets" element={<SnippetLibrary />} />
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
          overflow-y: auto;
        }
      `}</style>
    </div>
  );
}
