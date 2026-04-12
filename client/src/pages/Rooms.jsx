import { useEffect, useState } from 'react';
import {
    getRoomBookings,
    createRoomBooking,
    checkInRoomBooking,
} from '../services/roomService';
import api from '../services/api';

const Rooms = () => {
    const [bookings, setBookings] = useState([]);
    const [rooms, setRooms] = useState([]);

    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState({
        roomId: '',
        startTime: '',
        endTime: '',
        participants: '',
    });

    const [filters, setFilters] = useState({
        page: 1,
        limit: 10,
        status: '',
    });

    const [pagination, setPagination] = useState({
        page: 1,
        totalPages: 1,
    });

    // ---------------- FETCH ----------------

    const fetchBookings = async () => {
        try {
            const data = await getRoomBookings(filters);

            setBookings(data.docs || data);

            setPagination({
                page: data.page || 1,
                totalPages: data.totalPages || 1,
            });
        } catch (err) {
            console.error('Failed to fetch bookings');
        }
    };

    const fetchRooms = async () => {
        try {
            const res = await api.get('/admin/rooms'); // assumes GET exists
            setRooms(res.data.data);
        } catch (err) {
            console.error('Failed to fetch rooms');
        }
    };

    useEffect(() => {
        fetchRooms();
    }, []);
    // ---------------- HANDLERS ----------------

    const handleChange = (e) => {
        setForm((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const handleCreate = async () => {
        // basic validation
        if (!form.roomId || !form.startTime || !form.endTime) {
            alert('All fields required');
            return;
        }

        if (new Date(form.startTime) >= new Date(form.endTime)) {
            alert('Invalid time range');
            return;
        }

        try {
            setLoading(true);

            const participants = form.participants
                ? form.participants
                    .split(',')
                    .map((email) => ({ email: email.trim() }))
                : [];

            await createRoomBooking({
                roomId: form.roomId,
                startTime: form.startTime,
                endTime: form.endTime,
                participants,
            });

            setForm({
                roomId: '',
                startTime: '',
                endTime: '',
                participants: '',
            });

            fetchBookings();
        } catch (err) {
            alert(err.response?.data?.message || 'Booking failed');
        } finally {
            setLoading(false);
        }
    };

    const handleCheckIn = async (id) => {
        try {
            await checkInRoomBooking(id);
            fetchBookings();
        } catch (err) {
            console.error('Check-in failed');
        }
    };

    const handleFilterChange = (e) => {
        setFilters((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
            page: 1,
        }));
    };

    useEffect(() => {
        const timeout = setTimeout(() => {
            fetchBookings();
        }, 300);

        return () => clearTimeout(timeout);
    }, [filters]);

    // ---------------- UI ----------------

    return (
        <div style={{ padding: 20 }}>
            <h2>Room Booking</h2>

            {/* ---------- CREATE ---------- */}
            <div style={{ marginBottom: 20 }}>
                <h3>Create Booking</h3>

                {/* Room Dropdown (FIXED UX) */}
                <select name="roomId" value={form.roomId} onChange={handleChange}>
                    <option value="">Select Room</option>
                    {rooms.map((r) => (
                        <option key={r._id} value={r._id}>
                            {r.name} (Cap: {r.capacity})
                        </option>
                    ))}
                </select>

                <br />

                <input
                    type="datetime-local"
                    name="startTime"
                    value={form.startTime}
                    onChange={handleChange}
                />

                <input
                    type="datetime-local"
                    name="endTime"
                    value={form.endTime}
                    onChange={handleChange}
                />

                <br />

                <input
                    name="participants"
                    placeholder="email1,email2"
                    value={form.participants}
                    onChange={handleChange}
                />

                <br />

                <button onClick={handleCreate} disabled={loading}>
                    {loading ? 'Creating...' : 'Create Booking'}
                </button>
            </div>

            {/* ---------- FILTERS ---------- */}
            <div style={{ marginBottom: 10 }}>
                <select name="status" onChange={handleFilterChange}>
                    <option value="">All Status</option>
                    <option value="BOOKED">BOOKED</option>
                    <option value="COMPLETED">COMPLETED</option>
                    <option value="NO_SHOW">NO_SHOW</option>
                </select>
            </div>

            {/* ---------- LIST ---------- */}
            <div>
                <h3>Bookings</h3>

                {bookings.length === 0 && <p>No bookings</p>}

                {bookings.map((b) => (
                    <div
                        key={b._id}
                        style={{
                            border: '1px solid #ccc',
                            padding: 10,
                            marginBottom: 10,
                        }}
                    >
                        {/* FIX: populated room */}
                        <p>
                            Room: {b.room?.name || b.room}
                        </p>

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

            {/* ---------- PAGINATION ---------- */}
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

export default Rooms;