import { useEffect, useState } from 'react';
import {checkInSeatBooking, getMySeatBookings} from '../services/seatService';
import {
    getMyRoomBookings,
    checkInRoomBooking,
} from '../services/roomService';
import { createSeatBooking } from '../services/seatService';

const Dashboard = () => {
    const [seatBookings, setSeatBookings] = useState([]);
    const [roomBookings, setRoomBookings] = useState([]);

    const fetchData = async () => {
        const seats = await getMySeatBookings();
        const rooms = await getMyRoomBookings();

        setSeatBookings(seats.docs || seats);
        setRoomBookings(rooms.docs || rooms);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleRoomCheckIn = async (id) => {
        await checkInRoomBooking(id);
        fetchData();
    };

    return (
        <div>
            <h2>Dashboard</h2>

            {/* Seat Bookings */}
            <div>
                <h3>My Seat Bookings</h3>

                import { checkInSeatBooking } from '../services/seatService';

                ...

                {seatBookings.map((b) => (
                    <div key={b._id} style={{ border: '1px solid', margin: 10 }}>
                        <p>Seat: {b.seat?.code}</p>
                        <p>Status: {b.status}</p>

                        <p>
                            {new Date(b.startTime).toLocaleString()} -{' '}
                            {new Date(b.endTime).toLocaleString()}
                        </p>

                        {/* ADD HERE */}
                        {b.status === 'BOOKED' && (
                            <button onClick={async () => {
                                await checkInSeatBooking(b._id);
                                fetchData(); // refresh after check-in
                            }}>
                                Check In
                            </button>
                        )}
                    </div>
                ))}
            </div>

            {/* Room Bookings */}
            <div>
                <h3>My Room Bookings</h3>

                {roomBookings.map((b) => (
                    <div key={b._id} style={{ border: '1px solid', margin: 10 }}>
                        <p>Room: {b.room}</p>
                        <p>Status: {b.status}</p>

                        <p>
                            {new Date(b.startTime).toLocaleString()} -{' '}
                            {new Date(b.endTime).toLocaleString()}
                        </p>

                        <button onClick={() => handleRoomCheckIn(b._id)}>
                            Check In
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Dashboard;