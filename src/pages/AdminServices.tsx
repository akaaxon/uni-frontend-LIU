import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Plus, Trash2, Loader2, AlertCircle, RefreshCw, FileText, X, Clock } from "lucide-react";

const API_URL =  "https://grad-6h2k.onrender.com:3000";

type Service = {
  id: string;
  name: string;
  description: string;
  required_documents: string[];
  available_times: string[];
  created_at: string;
};

const formatTime12Hour = (time24: string) => {
  if (!time24) return "";
  const [h, m] = time24.split(":");
  let hours = parseInt(h, 10);
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;
  return `${hours.toString().padStart(2, "0")}:${m} ${ampm}`;
};

export default function AdminServices() {
  const navigate = useNavigate();
  
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);
  
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [requiredDocs, setRequiredDocs] = useState<string[]>([""]); 
  const [availableTimes, setAvailableTimes] = useState<string[]>([""]); 
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchServices = async () => {
    setIsLoading(true);
    setPageError(null);

    try {
      const response = await fetch(`${API_URL}/admin/service`, {
        credentials: "include"
      });

      if (response.status === 401 || response.status === 403) {
        toast.error("Session expired. Please log in again.");
        navigate("/admin/login");
        return;
      }

      if (!response.ok) throw new Error("Failed to communicate with the server.");

      const data = await response.json();
      setServices(data.result || []);
      
    } catch (error: any) {
      setPageError(error.message || "Could not connect to the database.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleDocChange = (index: number, value: string) => {
    const newDocs = [...requiredDocs];
    newDocs[index] = value;
    setRequiredDocs(newDocs);
  };
  const addDocField = () => setRequiredDocs([...requiredDocs, ""]);
  const removeDocField = (index: number) => {
    const newDocs = requiredDocs.filter((_, i) => i !== index);
    setRequiredDocs(newDocs.length === 0 ? [""] : newDocs);
  };

  const handleTimeChange = (index: number, value: string) => {
    // Check for real-time duplication
    if (availableTimes.includes(value) && value !== "") {
        toast.warning("This time slot is already added.");
        return;
    }
    
    const newTimes = [...availableTimes];
    newTimes[index] = value;
    setAvailableTimes(newTimes);
  };
  const addTimeField = () => setAvailableTimes([...availableTimes, ""]);
  const removeTimeField = (index: number) => {
    const newTimes = availableTimes.filter((_, i) => i !== index);
    setAvailableTimes(newTimes.length === 0 ? [""] : newTimes);
  };

  const handleCreateService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return toast.error("Application name is required.");

    const cleanedDocs = requiredDocs
      .map(doc => doc.trim())
      .filter(doc => doc !== "");

    if (cleanedDocs.length === 0) {
      return toast.error("You must specify at least one required document.");
    }

    // Final safety check for times before submission
    const formattedTimes = availableTimes
      .filter(time => time.trim() !== "")
      .map(time => formatTime12Hour(time));
      
    const uniqueTimes = Array.from(new Set(formattedTimes));

    if (uniqueTimes.length === 0) {
      return toast.error("You must specify at least one available time slot.");
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_URL}/admin/service`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ 
          name, 
          description,
          required_documents: cleanedDocs,
          available_times: uniqueTimes 
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create application.");
      }

      toast.success("Application created successfully!");
      
      setName("");
      setDescription("");
      setRequiredDocs([""]);
      setAvailableTimes([""]); 
      fetchServices(); 
      
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteService = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this application?")) return;

    try {
      const response = await fetch(`${API_URL}/admin/service/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) throw new Error("Failed to delete application.");
      
      toast.success("Application deleted.");
      setServices(services.filter(service => service.id !== id));
      
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {pageError ? (
          <div className="bg-white rounded-xl shadow-sm border border-red-200 p-10 text-center flex flex-col items-center mt-10">
            <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
            <h2 className="text-xl font-bold text-slate-900 mb-2">Something went wrong</h2>
            <p className="text-slate-600 mb-6">{pageError}</p>
            <button onClick={fetchServices} className="flex items-center px-4 py-2 bg-slate-900 text-white rounded-md hover:bg-slate-800 transition-colors">
              <RefreshCw className="h-4 w-4 mr-2" /> Try Again
            </button>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-6 border-b border-slate-100 bg-slate-50">
                <h2 className="text-lg font-bold text-slate-900 flex items-center">
                  <Plus className="h-5 w-5 mr-2 text-orange-600" />
                  Create New Application
                </h2>
                <p className="text-sm text-slate-500 mt-1">Define the application details, required documents, and available time slots.</p>
              </div>
              
              <form onSubmit={handleCreateService} className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Application Name</label>
                      <input
                        type="text"
                        disabled={isSubmitting || isLoading}
                        className="block w-full sm:text-sm border-slate-300 rounded-md py-2 px-3 border outline-none focus:ring-orange-600 focus:border-orange-600"
                        placeholder="e.g. Master's Degree Admission"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                      <textarea
                        rows={3}
                        disabled={isSubmitting || isLoading}
                        className="block w-full sm:text-sm border-slate-300 rounded-md py-2 px-3 border outline-none focus:ring-orange-600 focus:border-orange-600"
                        placeholder="Brief details about this application..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                      />
                    </div>
                    
                    <div className="pt-2">
                      <label className="block text-sm font-medium text-slate-700 mb-2">Available Time Slots</label>
                      <div className="space-y-3">
                        {availableTimes.map((time, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <div className="relative flex-1">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Clock className="h-4 w-4 text-slate-400" />
                              </div>
                              <input
                                type="time"
                                required
                                disabled={isSubmitting || isLoading}
                                value={time}
                                onChange={(e) => handleTimeChange(index, e.target.value)}
                                className="block w-full pl-10 sm:text-sm border-slate-300 rounded-md py-2 border outline-none focus:ring-orange-600 focus:border-orange-600 cursor-pointer"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => removeTimeField(index)}
                              className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                            >
                              <X className="h-5 w-5" />
                            </button>
                          </div>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={addTimeField}
                        className="text-sm font-medium text-orange-600 hover:text-orange-700 flex items-center mt-3"
                      >
                        <Plus className="h-4 w-4 mr-1" /> Add another time slot
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Required Documents</label>
                    <div className="space-y-3">
                      {requiredDocs.map((doc, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <div className="relative flex-1">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <FileText className="h-4 w-4 text-slate-400" />
                            </div>
                            <input
                              type="text"
                              disabled={isSubmitting || isLoading}
                              value={doc}
                              onChange={(e) => handleDocChange(index, e.target.value)}
                              placeholder="e.g. Passport Copy"
                              className="block w-full pl-10 sm:text-sm border-slate-300 rounded-md py-2 border outline-none focus:ring-orange-600 focus:border-orange-600"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => removeDocField(index)}
                            className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                          >
                            <X className="h-5 w-5" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={addDocField}
                      className="text-sm font-medium text-orange-600 hover:text-orange-700 flex items-center mt-2"
                    >
                      <Plus className="h-4 w-4 mr-1" /> Add another document
                    </button>
                  </div>
                </div>

                <div className="mt-8 flex justify-end pt-4 border-t border-slate-100">
                  <button
                    type="submit"
                    disabled={isSubmitting || isLoading || !name.trim() || requiredDocs.every(doc => doc.trim() === "") || availableTimes.every(time => time.trim() === "")}
                    className="flex justify-center items-center py-2.5 px-6 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? <><Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" /> Saving...</> : "Create Application"}
                  </button>
                </div>
              </form>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-slate-900">Active Applications</h3>
                <button onClick={fetchServices} disabled={isLoading} className="text-sm text-orange-600 hover:text-orange-800 font-medium disabled:opacity-50 flex items-center">
                  <RefreshCw className="h-4 w-4 mr-1" /> Refresh
                </button>
              </div>

              {isLoading ? (
                <div className="p-10 flex justify-center items-center text-slate-400">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : services.length === 0 ? (
                <div className="bg-white rounded-xl border border-slate-200 p-10 text-center text-slate-500">
                  No applications found. Create your first one above!
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {services.map((service) => (
                    <div key={service.id} className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow p-6 flex flex-col">
                      <div className="flex justify-between items-start mb-4">
                        <h4 className="text-lg font-bold text-slate-900 leading-tight pr-4">{service.name}</h4>
                        <button
                          onClick={() => handleDeleteService(service.id)}
                          className="text-slate-400 hover:text-red-600 transition-colors shrink-0"
                          title="Delete Application"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                      
                      <p className="text-sm text-slate-500 mb-6 flex-1">
                        {service.description || <span className="italic">No description provided.</span>}
                      </p>

                      <div className="pt-4 border-t border-slate-100">
                        <p className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-2">Allowed Slots</p>
                         {service.available_times && service.available_times.length > 0 ? (
                          <div className="flex flex-wrap gap-2 mb-4">
                            {service.available_times.map((time, i) => (
                              <span key={i} className="inline-flex items-center px-2 py-1 rounded bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200">
                                <Clock className="h-3 w-3 mr-1 text-slate-500" />
                                {time}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-slate-400 italic mb-4">No times set</p>
                        )}

                        <p className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-3">Required Documents</p>
                        {service.required_documents && service.required_documents.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {service.required_documents.map((doc, i) => (
                              <span key={i} className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-orange-50 text-orange-700 border border-orange-200">
                                <FileText className="h-3 w-3 mr-1" />
                                {doc}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-sm text-slate-400 italic">None specified</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}