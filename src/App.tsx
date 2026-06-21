import { Navigate, Route, Routes } from 'react-router-dom';
import BottomNav from './components/BottomNav';
import RecordPage from './pages/RecordPage';
import PreviewPage from './pages/PreviewPage';
import SettingsPage from './pages/SettingsPage';

export default function App() {
  return (
    <div className="min-h-screen max-w-md mx-auto bg-[#f5f6f8] relative overflow-x-hidden">
      <main className="pb-16">
        <Routes>
          <Route path="/" element={<Navigate to="/record" replace />} />
          <Route path="/record" element={<RecordPage />} />
          <Route path="/preview" element={<PreviewPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/record" replace />} />
        </Routes>
      </main>
      <BottomNav />
    </div>
  );
}
