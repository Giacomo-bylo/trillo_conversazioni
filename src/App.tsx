import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Dashboard } from '@/pages/Dashboard';
import { CallDetail } from '@/pages/CallDetail';
import { PromptOptimizer } from '@/pages/PromptOptimizer';
import { ABTesting } from '@/pages/ABTesting';
import { PromptHistory } from '@/pages/PromptHistory';

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/calls" element={<Navigate to="/" replace />} />
          <Route path="/calls/:id" element={<CallDetail />} />
          <Route path="/optimizer" element={<PromptOptimizer />} />
          <Route path="/ab-testing" element={<ABTesting />} />
          <Route path="/history" element={<PromptHistory />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
