import { Navigate, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from './auth.jsx';
import Layout from './components/Layout.jsx';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import StackPage from './pages/StackPage.jsx';
import QueuePage from './pages/QueuePage.jsx';
import ComparePage from './pages/ComparePage.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="stack" element={<StackPage />} />
        <Route path="queue" element={<QueuePage />} />
        <Route path="compare" element={<ComparePage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
