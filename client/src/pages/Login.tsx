import React, { useState } from "react";
import api from "../api/axios";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import LiquidChrome from "../components/LiquidChrome";

const Login = () => {
  const [identifier, setIdentifier] = useState(""); // email or username
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"credentials" | "otp">("credentials");
  const [emailForOtp, setEmailForOtp] = useState("");

  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { data } = await api.post("/auth/login", {
        identifier,
        password,
        // No role - backend uses stored role
      });
      setEmailForOtp(data.email);
      setStep("otp");
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          alert("No user found in database. Please sign up first.");
        } else {
          alert(error.response?.data?.message || "Login failed");
        }
      } else {
        alert("An unexpected error occurred");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const payload = { 
        email: emailForOtp, 
        otp
        // No role - backend uses stored role
      };

      const { data } = await api.post("/auth/verify-otp", payload);

      const userRole = data.result.role;

      if (rememberMe) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("role", data.result.role);
        localStorage.setItem("last_user", identifier);
      } else {
        sessionStorage.setItem("token", data.token);
        sessionStorage.setItem("role", data.result.role);
        localStorage.setItem("last_user", identifier);
      }

      // Redirect based on role
      if (userRole === "admin") {
        navigate("/admin/dashboard");
      } else if (userRole === "author") {
        navigate("/author/dashboard");
      } else if (userRole === "editor") {
        navigate("/editor/dashboard");
      } else {
        navigate("/dashboard");
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        alert(error.response?.data?.message || "Verification failed");
      } else {
        alert("An unexpected error occurred");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      const payload = { email: emailForOtp };
      await api.post("/auth/resend-otp", payload);
      alert("OTP resent successfully!");
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        alert(error.response?.data?.message || "Failed to resend OTP");
      }
    }
  };

  return (
    <div className="font-display transition-colors duration-300 antialiased">
      <main className="relative h-screen w-full flex justify-center p-4 py-10 bg-gray-900 overflow-y-auto no-scrollbar">
        {/* Liquid Chrome Background */}
        <div className="fixed inset-0 z-0">
          <LiquidChrome
            baseColor={[0.1, 0.2, 0.1]}
            speed={0.4}
            amplitude={0.3}
            interactive={true}
          />
        </div>

        <div className="glass-card w-full max-w-md p-6 sm:p-8 md:p-10 rounded-3xl shadow-2xl relative z-10 transition-all duration-500 my-auto">

          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-black mb-2 transition-all">
              {step === "credentials" ? "Login" : "Enter OTP"}
            </h1>
            <p className="text-gray-600 text-sm">
              {step === "credentials"
                ? "Welcome back! Please enter your details."
                : (
                  <>
                    <span>We sent a code to {emailForOtp}</span>
                  </>
                )}
            </p>
          </div>

          {step === "credentials" ? (
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-5">
                  <div>
                    <label
                      className="block text-sm font-medium text-gray-700 mb-2"
                      htmlFor="identifier"
                    >
                      Username or Email
                    </label>
                    <input
                      id="identifier"
                      type="text"
                      placeholder="Enter your username or email"
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-1 focus:ring-primary focus:border-transparent transition-all outline-none text-gray-900 placeholder-gray-500"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label
                      className="block text-sm font-medium text-gray-700 mb-2"
                      htmlFor="password"
                    >
                      Password
                    </label>
                    <div className="relative">
                      <input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-1 focus:ring-primary focus:border-transparent transition-all outline-none text-gray-900 placeholder-gray-500"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>
                  </div>
              </div>

              <div className="flex items-center justify-between text-sm py-1">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <span className="text-blue-600">Remember me</span>
                </label>
                <span
                  onClick={() => navigate("/forgot-password")}
                  className="hover:underline font-medium cursor-pointer text-red-500"
                >
                  Forgot password?
                </span>
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-primary hover:bg-emerald-600 text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-primary/30 flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-current"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Loading...
                  </span>
                ) : (
                  <>
                    <span>Next</span>
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        d="M14 5l7 7m0 0l-7 7m7-7H3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                      ></path>
                    </svg>
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <div>
                <label
                  className="block text-sm font-medium text-gray-700 mb-2"
                  htmlFor="otp"
                >
                  One-Time Password
                </label>
                <input
                  id="otp"
                  type="text"
                  placeholder="Enter 6-digit OTP" // Assuming 6 digits
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none text-gray-900 placeholder-gray-500 text-center tracking-widest text-lg"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                />
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-primary hover:bg-emerald-600 text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-primary/30 flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-current"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Verifying...
                  </span>
                ) : (
                  <>
                    <span>Verify & Login</span>
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                      ></path>
                    </svg>
                  </>
                )}
              </button>

              <div className="flex flex-col gap-3 mt-4">
                <button
                  type="button"
                  onClick={handleResendOtp}
                  className="w-full py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors cursor-pointer"
                >
                  Resend OTP
                </button>

                <button
                  type="button"
                  onClick={() => setStep("credentials")}
                  className="text-gray-500 hover:text-gray-700 text-sm hover:underline cursor-pointer"
                >
                  Back to Login
                </button>
              </div>
            </form>
          )}

          <div className="mt-8 pt-8 border-t border-gray-200/50 text-center">
            <p className="hover:underline text-gray-600">
              Don't have an account?
              <span
                className="text-green-500 font-bold cursor-pointer"
                onClick={() => navigate("/signup")}
              >
                Sign Up
              </span>
            </p>
          </div>
        </div>

        <div className="absolute bottom-6 left-0 right-0 text-center">
          <p className="text-white/60 text-sm">
            © 2026 Premium Web App. All rights reserved.
          </p>
        </div>
      </main>
    </div>
  );
};

export default Login;
