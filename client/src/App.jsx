import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Seats from "./pages/Seats";
import Rooms from "./pages/Rooms";
import Admin from "./pages/Admin";
import Analytics from "./pages/Analytics";
import ProtectedRoute from "./routes/ProtectedRoute";
import AdminRoute from "./routes/AdminRoute";
import AppLayout from "./components/layout/AppLayout";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Dashboard />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route path="/seats" element={
        <ProtectedRoute>
          <AppLayout>
            <Seats />
          </AppLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/rooms" element={
        <ProtectedRoute>
          <AppLayout>
            <Rooms />
          </AppLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/analytics" element={
        <ProtectedRoute>
          <AppLayout>
            <Analytics />
          </AppLayout>
        </ProtectedRoute>
      } />

      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AppLayout>
              <Admin />
            </AppLayout>
          </AdminRoute>
        }
      />
    </Routes>
  );
};

function App() {
    return (
        <ToastProvider>
            <AuthProvider>
                <AppRoutes />
            </AuthProvider>
        </ToastProvider>
    );
}

export default App;