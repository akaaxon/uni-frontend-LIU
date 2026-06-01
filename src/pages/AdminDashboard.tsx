import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Loader2, AlertCircle, RefreshCw } from "lucide-react";
import BookingModal, { type Booking } from "../components/BookingModal";

const API_URL = "http://localhost:3000";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  const fetchBookings = async () => {
    setIsLoading(true);
    setPageError(null); 

    try {
      const response = await fetch(`${API_URL}/admin/bookings`, {
        credentials: "include" 
      });

      if (response.status === 401 || response.status === 403) {
        toast.error("Session expired. Please log in again.", {id: "auth-error"});
        navigate("/admin/login");
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to communicate with the server.");
      }

      const data = await response.json();
      
      // FLATTEN THE SUPABASE NESTED OBJECTS HERE
      const formattedBookings = (data.result || []).map((b: any) => ({
        id: b.id,
        student_name: b.students?.full_name || "Unknown",
        student_email: b.students?.email || "Unknown",
        service_name: b.services?.name || "Unknown",
        appointment_time: b.appointment_time,
        document_urls: b.document_urls,
        status: b.status,
      }));

      setBookings(formattedBookings);
      
    } catch (error: any) {
      setPageError(error.message || "Could not connect to the database. Please check your connection.");
      toast.error("Failed to load bookings", {id: "fetch-bookings-error"});
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const openReviewModal = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsModalOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {pageError ? (
          <div className="bg-white rounded-xl shadow-sm border border-red-200 p-10 text-center flex flex-col items-center mt-10">
            <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
            <h2 className="text-xl font-bold text-slate-900 mb-2">Something went wrong</h2>
            <p className="text-slate-600 mb-6">{pageError}</p>
            <button 
              onClick={fetchBookings}
              className="flex items-center px-4 py-2 bg-slate-900 text-white rounded-md hover:bg-slate-800 transition-colors font-medium"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </button>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-slate-900">Booking Requests</h1>
              <button 
                onClick={fetchBookings} 
                disabled={isLoading}
                className="text-sm text-orange-600 hover:text-orange-800 font-medium disabled:opacity-50"
              >
                Refresh Data
              </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              {isLoading ? (
                <div className="p-10 flex justify-center items-center text-slate-400">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : bookings.length === 0 ? (
                <div className="p-10 text-center text-slate-500">
                  No bookings found. You're all caught up!
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Student Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Service</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date & Time</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Action</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                      {bookings.map((booking) => (
                        <tr key={booking.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-slate-900">{booking.student_name}</div>
                            <div className="text-sm text-slate-500">{booking.student_email}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                            {booking.service_name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                            {new Date(booking.appointment_time).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${getStatusColor(booking.status)}`}>
                              {booking.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button 
                              onClick={() => openReviewModal(booking)}
                              className="text-orange-600 hover:text-orange-900 font-medium bg-orange-50 px-3 py-1 rounded-md"
                            >
                              Review
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </main>

      <BookingModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        booking={selectedBooking} 
        onRefresh={fetchBookings} 
      />
    </div>
  );
}