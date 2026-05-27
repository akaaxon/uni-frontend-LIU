import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Loader2, Lock, Mail, AlertCircle } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const [isLoading, setIsLoading] = useState(false);
  // NEW: State to prevent the form from flashing while checking auth
  const [isCheckingAuth, setIsCheckingAuth] = useState(true); 
  const [errorMessage, setErrorMessage] = useState("");
  
  // NEW: Check if already logged in when the page loads
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await fetch(`${API_URL}/api/admin/verify`, {
          credentials: "include", // Sends the httpOnly cookie to be checked
        });

        if (response.ok) {
          // Cookie is valid! Send them straight to the dashboard.
          navigate("/admin/dashboard");
        } else {
          // Cookie is missing or expired, reveal the login form.
          setIsCheckingAuth(false);
        }
      } catch (error) {
        // If the server is offline, just show the login form
        setIsCheckingAuth(false);
      }
    };

    checkAuthStatus();
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!email || !password) {
      setErrorMessage("Please fill in both email and password.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", 
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || "Invalid email or password.");
      }

      toast.success("Welcome back!");
      navigate("/admin/dashboard");
      
    } catch (error: any) {
      setErrorMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // NEW: Show a full-page loader while checking the cookie so the form doesn't flash
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center">
        <Loader2 className="animate-spin h-10 w-10 text-orange-600 mb-4" />
        <p className="text-slate-500 font-medium text-sm">Verifying session...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <h2 className="mt-6 text-3xl font-extrabold text-slate-900 tracking-tight">
          Ministry of Education Admin Portal
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl shadow-slate-200/50 sm:rounded-xl sm:px-10 border border-slate-100">
          
          <form className="space-y-6" onSubmit={handleLogin}>
            
            {errorMessage && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md flex items-center">
                <AlertCircle className="h-5 w-5 text-red-500 mr-3" />
                <p className="text-sm text-red-700 font-medium">{errorMessage}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700">Email address</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="email"
                  disabled={isLoading}
                  className="block w-full pl-10 sm:text-sm border-slate-300 rounded-md py-2.5 border outline-none focus:ring-orange-600 focus:border-orange-600 transition-colors"
                  placeholder="admin@university.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Password</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="password"
                  disabled={isLoading}
                  className="block w-full pl-10 sm:text-sm border-slate-300 rounded-md py-2.5 border outline-none focus:ring-orange-600 focus:border-orange-600 transition-colors"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-700 hover:bg-orange-800 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <><Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" /> Authenticating...</>
              ) : (
                "Sign in"
              )}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}