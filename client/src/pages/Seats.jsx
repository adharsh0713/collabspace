import { useEffect, useState } from 'react';
import { getSeats, createSeatBooking } from '../services/seatService';
import { useAuth } from '../context/AuthContext';
import { connectSocket } from '../socket/socket';

const Seats = () => {
    const { user } = useAuth();

    const [seats, setSeats] = useState([]);

    const [filters, setFilters] = useState({
        floor: '',
        status: '',
        page: 1,
        limit: 10,
    });

    const [pagination, setPagination] = useState({
        page: 1,
        totalPages: 1,
    });

    const [time, setTime] = useState({
        startTime: '',
        endTime: '',
    });

    // -------------------------
    // Fetch Seats (FIXED)
    // -------------------------
    const fetchSeats = async () => {
        try {
            const data = await getSeats(filters); // ✅ pass filters

            setSeats(data.docs || data);

            setPagination({
                page: data.page || 1,
                totalPages: data.totalPages || 1,
            });
        } catch (err) {
            console.error('Seat fetch error:', err.response?.data || err);
        }
    };

    // -------------------------
    // Filters
    // -------------------------
    const handleFilterChange = (e) => {
        setFilters((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
            page: 1,
        }));
    };

    // -------------------------
    // Socket + Initial Load
    // -------------------------
    useEffect(() => {
        if (!user) return;

        fetchSeats();

        const socket = connectSocket(user.organizationId);

        socket.on('seatBooked', fetchSeats);
        socket.on('seatReleased', fetchSeats);

        return () => {
            socket.disconnect(); // ✅ correct cleanup
        };
    }, [user]);

    // -------------------------
    // Refetch on filter change (debounced)
    // -------------------------
    useEffect(() => {
        const timeout = setTimeout(() => {
            fetchSeats();
        }, 300);

        return () => clearTimeout(timeout);
    }, [filters]);

    // -------------------------
    // Booking
    // -------------------------
    const handleBook = async (seatId) => {
        if (!time.startTime || !time.endTime) {
            alert('Select time range');
            return;
        }

        try {
            await createSeatBooking({
                seatId,
                startTime: time.startTime,
                endTime: time.endTime,
            });

            fetchSeats();
        } catch (err) {
            alert(err.response?.data?.message || 'Booking failed');
        }
    };

    // -------------------------
    // UI
    // -------------------------
    return (
        <div>
            <h2>Seats</h2>

            {/* Time Selection */}
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

            {/* Filters */}
            <div>
                <select name="floor" onChange={handleFilterChange}>
                    <option value="">All Floors</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                </select>

                <select name="status" onChange={handleFilterChange}>
                    <option value="">All Status</option>
                    <option value="AVAILABLE">AVAILABLE</option>
                    <option value="MAINTENANCE">MAINTENANCE</option>
                    <option value="CLOSED">CLOSED</option>
                </select>
            </div>

            {/* Seats */}
            <div>
                {seats.length === 0 ? (
                    <p>No seats found</p>
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

            {/* Pagination */}
            <div>
                <button
                    disabled={pagination.page === 1}
                    onClick={() =>
                        setFilters((p) => ({ ...p, page: p.page - 1 }))
                    }
                >
                    Prev
                </button>

                <span>
          Page {pagination.page} / {pagination.totalPages}
        </span>

                <button
                    disabled={pagination.page === pagination.totalPages}
                    onClick={() =>
                        setFilters((p) => ({ ...p, page: p.page + 1 }))
                    }
                >
                    Next
                </button>
            </div>
        </div>
    );
};

export default Seats;