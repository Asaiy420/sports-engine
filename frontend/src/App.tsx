import { Routes, Route } from 'react-router-dom';
import { MatchListPage } from './pages/MatchListPage';
import { MatchDetailPage } from './pages/MatchDetailPage';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-5xl px-4 py-4">
          <h1 className="text-lg font-bold tracking-tight text-gray-900">
            ⚡ Sports Engine
          </h1>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8">
        <Routes>
          <Route path="/" element={<MatchListPage />} />
          <Route path="/matches/:id" element={<MatchDetailPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
