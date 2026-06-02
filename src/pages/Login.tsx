import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { 
  Loader2, Lock, Mail, AlertCircle, Shield, GraduationCap, ArrowLeft, User, Hash 
} from "lucide-react";

const API_URL = "http://localhost:3000";

type RoleState = "selection" | "admin" | "student";
type StudentMode = "login" | "register";

export default function AuthGateway() {
  const navigate = useNavigate();
  
  const [role, setRole] = useState<RoleState>("selection");
  const [studentMode, setStudentMode] = useState<StudentMode>("login");
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");

  
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const checkExistingSession = async () => {
      try {
        const adminRes = await fetch(`${API_URL}/api/admin/verify`, { credentials: "include" });
        if (adminRes.ok) return navigate("/admin/dashboard");

        const studentRes = await fetch(`${API_URL}/api/student/verify`, { credentials: "include" });
        if (studentRes.ok) return navigate("/booking");
      } catch (error) {
        //no need to do anything just check
      }
    };
    checkExistingSession();
  }, [navigate]);

  const resetForm = () => {
    setEmail(""); setPassword(""); setFullName(""); setErrorMessage("");
  };

  const handleRoleSelect = (selectedRole: RoleState) => {
    resetForm();
    setRole(selectedRole);
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!email || !password) return setErrorMessage("Please fill in both email and password.");

    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", 
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Invalid credentials.");

      toast.success("Welcome back to the Admin Dashboard!");
      navigate("/admin/dashboard");
      
    } catch (error: any) {
      setErrorMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStudentAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    const endpoint = studentMode === "login" ? "/api/student/login" : "/api/student/register";
    
    if (!email || !password) return setErrorMessage("Email and password are required.");
    if (studentMode === "register" && (!fullName)) {
      return setErrorMessage("Please fill out all registration fields.");
    }

    setIsLoading(true);
    try {
      const payload = studentMode === "login" 
        ? { email, password }
        : { full_name: fullName, email, password };

      const response = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", 
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Authentication failed.");

      if (studentMode === "register") {
        toast.success("Registration successful! Please log in.");
        setStudentMode("login");
        setPassword(""); 
      } else {
        toast.success("Welcome to the Student Portal!");
        navigate("/booking"); 
      }
      
    } catch (error: any) {
      setErrorMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (role === "selection") {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-slate-900 tracking-tight">EduStream Portal</h2>
          <p className="mt-2 text-sm text-slate-600">Please select your portal access level</p>
        </div>
        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow-xl shadow-slate-200/50 sm:rounded-xl sm:px-10 border border-slate-100 space-y-4">
            <button onClick={() => handleRoleSelect("student")} className="w-full flex items-center p-6 border-2 border-slate-200 rounded-xl hover:border-orange-600 hover:bg-orange-50 transition-all group">
              <div className="bg-orange-100 p-3 rounded-full group-hover:bg-orange-200 transition-colors">
                <GraduationCap className="h-8 w-8 text-orange-700" />
              </div>
              <div className="ml-4 text-left">
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-orange-700 transition-colors">Student Access</h3>
                <p className="text-sm text-slate-500">Apply for services and track applications</p>
              </div>
            </button>
            <button onClick={() => handleRoleSelect("admin")} className="w-full flex items-center p-6 border-2 border-slate-200 rounded-xl hover:border-slate-800 hover:bg-slate-50 transition-all group">
              <div className="bg-slate-100 p-3 rounded-full group-hover:bg-slate-200 transition-colors">
                <Shield className="h-8 w-8 text-slate-700" />
              </div>
              <div className="ml-4 text-left">
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-slate-900 transition-colors">Admin Access</h3>
                <p className="text-sm text-slate-500">Manage services and review applications</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center relative">
        <button onClick={() => handleRoleSelect("selection")} className="absolute left-0 top-1 text-slate-400 hover:text-slate-700 flex items-center text-sm font-medium transition-colors">
          <ArrowLeft className="h-4 w-4 mr-1" /> Back
        </button>
        <h2 className="mt-6 text-3xl font-extrabold text-slate-900 tracking-tight">
          {role === "admin" ? "Admin Login" : "Student Portal"}
        </h2>
      </div>
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl shadow-slate-200/50 sm:rounded-xl sm:px-10 border border-slate-100">
          
          {role === "student" && (
            <div className="flex bg-slate-100 p-1 rounded-lg mb-6">
              <button type="button" className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${studentMode === "login" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`} onClick={() => { setStudentMode("login"); setErrorMessage(""); }}>Log In</button>
              <button type="button" className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${studentMode === "register" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`} onClick={() => { setStudentMode("register"); setErrorMessage(""); }}>Register</button>
            </div>
          )}

          <form className="space-y-6" onSubmit={role === "admin" ? handleAdminLogin : handleStudentAuth}>
            {errorMessage && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md flex items-center">
                <AlertCircle className="h-5 w-5 text-red-500 mr-3 shrink-0" />
                <p className="text-sm text-red-700 font-medium">{errorMessage}</p>
              </div>
            )}

            {role === "student" && studentMode === "register" && (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Full Name</label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><User className="h-5 w-5 text-slate-400" /></div>
                    <input type="text" disabled={isLoading} className="block w-full pl-10 sm:text-sm border-slate-300 rounded-md py-2.5 border outline-none focus:ring-orange-600 focus:border-orange-600" placeholder="John Doe" value={fullName} onChange={(e) => setFullName(e.target.value)} />
                  </div>
                </div>
                <div>
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700">Email address</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Mail className="h-5 w-5 text-slate-400" /></div>
                <input type="email" disabled={isLoading} className="block w-full pl-10 sm:text-sm border-slate-300 rounded-md py-2.5 border outline-none focus:ring-orange-600 focus:border-orange-600" placeholder={role === "admin" ? "admin@university.edu" : "student@university.edu"} value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Password</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Lock className="h-5 w-5 text-slate-400" /></div>
                <input type="password" disabled={isLoading} className="block w-full pl-10 sm:text-sm border-slate-300 rounded-md py-2.5 border outline-none focus:ring-orange-600 focus:border-orange-600" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
            </div>

            <button type="submit" disabled={isLoading} className={`w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white transition-all disabled:opacity-70 disabled:cursor-not-allowed ${role === "admin" ? "bg-slate-800 hover:bg-slate-900" : "bg-orange-600 hover:bg-orange-700"}`}>
              {isLoading ? <><Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" /> Processing...</> : (role === "admin" ? "Admin Sign In" : studentMode === "login" ? "Student Sign In" : "Create Account")}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}