import { useState, useEffect } from "react";
import { toast } from "sonner";
import { 
  Calendar, 
  Clock, 
  UploadCloud, 
  Loader2, 
  CheckCircle2, 
  FileText,
  X,
  ShieldAlert,
  ChevronDown,
  LogOut
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const API_URL =  "http://localhost:3000";

type Service = { 
  id: string; 
  name: string; 
  description: string;
  required_documents: string[];
  available_times: string[];
};

type TimeSlot = { 
  id: string; 
  time: string; 
  available: boolean;
};

export default function StudentBooking() {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoadingServices, setIsLoadingServices] = useState(true);

  const [selectedServiceId, setSelectedServiceId] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  
  const [files, setFiles] = useState<Record<string, File>>({});
 
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);

  const selectedService = services.find(s => s.id === selectedServiceId) || null;
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const response = await fetch(`${API_URL}/api/student/logout`, {
        method: "POST",
        credentials: "include"
      });
      
      if (response.ok) {
        toast.success("Logged out successfully");
        navigate("/");
      }
    } catch (error) {
      toast.error("Logout failed");
    }
  };

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await fetch(`${API_URL}/api/services`);
        const data = await response.json();
        
        if (!response.ok) throw new Error(data.message || "Failed to load services");
        setServices(data.result);
      } catch (error: any) {
        toast.error(error.message);
      } finally {
        setIsLoadingServices(false);
      }
    };

    fetchServices();
  }, []);

  useEffect(() => {
    if (!selectedDate || !selectedService) {
      setAvailableSlots([]);
      return;
    }
    
    const dynamicSlots = (selectedService.available_times || []).map((timeString, index) => ({
      id: `t${index}`,
      time: timeString,
      available: true 
    }));

    setAvailableSlots(dynamicSlots);
    setSelectedTime(""); 
  }, [selectedDate, selectedService]);

  useEffect(() => {
    setFiles({});
  }, [selectedServiceId]);

  const handleFileChange = (docName: string, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFiles((prev) => ({
        ...prev,
        [docName]: selectedFile
      }));
    }
  };

  const removeFile = (docName: string) => {
    setFiles((prev) => {
      const newFiles = { ...prev };
      delete newFiles[docName];
      return newFiles;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedService || !selectedDate || !selectedTime) {
      return toast.error("Please fill out all required fields.");
    }
     
    for (const doc of selectedService.required_documents) {
      if (!files[doc]) {
        return toast.error(`Please upload the required document: ${doc.replace(/_/g, " ")}`);
      }
    }

    setIsSubmitting(true);

    try {
      const uploadedUrls: string[] = [];

      for (const doc of selectedService.required_documents) {
        const file = files[doc];
        const formData = new FormData();
        formData.append("document", file); 

        const uploadRes = await fetch(`${API_URL}/api/student/upload`, {
          method: "POST",
          credentials: "include", 
          body: formData,
        });

        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) throw new Error(uploadData.message || `Failed to upload ${doc}`);
        
        uploadedUrls.push(uploadData.url);
      }

      const appointmentTimestamp = new Date(`${selectedDate} ${selectedTime}`).toISOString();
      
      const bookingRes = await fetch(`${API_URL}/api/student/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          service_id: selectedService.id,
          appointment_time: appointmentTimestamp,
          document_urls: uploadedUrls
        }),
      });

      const bookingData = await bookingRes.json();
      if (!bookingRes.ok) throw new Error(bookingData.message || "Failed to submit booking.");

      setIsSuccess(true);
      toast.success("Booking request submitted successfully!");

    } catch (error: any) {
      toast.error(error.message || "An error occurred during submission.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative">
        <div className="absolute top-4 right-4 z-50">
          <button 
            onClick={handleLogout}
            className="flex items-center px-4 py-2 text-sm font-medium text-slate-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors shadow-sm bg-white border border-slate-200"
          >
            <LogOut className="h-4 w-4 mr-2" />
            
          </button>
        </div>
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-10 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="h-10 w-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Request Submitted!</h2>
          <p className="text-slate-600 mb-8">
            Your booking request has been safely encrypted and sent to administration. You will receive an email update shortly.
          </p>
          <button
            onClick={() => {
              setIsSuccess(false);
              setSelectedServiceId("");
              setSelectedDate("");
              setFiles({});
            }}
            className="w-full py-3 px-4 bg-orange-600 hover:bg-orange-700 transition-colors text-white rounded-lg font-medium"
          >
            Make Another Booking
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 relative">
      <div className="absolute top-4 right-4 z-50">
        <button 
          onClick={handleLogout}
          className="flex items-center px-4 py-2 text-sm font-medium text-slate-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors shadow-sm bg-white border border-slate-200"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </button>
      </div>

      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Service Booking Portal</h1>
          <p className="mt-2 text-slate-600">Select an application type, schedule a slot, and attach required credentials.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 sm:p-8">
            <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center">
              <FileText className="h-5 w-5 mr-2 text-orange-600" />
              1. Select a Service *
            </h2>
            
            {isLoadingServices ? (
              <div className="flex justify-center py-4">
                <Loader2 className="animate-spin h-6 w-6 text-orange-600" />
              </div>
            ) : services.length === 0 ? (
              <div className="text-center py-6 bg-slate-50 rounded-lg border border-dashed border-slate-300">
                <ShieldAlert className="h-6 w-6 text-slate-400 mx-auto mb-2" />
                <p className="text-sm text-slate-500">No services are currently active. Please contact administration.</p>
              </div>
            ) : (
              <div className="relative">
                <select
                  required
                  value={selectedServiceId}
                  onChange={(e) => setSelectedServiceId(e.target.value)}
                  className="block w-full appearance-none bg-white border border-slate-300 text-slate-900 py-3 px-4 pr-8 rounded-lg outline-none focus:ring-2 focus:ring-orange-600 focus:border-transparent transition-all cursor-pointer"
                >
                  <option value="" disabled>-- Select an available service --</option>
                  {services.map((service) => (
                    <option key={service.id} value={service.id}>
                      {service.name}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                  <ChevronDown className="h-4 w-4" />
                </div>
              </div>
            )}

            {selectedService && selectedService.description && (
              <div className="mt-4 p-4 bg-orange-50 border border-orange-100 rounded-lg">
                <p className="text-sm text-orange-800">{selectedService.description}</p>
              </div>
            )}
          </div>

          <div className={`bg-white rounded-xl shadow-sm border border-slate-200 p-6 sm:p-8 transition-opacity ${!selectedService ? 'opacity-50 pointer-events-none' : ''}`}>
            <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-orange-600" />
              2. Choose Date & Time *
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Select Date</label>
                <input
                  type="date"
                  required
                  min={new Date().toISOString().split("T")[0]}
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="block w-full border-slate-300 rounded-lg py-3 px-4 border outline-none focus:ring-2 focus:ring-orange-600 focus:border-transparent text-sm transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Available Time</label>
                {!selectedDate ? (
                  <div className="text-sm text-slate-500 italic p-3 bg-slate-50 rounded-lg border border-slate-200 text-center">
                    Please select a date first
                  </div>
                ) : availableSlots.length === 0 ? (
                  <div className="text-sm text-red-500 italic p-3 bg-red-50 rounded-lg border border-red-200 text-center">
                    No slots available for this service.
                  </div>
                ) : (
                  <div className="relative">
                    <select
                      required
                      value={selectedTime}
                      onChange={(e) => setSelectedTime(e.target.value)}
                      className="block w-full appearance-none bg-white border border-slate-300 text-slate-900 py-3 px-4 pr-8 rounded-lg outline-none focus:ring-2 focus:ring-orange-600 focus:border-transparent transition-all cursor-pointer"
                    >
                      <option value="" disabled>-- Select a time slot --</option>
                      {availableSlots.map((slot) => (
                        <option key={slot.id} value={slot.time} disabled={!slot.available}>
                          {slot.time} {!slot.available && "(Booked)"}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                      <Clock className="h-4 w-4" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className={`bg-white rounded-xl shadow-sm border border-slate-200 p-6 sm:p-8 transition-opacity ${!selectedService ? 'opacity-50 pointer-events-none' : ''}`}>
            <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center">
              <UploadCloud className="h-5 w-5 mr-2 text-orange-600" />
              3. Upload Required Documents *
            </h2>
            
            {!selectedService ? (
               <div className="text-sm text-slate-500 italic p-4 bg-slate-50 rounded-lg border border-slate-200 text-center">
                 Select a service above to view document requirements.
               </div>
            ) : selectedService.required_documents.length === 0 ? (
                <div className="text-sm text-green-600 italic p-4 bg-green-50 rounded-lg border border-green-200 text-center">
                 No documents required for this service.
               </div>
            ) : (
              <div className="space-y-6">
                {selectedService.required_documents.map((docName, index) => {
                  const uploadedFile = files[docName];
                  return (
                    <div key={index} className="border border-slate-200 rounded-lg p-4 bg-slate-50/50">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="text-sm font-bold text-slate-900 capitalize">
                            {docName.replace(/_/g, " ")} <span className="text-red-500">*</span>
                          </h3>
                        </div>
                      </div>

                      {uploadedFile ? (
                        <div className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg shadow-sm">
                          <div className="flex items-center min-w-0">
                            <div className="p-2 bg-orange-100 rounded text-orange-600">
                              <FileText className="h-5 w-5" />
                            </div>
                            <div className="ml-3 truncate">
                              <p className="text-sm font-medium text-slate-900 truncate">{uploadedFile.name}</p>
                              <p className="text-xs text-slate-500">{(uploadedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                            </div>
                          </div>
                          <button 
                            type="button" 
                            onClick={() => removeFile(docName)}
                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                          >
                            <X className="h-5 w-5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center w-full">
                          <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-slate-300 border-dashed rounded-lg cursor-pointer bg-white hover:bg-slate-50 hover:border-orange-400 transition-colors">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                              <UploadCloud className="w-6 h-6 mb-2 text-slate-400" />
                              <p className="text-sm text-slate-600"><span className="font-medium text-orange-600">Click to upload</span></p>
                            </div>
                            <input 
                              type="file" 
                              className="hidden" 
                              onChange={(e) => handleFileChange(docName, e)} 
                            />
                          </label>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting || !selectedService}
              className="w-full sm:w-auto flex justify-center items-center py-3 px-8 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-orange-600 hover:bg-orange-700 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <><Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" /> Processing Uploads...</>
              ) : (
                "Confirm Booking"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}