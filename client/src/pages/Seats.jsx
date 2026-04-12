import { useEffect, useState } from 'react';
import { getSeats, createSeatBooking } from '../services/seatService';
import { useAuth } from '../context/AuthContext';
import { connectSocket, getSocket } from '../socket/socket';

const Seats = () => {
    const { user } = useAuth();

    const [seats, setSeats] = useState([]);
    const [time, setTime] = useState({
        startTime: '',
        endTime: '',
    });

    // fetch seats
    const fetchSeats = async () => {
        try {
            const data = await getSeats();
            console.log('Seats:', data); // debug
            setSeats(data.docs || data);
        } catch (err) {
            console.error('Seat fetch error:', err.response?.data || err);
        }
    };

    useEffect(() => {
        if (!user) return;

        const init = async () => {
            await fetchSeats();

            const socket = connectSocket(user.organizationId);

            socket.on('seatBooked', fetchSeats);
            socket.on('seatReleased', fetchSeats);

            return () => socket.disconnect();
        };

        init();
    }, [user]);

    const handleBook = async (seatId) => {
        if (!time.startTime || !time.endTime) {
            alert('Select time range');
            return;
        }

        await createSeatBooking({
            seatId,
            startTime: time.startTime,
            endTime: time.endTime,
        });

        fetchSeats();
    };

    return (
        <div>
            <h2>Seats</h2>

            {/* time selection */}
            <input
                type="datetime-local"
                onChange={(e) =>
                    setTime((prev) => ({ ...prev, startTime: e.target.value }))
                }
            />

            <input
                type="datetime-local"
                onChange={(e) =>
                    setTime((prev) => ({ ...prev, endTime: e.target.value }))
                }
            />

            {/* seat list */}
            <div>
                {seats?.length === 0 ? (
                    <p>No seats available</p>
                ) : (
                    seats.map((seat) => (
                        <div key={seat._id} style={{ border: '1px solid', margin: 8 }}>
                            <p>{seat.code}</p>
                            <p>{seat.status}</p>

                            <button onClick={() => handleBook(seat._id)}>
                                Book
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Seats;