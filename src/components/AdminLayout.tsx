import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { LogOut, Calendar, Briefcase } from "lucide-react";
import { toast } from "sonner";
export default function AdminLayout() {
    const navigate = useNavigate();
    const location = useLocation();

    const API_URL = "https://grad-6h2k.onrender.com/";
    const handleLogout = async () => {
        try {
            const response = await fetch(`${API_URL}/api/admin/logout`, {
                method: "POST",
                credentials: "include"
            });

            if (response.ok) {
                toast.success("Signed out successfully.");
                navigate("/");
            } else {
                toast.error("Failed to sign out cleanly.");
            }
        } catch (error) {
            console.error("Logout error:", error);
            navigate("/");
        }
    };


    const isActive = (path: string) => location.pathname === path;

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">

            <nav className="bg-white border-b border-slate-200 shrink-0">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">


                        <div className="flex items-center space-x-8">
                            <div className="flex items-center">

                                <span className="font-bold text-xl text-slate-900 tracking-tight">Ministry of Education Admin Portal
                                </span>
                            </div>


                            <div className="hidden md:flex space-x-2">
                                <button
                                    onClick={() => navigate("/admin/dashboard")}
                                    className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive("/admin/dashboard")
                                        ? "bg-orange-50 text-orange-700"
                                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                                        }`}
                                >
                                    <Calendar className="h-4 w-4 mr-2" />
                                    Bookings
                                </button>
                                <button
                                    onClick={() => navigate("/admin/services")}
                                    className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive("/admin/services")
                                        ? "bg-orange-50 text-orange-700"
                                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                                        }`}
                                >
                                    <Briefcase className="h-4 w-4 mr-2" />
                                    Services
                                </button>
                            </div>
                        </div>


                        <button
                            onClick={handleLogout}
                            className="flex items-center text-sm font-medium text-red-600 hover:text-red-800 transition-colors"
                        >
                            <LogOut className="h-4 w-4 mr-2" />
                            Sign Out
                        </button>
                    </div>
                </div>
            </nav>

            <div className="flex-1">
                <Outlet />
            </div>

        </div>
    );
}