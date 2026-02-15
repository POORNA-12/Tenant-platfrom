import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AuthPage from './pages/AuthPage';
import DashboardLayout from './layouts/DashboardLayout';
import WorkflowDashboard from './pages/WorkflowDashboard';
import PendingApprovals from './pages/PendingApprovals';
import CreateWorkflow from './pages/CreateWorkflow';
import ApplyWorkflow from './pages/ApplyWorkflow';
import WorkflowStatus from './pages/WorkflowStatus';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Auth */}
          <Route path="/" element={<AuthPage />} />

          {/* Dashboard shell — protected */}
          <Route
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<WorkflowDashboard />} />
            <Route path="/dashboard/approvals" element={<PendingApprovals />} />
            <Route path="/dashboard/workflows/new" element={<CreateWorkflow />} />
            <Route path="/dashboard/workflows/:requestId" element={<WorkflowStatus />} />
            <Route path="/apply/:definitionId" element={<ApplyWorkflow />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
