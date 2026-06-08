import { useEffect, useState, type JSX } from "react";
import { Navigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

const API_URL = "https://grad-6h2k.onrender.com:3000";

export function AdminRoute({ children }: { children: JSX.Element }) {
  const [isAuth, setIsAuth] = useState<boolean | null>(null);

  useEffect(() => {
    fetch(`${API_URL}/api/admin/verify`, { credentials: "include" })
      .then(res => {
        if (!res.ok) throw new Error();
        setIsAuth(true);
      })
      .catch(() => {
        toast.error("Admin access required.");
        setIsAuth(false);
      });
  }, []);

  if (isAuth === null) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin h-10 w-10 text-slate-800" /></div>;
  return isAuth ? children : <Navigate to="/" replace />;
}

export function StudentRoute({ children }: { children: JSX.Element }) {
  const [isAuth, setIsAuth] = useState<boolean | null>(null);

  useEffect(() => {
    fetch(`${API_URL}/api/student/verify`, { credentials: "include" })
      .then(res => {
        if (!res.ok) throw new Error();
        setIsAuth(true);
      })
      .catch(() => {
        toast.error("Student session expired. Please log in.");
        setIsAuth(false);
      });
  }, []);

  if (isAuth === null) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin h-10 w-10 text-orange-600" /></div>;
  return isAuth ? children : <Navigate to="/" replace />;
}