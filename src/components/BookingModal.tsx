import { useState } from "react";
import { X, Check, Ban, ExternalLink, Loader2 } from "lucide-react";
import { toast } from "sonner";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export type Booking = {
  id: string;
  student_name: string;
  student_email: string;
  service_name: string;
  appointment_time: string;
  document_urls: string[];
  status: 'pending' | 'approved' | 'rejected';
};

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking | null;
  onRefresh: () => void; 
};

export default function BookingModal({ isOpen, onClose, booking, onRefresh }: ModalProps) {
  const [rejectionReason, setRejectionReason] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen || !booking) return null;

  const handleUpdateStatus = async (newStatus: 'approved' | 'rejected') => {
    setIsProcessing(true);
    
    try {
      const endpoint = newStatus === 'approved' 
        ? `${API_URL}/admin/approve/${booking.id}` 
        : `${API_URL}/admin/reject/${booking.id}`;

      const bodyData = newStatus === 'rejected' 
        ? JSON.stringify({ reason: rejectionReason }) 
        : null;

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // Enables the browser to send the HTTP cookie
        body: bodyData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update booking.");
      }

      toast.success(`Booking ${newStatus} successfully!`);
      setRejectionReason(""); 
      onRefresh(); 
      onClose();
      
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        
        <div className="flex justify-between items-center p-5 border-b border-slate-100 bg-slate-50">
          <h3 className="text-lg font-bold text-slate-900">Review Booking</h3>
          <button onClick={onClose} disabled={isProcessing} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-slate-500 font-medium">Student Name</p>
              <p className="text-slate-900 font-semibold">{booking.student_name}</p>
            </div>
            <div>
              <p className="text-slate-500 font-medium">Student Email</p>
              <p className="text-slate-900 font-semibold">{booking.student_email}</p>
            </div>
            <div>
              <p className="text-slate-500 font-medium">Service Requested</p>
              <p className="text-slate-900 font-semibold">{booking.service_name}</p>
            </div>
            <div>
              <p className="text-slate-500 font-medium">Date & Time</p>
              <p className="text-slate-900 font-semibold">
                {new Date(booking.appointment_time).toLocaleString()}
              </p>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100">
            <p className="text-slate-500 font-medium text-sm mb-2">Uploaded Documents</p>
            <div className="space-y-2">
              {booking.document_urls?.map((url, index) => (
                <a
                  key={index}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-sm text-orange-600 hover:text-orange-800 bg-orange-50 p-2 rounded-md transition-colors"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Document {index + 1}
                </a>
              ))}
              {(!booking.document_urls || booking.document_urls.length === 0) && (
                <p className="text-sm text-slate-400 italic">No documents attached.</p>
              )}
            </div>
          </div>

          {booking.status === 'pending' && (
            <div className="pt-2 border-t border-slate-100">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Rejection Reason (Required to Reject)
              </label>
              <textarea
                rows={3}
                className="w-full border-slate-300 rounded-md shadow-sm border p-2 text-sm outline-none focus:ring-orange-600 focus:border-orange-600"
                placeholder="Explain why this is being rejected (sent via email)..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                disabled={isProcessing}
              />
            </div>
          )}
        </div>

        {booking.status === 'pending' && (
          <div className="p-5 border-t border-slate-100 bg-slate-50 flex gap-3">
            <button
              onClick={() => handleUpdateStatus('rejected')}
              disabled={isProcessing || rejectionReason.trim() === ""}
              className="flex-1 flex justify-center items-center py-2 px-4 border border-red-200 rounded-md text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? <Loader2 className="animate-spin h-4 w-4" /> : <Ban className="h-4 w-4 mr-2" />}
              Reject
            </button>
            <button
              onClick={() => handleUpdateStatus('approved')}
              disabled={isProcessing}
              className="flex-1 flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 transition-colors disabled:opacity-70"
            >
              {isProcessing ? <Loader2 className="animate-spin h-4 w-4" /> : <Check className="h-4 w-4 mr-2" />}
              Approve
            </button>
          </div>
        )}
      </div>
    </div>
  );
}