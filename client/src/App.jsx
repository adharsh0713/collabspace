import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Seats from './pages/Seats';
import Rooms from './pages/Rooms';
import Admin from './pages/Admin';
import AdminRoute from './routes/AdminRoute';
import Analytics from './pages/Analytics';

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Navbar />
                <Routes>
                    <Route
                        path="/"
                        element={
                            <ProtectedRoute>
                                <Dashboard />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/login"
                        element={<Login />}
                    />
                    <Route
                        path="/seats"
                        element={
                            <ProtectedRoute>
                                <Seats />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/rooms"
                        element={
                            <ProtectedRoute>
                                <Rooms />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin"
                        element={
                            <AdminRoute>
                                <Admin />
                            </AdminRoute>
                        }
                    />
                    <Route
                        path="/analytics"
                        element={
                            <ProtectedRoute>
                                <Analytics />
                            </ProtectedRoute>
                        }
                    />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;