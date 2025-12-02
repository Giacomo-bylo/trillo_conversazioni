import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Dashboard } from '@/pages/Dashboard';
import { CallDetail } from '@/pages/CallDetail';
import { CallsList } from '@/pages/CallsList';
import { MissedCalls } from '@/pages/MissedCalls';
import { Callbacks } from '@/pages/Callbacks';
import { PromptHistory } from '@/pages/PromptHistory';

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/calls" element={<CallsList />} />
          <Route path="/calls/:id" element={<CallDetail />} />
          <Route path="/missed-calls" element={<MissedCalls />} />
          <Route path="/callbacks" element={<Callbacks />} />
          <Route path="/history" element={<PromptHistory />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;