import { Link } from 'react-router-dom';

const Home = () => {
    return (
        <div>
            <h2>CollabSpace</h2>

            <Link to="/admin">Admin</Link>
            <Link to="/seats">Go to Seats</Link>
            <Link to="/rooms">Rooms</Link>
        </div>
    );
};

export default Home;