import { Link } from 'react-router-dom';

const Home = () => {
    return (
        <div>
            <h2>CollabSpace</h2>

            <Link to="/seats">Go to Seats</Link>
        </div>
    );
};

export default Home;