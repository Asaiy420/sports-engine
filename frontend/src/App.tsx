import { Routes, Route } from 'react-router-dom';
import { MatchListPage } from './pages/MatchListPage';
import { MatchDetailPage } from './pages/MatchDetailPage';

function App() {
  return (
    <div className='min-h-screen bg-(--canvas) text-(--ink)'>
      <header className='sticky top-0 z-20 border-b border-(--line) bg-white/90 backdrop-blur'>
        <div className='mx-auto flex max-w-6xl items-center justify-between px-4 py-4'>
          <div>
            <p className='text-xs font-semibold uppercase tracking-[0.28em] text-(--muted)'>
              Sports Engine
            </p>
            <h1 className='text-xl font-semibold text-(--ink)'>
              Real-time score desk
            </h1>
          </div>
          <div className='hidden items-center gap-2 rounded-full border border-(--line) bg-(--chip) px-3 py-1 text-xs font-semibold text-(--muted) sm:flex'>
            <span className='inline-block h-2 w-2 rounded-full bg-(--accent)' />
            Streaming updates
          </div>
        </div>
      </header>

      <main className='mx-auto max-w-6xl px-4 py-8'>
        <Routes>
          <Route path='/' element={<MatchListPage />} />
          <Route path='/matches/:id' element={<MatchDetailPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
