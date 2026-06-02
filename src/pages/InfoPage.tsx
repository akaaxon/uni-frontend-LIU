import { Mail, Phone, Copyright } from "lucide-react";

export default function InfoPage() {
  return (
    <div 
      className="min-h-screen w-full flex flex-col bg-cover bg-center bg-fixed" 
      style={{ backgroundImage: "url('/src/assets/background.jpeg')" }}
    >
      <main className="flex-1 flex flex-col items-center justify-center p-6 w-full">
        <div className="w-full max-w-lg min-h-[400px] bg-white/95 backdrop-blur-md rounded-3xl p-10 shadow-2xl border border-white/50 flex flex-col justify-center">
          <h1 className="text-4xl font-black text-slate-900 mb-8 text-center tracking-tight">Portal Info</h1>
          
          <div className="flex-1 flex flex-col justify-center space-y-6">
            <p className="text-slate-600 leading-relaxed text-center text-lg">
              Official Ministry of Education and Higher Education service portal for students.
            </p>
            
            <div className="pt-6 border-t border-slate-200 space-y-4">
              <div className="flex items-center justify-center gap-4 text-slate-800 font-medium">
                <Phone className="h-6 w-6 text-orange-600" />
                <span>+961 1 772 000</span>
              </div>
              <div className="flex items-center justify-center gap-4 text-slate-800 font-medium">
                <Mail className="h-6 w-6 text-orange-600" />
                <span>admin@mehe.gov.lb</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="w-full bg-slate-900/90 backdrop-blur-md py-8 px-6 text-slate-300 text-center">
        <div className="flex flex-col items-center gap-2 text-xs uppercase tracking-widest font-semibold">
          <div className="flex items-center gap-2">
            <Copyright className="h-4 w-4" />
            <span>2026 Ministry of Education</span>
          </div>
          <span className="opacity-60">All rights reserved</span>
        </div>
      </footer>
    </div>
  );
}