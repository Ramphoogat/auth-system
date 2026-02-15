import React, { useState, type ChangeEvent } from "react";
import api from "../api/axios";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import LightRays from "../components/LightRays";
import ThemeToggle from "../components/ThemeToggle";

const Signup = () => {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [termsAccepted, setTermsAccepted] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Handle email change and auto-take the username
  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
    const emailValue = e.target.value;
    setEmail(emailValue);

    // Extract the part before @ and replace dots with spaces
    if (emailValue.includes("@")) {
      const namePart = emailValue.split("@")[0];
      const usernameValue = namePart.replace(/\./g, " ");
      setUsername(usernameValue);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!termsAccepted) {
      alert("Please accept the Terms of Service to continue.");
      return;
    }

    setIsLoading(true);
    try {
      await api.post("/auth/signup", {
        name,
        username,
        email,
        password,
        // No role - backend will default to 'user'
      });
      alert(`Signup successful! Check your email for OTP.`);
      navigate("/verify-otp", {
        state: {
          email,
        },
      });
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        alert(error.response?.data?.message || "Signup failed");
      } else {
        alert("An unexpected error occurred");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="font-display antialiased m-0 p-0 flex min-h-screen bg-gray-900 relative py-12 md:py-20 overflow-y-auto no-scrollbar">
      {/* Theme Toggle in Corner */}
      <div className="fixed top-6 right-6 z-20">
        <ThemeToggle />
      </div>

      {/* LightRays Background */}
      <div className="fixed inset-0 z-0">
        <LightRays
          raysOrigin="top-center"
          raysColor="#ffffff"
          raysSpeed={1}
          lightSpread={0.5}
          rayLength={3}
          followMouse={true}
          mouseInfluence={0.1}
          noiseAmount={0}
          distortion={0}
          className="custom-rays"
          pulsating={false}
          fadeDistance={1}
          saturation={1}
        />
      </div>
      <div className="w-full max-w-md px-4 z-10 mx-auto my-auto">
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-white/40 dark:border-gray-700/50 shadow-2xl rounded-[32px] p-6 sm:p-8 md:p-10 transition-all duration-500 relative">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Signup</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Create your account to get started
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="sr-only" htmlFor="name">
                Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                placeholder="Name"
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white/50 dark:bg-gray-900/50 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200 outline-none"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <label className="sr-only" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="Email"
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white/50 dark:bg-gray-900/50 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200 outline-none"
                value={email}
                onChange={handleEmailChange}
              />
            </div>
            <div>
              <label className="sr-only" htmlFor="username">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                placeholder="Username"
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white/50 dark:bg-gray-900/50 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200 outline-none"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <div>
              <label className="sr-only" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="Password"
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white/50 dark:bg-gray-900/50 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200 outline-none"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="terms"
                  name="terms"
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-blue-500 focus:ring-blue-500 transition-all duration-200 cursor-pointer"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                />
              </div>
              <div className="ml-3 text-xs">
                <label
                  className="text-gray-500 dark:text-gray-400 cursor-pointer"
                  htmlFor="terms"
                >
                  I agree to the{" "}
                  <span
                    className="text-blue-500 hover:underline cursor-pointer"
                    onClick={() => navigate("/terms-of-service")}
                  >
                    Terms of Service
                  </span>{" "}
                  and{" "}
                  <span
                    className="text-blue-500 hover:underline cursor-pointer"
                    onClick={() => navigate("/privacy-policy")}
                  >
                    Privacy Policy
                  </span>
                  .
                </label>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg shadow-lg shadow-blue-500/30 active:scale-[0.98] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 mt-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!termsAccepted || isLoading}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                  Processing...
                </span>
              ) : (
                "Sign Up"
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Already have an account?
              <span
                className="text-emerald-500 hover:text-emerald-600 font-semibold transition-colors duration-200 cursor-pointer ml-1"
                onClick={() => navigate("/login")}
              >
                Login
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
