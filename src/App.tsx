import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Dashboard } from '@/pages/Dashboard';
import { CallDetail } from '@/pages/CallDetail';
import { PromptHistory } from '@/pages/PromptHistory';

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/calls" element={<Navigate to="/" replace />} />
          <Route path="/calls/:id" element={<CallDetail />} />
          <Route path="/history" element={<PromptHistory />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;