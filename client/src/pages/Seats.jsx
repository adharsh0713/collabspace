import { useEffect, useState } from 'react';
import { getSeats, createSeatBooking } from '../services/seatService';
import { useAuth } from '../context/AuthContext';
import { connectSocket } from '../socket/socket';
import FloorMap from '../components/FloorMap';

const Seats = () => {
    const { user } = useAuth();

    const [seats, setSeats] = useState([]);

    const [selectedSeat, setSelectedSeat] = useState(null);

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

        const socket = connectSocket(user.organization);

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
            if (selectedSeat.status !== 'AVAILABLE') {
                alert('Seat not available');
                return;
            }
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
                    <FloorMap
                        seats={seats}
                        selectedSeat={selectedSeat}
                        onSelect={(seat) => setSelectedSeat(seat)}
                    />
                )}
                {selectedSeat && (
                    <div style={{ marginTop: 20 }}>
                        <h3>Selected: {selectedSeat.code}</h3>
                        <p>Status: {selectedSeat.status}</p>

                        <input
                            type="datetime-local"
                            onChange={(e) =>
                                setTime((p) => ({ ...p, startTime: e.target.value }))
                            }
                        />

                        <input
                            type="datetime-local"
                            onChange={(e) =>
                                setTime((p) => ({ ...p, endTime: e.target.value }))
                            }
                        />

                        <button
                            disabled={
                                selectedSeat.status !== 'AVAILABLE' ||
                                !time.startTime ||
                                !time.endTime
                            }
                            onClick={() => handleBook(selectedSeat._id)}
                        >
                            Book Seat
                        </button>
                    </div>
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