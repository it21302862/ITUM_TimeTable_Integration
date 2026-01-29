import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // TODO: Replace with actual API endpoint
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error("Invalid email or password");
      }

      const data = await response.json();

      if (data.token) {
        localStorage.setItem("token", data.token);
        if (rememberMe) {
          localStorage.setItem("email", email);
        }
        navigate("/");
      }
    } catch (err) {
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-background-light dark:bg-background-dark font-display">
      {/* Background Layer */}
      <div className="absolute inset-0 z-0">
        <div
          className="w-full h-full bg-cover bg-center"
          style={{
            backgroundImage:
              'url("https://www.dgfivei.com/wp-content/uploads/2023/02/03f.jpg")',
          }}
        ></div>
        <div
          className="absolute inset-0"
          style={{
            backgroundColor: "rgba(19, 91, 236, 0.75)",
            mixBlendMode: "multiply",
          }}
        ></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 py-12">
        {/* Login Card Container */}
        <div className="w-full max-w-[480px] flex flex-col items-stretch justify-start rounded-xl shadow-2xl bg-white dark:bg-background-dark p-8 md:p-10">
          {/* University Branding */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center mb-4 text-white shadow-lg">
              <span className="material-symbols-outlined text-4xl">school</span>
            </div>
            <h1 className="text-2xl font-bold text-[#0d121b] dark:text-white text-center">
              Faculty Portal
            </h1>
            <p className="text-[#4c669a] dark:text-gray-400 text-sm font-medium mt-1">
              Timetable Management System
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-600 rounded-lg">
              <p className="text-red-700 dark:text-red-100 text-sm">{error}</p>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="flex flex-col gap-5">
            {/* Email Field */}
            <label className="flex flex-col w-full">
              <p className="text-[#0d121b] dark:text-gray-200 text-sm font-medium leading-normal pb-1.5">
                Email Address
              </p>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                  <span className="material-symbols-outlined text-[20px]">
                    mail
                  </span>
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="form-input block w-full pl-10 resize-none overflow-hidden rounded-lg text-[#0d121b] dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/20 border border-[#cfd7e7] dark:border-gray-700 bg-white dark:bg-gray-800 focus:border-primary h-12 placeholder:text-[#4c669a] p-[15px] text-base font-normal leading-normal"
                  placeholder="name@university.edu"
                />
              </div>
            </label>

            {/* Password Field */}
            <label className="flex flex-col w-full">
              <div className="flex justify-between items-center pb-1.5">
                <p className="text-[#0d121b] dark:text-gray-200 text-sm font-medium leading-normal">
                  Password
                </p>
              </div>
              <div className="relative flex w-full flex-1 items-stretch">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                  <span className="material-symbols-outlined text-[20px]">
                    lock
                  </span>
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="form-input block w-full pl-10 pr-10 resize-none overflow-hidden rounded-lg text-[#0d121b] dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/20 border border-[#cfd7e7] dark:border-gray-700 bg-white dark:bg-gray-800 focus:border-primary h-12 placeholder:text-[#4c669a] p-[15px] text-base font-normal leading-normal"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-[#4c669a] cursor-pointer hover:text-primary transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
            </label>

            {/* Options */}
            <div className="flex items-center justify-between mt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-[#cfd7e7] text-primary focus:ring-primary"
                />
                <span className="text-sm text-[#4c669a] dark:text-gray-400">
                  Remember me
                </span>
              </label>
              <a
                href="#"
                className="text-primary text-sm font-medium hover:underline"
              >
                Forgot Password?
              </a>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full items-center justify-center rounded-lg h-12 px-4
             bg-blue-600 text-white font-semibold shadow-md
             hover:bg-blue-700 transition
             disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Signing In..." : "Sign In"}
            </button>
          </form>

          {/* Footer Links inside Card */}
          <div className="mt-8 pt-6 border-t border-[#f0f2f5] dark:border-gray-800 flex flex-col items-center gap-3">
            <p className="text-[#4c669a] dark:text-gray-400 text-sm">
              Don't have an account yet?
            </p>
            <button className="flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-blue-100 text-blue-600 text-sm font-semibold leading-normal hover:bg-primary/20 transition-colors">
              <span className="truncate">Create Faculty Account</span>
            </button>
          </div>
        </div>

        {/* Page Footer */}
        <div className="mt-8 flex flex-col items-center gap-2">
          <p className="text-white/80 text-xs font-medium">
            © 2024 Global University Systems. All Rights Reserved.
          </p>
          <div className="flex gap-4 text-white/60 text-xs">
            <a href="#" className="hover:text-white">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-white">
              Support Desk
            </a>
            <a href="#" className="hover:text-white">
              API Docs
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
