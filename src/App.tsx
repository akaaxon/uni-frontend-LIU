import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AdminServices from './pages/AdminServices';
import AdminLayout from './components/AdminLayout';
import StudentBooking from './pages/StudentBooking';

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-center" richColors />
      
      <Routes>
        <Route path="/" element={<Navigate to="/admin/login" replace />} />
        <Route path="/admin/login" element={<AdminLogin />} />

        <Route path="/booking" element={<StudentBooking />} />
        
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/services" element={<AdminServices />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
