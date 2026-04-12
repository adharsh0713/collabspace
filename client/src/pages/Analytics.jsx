import { useEffect, useState } from 'react';
import { getAnalytics } from '../services/analyticsService';

const Analytics = () => {
    const [data, setData] = useState(null);

    useEffect(() => {
        const fetch = async () => {
            const res = await getAnalytics();
            setData(res);
        };

        fetch();
    }, []);

    if (!data) return <p>Loading...</p>;

    return (
        <div>
            <h2>Analytics Dashboard</h2>

            <div>
                <h3>Seat Analytics</h3>
                <p>Total: {data.seats.total}</p>
                <p>Completed: {data.seats.completed}</p>
                <p>No Show: {data.seats.noShow}</p>
                <p>Utilization: {data.seats.utilization.toFixed(2)}%</p>
            </div>

            <div>
                <h3>Room Analytics</h3>
                <p>Total: {data.rooms.total}</p>
                <p>Completed: {data.rooms.completed}</p>
                <p>No Show: {data.rooms.noShow}</p>
                <p>Utilization: {data.rooms.utilization.toFixed(2)}%</p>
            </div>
        </div>
    );
};

export default Analytics;