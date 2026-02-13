import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Signup from './pages/Signup';
import Login from './pages/Login';
import Dashboard from './pages/users/userDashboard';
import AdminDashboard from './pages/admin/adminDashboard';
import AuthorDashboard from './pages/author/authorDashboard';
import EditorDashboard from './pages/editor/editorDashboard';
import VerifyOtp from './pages/VerifyOtp';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import TermsOfService from './pages/TermsOfService';
import PrivacyPolicy from './pages/PrivacyPolicy';
import ProtectedRoute from './components/ProtectedRoute';
import { ToastProvider } from './components/ToastProvider';

function App() {
  return (
    <ToastProvider>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          <Route path="/signup" element={<Signup />} />
          <Route path="/verify-otp" element={<VerifyOtp />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          
          {/* Protected User Dashboard - All roles can access */}
          <Route element={<ProtectedRoute allowedRoles={['user', 'editor', 'author', 'admin']} requiredDashboard="user" />}>
            <Route path="/dashboard" element={<Dashboard />} />
          </Route>

          {/* Protected Editor Dashboard - Editor, Author, Admin can access */}
          <Route element={<ProtectedRoute allowedRoles={['editor', 'author', 'admin']} requiredDashboard="editor" />}>
            <Route path="/editor/dashboard" element={<EditorDashboard />} />
          </Route>

          {/* Protected Author Dashboard - Author, Admin can access */}
          <Route element={<ProtectedRoute allowedRoles={['author', 'admin']} requiredDashboard="author" />}>
            <Route path="/author/dashboard" element={<AuthorDashboard />} />
          </Route>

          {/* Protected Admin Dashboard - Admin only */}
          <Route element={<ProtectedRoute allowedRoles={['admin']} requiredDashboard="admin" />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
          </Route>

          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    </ToastProvider>
  );
}

export default App;
