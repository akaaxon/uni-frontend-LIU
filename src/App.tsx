import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';

import AuthGateway from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import AdminServices from './pages/AdminServices';
import AdminLayout from './components/AdminLayout';
import StudentBooking from './pages/StudentBooking';

import { AdminRoute, StudentRoute } from './components/ProtectedRoutes';
import ChatWidget from './components/ChatWidget';
import InfoPage from './pages/InfoPage';
import InfoButton from './components/InfoButton';

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-center" richColors />
      
      <Routes>
        <Route path="/" element={<AuthGateway />} />
        <Route path="/info" element={<InfoPage />} />

        <Route 
          path="/booking" 
          element={
            <StudentRoute>
              <StudentBooking />
            </StudentRoute>
          } 
        />
        
        <Route 
          path="/admin" 
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="services" element={<AdminServices />} />
        </Route>
      </Routes>
      <ChatWidget />
      <InfoButton />
    </BrowserRouter>
  );
}

export default App;