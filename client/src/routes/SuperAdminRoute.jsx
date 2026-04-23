import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const SuperAdminRoute = ({ children }) => {
    const { user } = useAuth();

    if (!user || user.role !== 'SUPER_ADMIN') {
        return <Navigate to="/" />;
    }

    return children;
};

export default SuperAdminRoute;
