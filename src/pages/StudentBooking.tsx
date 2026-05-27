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
} from "lucide-react";

type Service = { id: string; name: string; description: string };
type TimeSlot = { id: string; time: string; available: boolean };

const REQUIRED_DOCUMENTS = [
  { id: "university_id", label: "University ID Card" },
  { id: "transcript", label: "Academic Transcript" },
  { id: "supporting_doc", label: "Supporting Document" },
];

export default function StudentBooking() {
  const [selectedService, setSelectedService] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  
  // State is now an object mapping the document ID to the File
  const [files, setFiles] = useState<Record<string, File>>({});
 
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const [services, setServices] = useState<Service[]>([]);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);

  useEffect(() => {
    setServices([
      { id: "1", name: "Resume Review", description: "Get professional feedback on your CV." },
      { id: "2", name: "Mock Interview", description: "Practice technical and behavioral interviews." },
      { id: "3", name: "Career Counseling", description: "1-on-1 session to plan your career path." }
    ]);
  }, []);

  useEffect(() => {
    if (!selectedDate) {
      setAvailableSlots([]);
      return;
    }
    setAvailableSlots([
      { id: "t1", time: "09:00 AM", available: true },
      { id: "t2", time: "10:30 AM", available: false }, 
      { id: "t3", time: "01:00 PM", available: true },
      { id: "t4", time: "03:30 PM", available: true },
    ]);
    setSelectedTime(""); 
  }, [selectedDate]);


  const handleFileChange = (docId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFiles((prev) => ({
        ...prev,
        [docId]: selectedFile
      }));
    }
  };

  // Remove a specific document
  const removeFile = (docId: string) => {
    setFiles((prev) => {
      const newFiles = { ...prev };
      delete newFiles[docId];
      return newFiles;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedService || !selectedDate || !selectedTime) {
      return toast.error("Please fill out all required fields.");
    }
        // Check if all required documents are uploaded
    for (const doc of REQUIRED_DOCUMENTS) {
      if (!files[doc.id]) {
        return toast.error(`Please upload the required document: ${doc.label}`);
      }
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("service_id", selectedService);
      
      const appointmentTimestamp = new Date(`${selectedDate} ${selectedTime}`).toISOString();
      formData.append("appointment_time", appointmentTimestamp);

      Object.entries(files).forEach(([docId, file]) => {
       
        formData.append(docId, file);
      });

      // Mock network delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setIsSuccess(true);
      toast.success("Booking request submitted successfully!");

    } catch (error: any) {
      toast.error(error.message || "Failed to submit booking.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-10 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="h-10 w-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Request Submitted!</h2>
          <p className="text-slate-600 mb-8">
            Your booking request has been sent to the administration. You will receive an email once it has been reviewed.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="w-full py-3 px-4 bg-orange-600 hover:bg-orange-700 transition-colors text-white rounded-lg font-medium"
          >
            Make Another Booking
          </button>
          <button
            onClick={() => window.location.href = '/'}
            className="w-full py-3 px-4 mt-3 bg-slate-100 hover:bg-slate-200 transition-colors text-slate-700 rounded-lg font-medium"
          >
            Back to home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        
        <div className="text-center mb-10">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Student Booking Portal</h1>
          <p className="mt-2 text-slate-600">Schedule your session and upload required documents below.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          
          
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 sm:p-8">
            <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center">
              <FileText className="h-5 w-5 mr-2 text-orange-600" />
              1. Select a Service *
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {services.map((service) => (
                <div 
                  key={service.id}
                  onClick={() => setSelectedService(service.id)}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedService === service.id 
                      ? "border-orange-600 bg-orange-50" 
                      : "border-slate-200 hover:border-orange-300 bg-white"
                  }`}
                >
                  <h3 className={`font-bold ${selectedService === service.id ? "text-orange-900" : "text-slate-900"}`}>
                    {service.name}
                  </h3>
                  <p className={`text-sm mt-1 ${selectedService === service.id ? "text-orange-700" : "text-slate-500"}`}>
                    {service.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

      
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 sm:p-8">
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
                  className="block w-full border-slate-300 rounded-md py-2.5 px-3 border outline-none focus:ring-orange-600 focus:border-orange-600 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Available Times</label>
                {!selectedDate ? (
                  <div className="text-sm text-slate-500 italic p-3 bg-slate-50 rounded-md border border-slate-200 text-center">
                    Please select a date first
                  </div>
                ) : availableSlots.length === 0 ? (
                  <div className="text-sm text-red-500 italic p-3 bg-red-50 rounded-md border border-red-200 text-center">
                    No slots available on this date.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {availableSlots.map((slot) => (
                      <button
                        key={slot.id}
                        type="button"
                        disabled={!slot.available}
                        onClick={() => setSelectedTime(slot.time)}
                        className={`py-2 px-3 text-sm font-medium rounded-md border flex items-center justify-center transition-colors ${
                          !slot.available 
                            ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed line-through" 
                            : selectedTime === slot.time
                              ? "bg-orange-600 text-white border-orange-600 shadow-md"
                              : "bg-white text-slate-700 border-slate-300 hover:border-orange-600 hover:text-orange-600"
                        }`}
                      >
                        <Clock className="h-4 w-4 mr-2" />
                        {slot.time}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

         
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 sm:p-8">
            <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center">
              <UploadCloud className="h-5 w-5 mr-2 text-orange-600" />
              3. Upload Required Documents
            </h2>
            
            <div className="space-y-6">
              {REQUIRED_DOCUMENTS.map((doc) => {
                const uploadedFile = files[doc.id];

                return (
                  <div key={doc.id} className="border border-slate-200 rounded-lg p-4 bg-slate-50/50">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">
                          {doc.label}  <span className="text-red-500">*</span>
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
                          onClick={() => removeFile(doc.id)}
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
                            // Only accept one file per input 
                            onChange={(e) => handleFileChange(doc.id, e)} 
                          />
                        </label>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto flex justify-center items-center py-3 px-8 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-orange-600 hover:bg-orange-700 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <><Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" /> Submitting Request...</>
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