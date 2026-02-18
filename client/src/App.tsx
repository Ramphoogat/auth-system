import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import UnifiedDashboard from "./components/UnifiedDashboard";
import VerifyOtp from "./components/VerifyOtp";
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";
import TermsOfService from "./pages/TermsOfService";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import HomePage from "./pages/landingpage/HomePage";
import Error404 from "./components/error_404";
import ProtectedRoute from "./components/ProtectedRoute";
import { ToastProvider } from "./components/ToastProvider";
import { NotificationProvider } from "./context/NotificationContext";

function App() {
  return (
    <ToastProvider>
      <NotificationProvider>
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Routes>
            <Route path="/signup" element={<Signup />} />
            <Route path="/verify-otp" element={<VerifyOtp />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/terms-of-service" element={<TermsOfService />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />

            {/* Unified Dashboard Route - All authenticated users can access, role check inside */}
            <Route
              element={
                <ProtectedRoute
                  allowedRoles={["user", "editor", "author", "admin"]}
                />
              }
            >
              <Route path="/dashboard/:section?" element={<UnifiedDashboard />} />
            </Route>

            <Route path="/" element={<HomePage />} />
            <Route path="*" element={<Error404 />} />
          </Routes>
        </Router>
      </NotificationProvider>
    </ToastProvider>
  );
}

export default App;
