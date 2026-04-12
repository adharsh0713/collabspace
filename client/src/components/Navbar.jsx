import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const { user, logout } = useAuth();

    return (
        <nav style={{ display: 'flex', gap: 10 }}>
            <Link to="/">Dashboard</Link>
            <Link to="/seats">Seats</Link>
            <Link to="/rooms">Rooms</Link>
            <Link to="/analytics">Analytics</Link>

            {user?.role === 'ADMIN' && (
                <Link to="/admin">Admin</Link>
            )}

            <button onClick={logout}>Logout</button>
        </nav>
    );
};

export default Navbar;