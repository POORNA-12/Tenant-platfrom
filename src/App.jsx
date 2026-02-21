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
import MyRequests from './pages/MyRequests';
import MyApprovals from './pages/MyApprovals';

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
            <Route path="/my-requests" element={<MyRequests />} />
            <Route path="/my-approvals" element={<MyApprovals />} />
            <Route path="/requests" element={<MyRequests />} /> {/* Alias or missing page */}
            <Route path="/drafts" element={<div className="p-8 text-center">Drafts page coming soon...</div>} />
            <Route path="/settings" element={<div className="p-8 text-center">Settings page coming soon...</div>} />
            <Route path="/support" element={<div className="p-8 text-center">Support page coming soon...</div>} />
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
