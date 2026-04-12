import { useEffect, useState } from 'react';
import {
    getRoomBookings,
    createRoomBooking,
    checkInRoomBooking,
} from '../services/roomService';

const Rooms = () => {
    const [bookings, setBookings] = useState([]);
    const [form, setForm] = useState({
        roomId: '',
        startTime: '',
        endTime: '',
        participants: '',
    });

    const fetchBookings = async () => {
        const data = await getRoomBookings();
        setBookings(data.docs || data);
    };

    useEffect(() => {
        fetchBookings();
    }, []);

    const handleChange = (e) => {
        setForm((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const handleCreate = async () => {
        const participants = form.participants
            .split(',')
            .map((email) => ({ email: email.trim() }));

        await createRoomBooking({
            roomId: form.roomId,
            startTime: form.startTime,
            endTime: form.endTime,
            participants,
        });

        fetchBookings();
    };

    const handleCheckIn = async (id) => {
        await checkInRoomBooking(id);
        fetchBookings();
    };

    return (
        <div>
            <h2>Room Booking</h2>

            {/* Create Booking */}
            <div>
                <input
                    name="roomId"
                    placeholder="Room ID"
                    onChange={handleChange}
                />

                <input
                    type="datetime-local"
                    name="startTime"
                    onChange={handleChange}
                />

                <input
                    type="datetime-local"
                    name="endTime"
                    onChange={handleChange}
                />

                <input
                    name="participants"
                    placeholder="email1,email2"
                    onChange={handleChange}
                />

                <button onClick={handleCreate}>Create Booking</button>
            </div>

            {/* Booking List */}
            <div>
                {bookings.map((b) => (
                    <div key={b._id} style={{ border: '1px solid', margin: 10 }}>
                        <p>Room: {b.room}</p>
                        <p>Status: {b.status}</p>
                        <p>
                            {new Date(b.startTime).toLocaleString()} -{' '}
                            {new Date(b.endTime).toLocaleString()}
                        </p>

                        <button onClick={() => handleCheckIn(b._id)}>
                            Check In
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Rooms;