import { useEffect, useState } from 'react';
import {
    getRoomBookings,
    createRoomBooking,
    checkInRoomBooking,
    getRooms,
} from '../services/roomService';
import { Card, Select, Input, Button, Badge } from '../components/ui';

const ParticipantChips = ({ participants, onRemove, onAdd }) => {
    const [email, setEmail] = useState('');

    const handleAdd = () => {
        if (email.trim() && !participants.includes(email.trim())) {
            onAdd(email.trim());
            setEmail('');
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAdd();
        }
    };

    return (
        <div className="space-y-2">
            <div className="flex flex-wrap gap-2 min-h-[32px]">
                {Array.isArray(participants) && participants.map((participant, index) => (
                    <div
                        key={index}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm"
                    >
                        <span>{participant}</span>
                        <button
                            onClick={() => onRemove(index)}
                            className="text-primary-500 hover:text-primary-700"
                        >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                ))}
            </div>
            <div className="flex gap-2">
                <Input
                    placeholder="Add participant email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="flex-1"
                />
                <Button
                    onClick={handleAdd}
                    disabled={!email.trim()}
                    size="sm"
                >
                    Add
                </Button>
            </div>
        </div>
    );
};

const Rooms = () => {
    const [bookings, setBookings] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(false);
    const [bookingLoading, setBookingLoading] = useState(false);
    const [error, setError] = useState('');

    const [time, setTime] = useState({
        startTime: '',
        endTime: '',
    });

    const [form, setForm] = useState({
        roomId: '',
        participants: [],
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

    const fetchBookings = async () => {
        setLoading(true);
        setError('');
        try {
            console.log("Fetching room bookings with filters:", filters);
            const data = await getRoomBookings(filters);
            console.log("Room bookings response:", data);
            
            // Standardized data handling
            const bookingData = Array.isArray(data) ? data : data?.bookings || data?.docs || [];
            
            if (Array.isArray(bookingData)) {
                setBookings(bookingData);
                setPagination({
                    page: data?.page || 1,
                    totalPages: data?.pages || data?.totalPages || 1,
                });
                console.log("Bookings set successfully:", bookingData.length, "bookings");
            } else {
                console.error("Bookings data is not an array:", bookingData);
                setBookings([]);
                setError('Invalid data format received');
            }
        } catch (err) {
            console.error('Failed to fetch bookings:', err);
            setError('Failed to fetch bookings');
            // Always set empty array on error
            setBookings([]);
            setPagination({
                page: 1,
                totalPages: 1,
            });
        } finally {
            setLoading(false);
        }
    };

    const fetchRooms = async () => {
        try {
            console.log("Fetching rooms...");
            const data = await getRooms();
            console.log("Rooms API response:", data);
            
            // Standardized data handling
            const roomData = Array.isArray(data) ? data : data?.rooms || data?.docs || [];
            
            if (Array.isArray(roomData)) {
                setRooms(roomData);
                console.log("Rooms set successfully:", roomData.length, "rooms");
            } else {
                console.error("Rooms data is not an array:", roomData);
                setRooms([]);
                setError('Invalid data format received');
            }
        } catch (err) {
            console.error('Failed to fetch rooms:', err);
            setError('Failed to fetch rooms');
            // Always set empty array on error
            setRooms([]);
        }
    };

    useEffect(() => {
        fetchRooms();
        fetchBookings();
    }, []);

    const handleChange = (e) => {
        setForm((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const handleCreate = async () => {
        if (!form.roomId) {
            setError('Please select a room');
            return;
        }

        if (!time.startTime || !time.endTime) {
            setError('Please select start and end times');
            return;
        }

        if (new Date(time.endTime) <= new Date(time.startTime)) {
            setError('End time must be after start time');
            return;
        }

        const selectedRoom = rooms.find(r => r._id === form.roomId);
        if (form.participants.length > selectedRoom.capacity) {
            setError(`Room capacity is ${selectedRoom.capacity}, but you added ${form.participants.length} participants`);
            return;
        }

        setBookingLoading(true);
        setError('');

        try {
            const participants = form.participants.map(email => ({ email }));

            await createRoomBooking({
                roomId: form.roomId,
                startTime: time.startTime,
                endTime: time.endTime,
                participants,
            });

            // Reset form
            setForm({
                roomId: '',
                participants: [],
            });
            setTime({
                startTime: '',
                endTime: '',
            });

            fetchBookings();
        } catch (err) {
            setError(err.response?.data?.message || 'Booking failed');
        } finally {
            setBookingLoading(false);
        }
    };

    const handleCheckIn = async (id) => {
        try {
            await checkInRoomBooking(id);
            fetchBookings();
        } catch (err) {
            console.error('Check-in failed:', err);
            setError('Check-in failed');
        }
    };

    const handleFilterChange = (e) => {
        setFilters((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
            page: 1,
        }));
    };

    const addParticipant = (email) => {
        setForm(prev => ({
            ...prev,
            participants: [...prev.participants, email]
        }));
    };

    const removeParticipant = (index) => {
        setForm(prev => ({
            ...prev,
            participants: prev.participants.filter((_, i) => i !== index)
        }));
    };

    useEffect(() => {
        const timeout = setTimeout(() => {
            fetchBookings();
        }, 300);

        return () => clearTimeout(timeout);
    }, [filters]);

    const roomOptions = [
        { value: '', label: 'Select a room' },
        ...(Array.isArray(rooms) ? rooms.map(room => ({
            value: room._id,
            label: `${room.name || 'Unknown Room'} (Capacity: ${room.capacity || 0})`
        })) : [])
    ];

    const statusOptions = [
        { value: '', label: 'All Status' },
        { value: 'BOOKED', label: 'Booked' },
        { value: 'COMPLETED', label: 'Completed' },
        { value: 'NO_SHOW', label: 'No Show' },
        { value: 'CHECKED_IN', label: 'Checked In' },
    ];

    const getStatusBadge = (status) => {
        const variant = status === 'BOOKED' ? 'booked' : 
                       status === 'COMPLETED' ? 'success' : 
                       status === 'NO_SHOW' ? 'error' : 
                       status === 'CHECKED_IN' ? 'available' : 'default';
        return <Badge variant={variant}>{status.replace('_', ' ')}</Badge>;
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Invalid date';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return 'Invalid date';
            return date.toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            console.error('Date formatting error:', error);
            return 'Invalid date';
        }
    };

    const selectedRoom = rooms.find(r => r._id === form.roomId);

    // Loading state
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-white text-lg">Loading rooms...</div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="text-red-400 text-lg mb-4">Failed to load rooms</div>
                    <button 
                        onClick={() => {
                            setError('');
                            fetchRooms();
                            fetchBookings();
                        }}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Room Booking</h1>
                <p className="text-gray-600 mt-2">Book meeting rooms and manage participants</p>
            </div>

            {/* Create Booking */}
            <Card className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Create New Booking</h2>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <Select
                            label="Select Room"
                            name="roomId"
                            value={form.roomId}
                            onChange={handleChange}
                            options={roomOptions}
                            required
                        />

                        {selectedRoom && (
                            <div className="p-4 bg-gray-50 rounded-lg">
                                <h3 className="font-medium text-gray-900 mb-2">Room Details</h3>
                                <p className="text-sm text-gray-600">Capacity: {selectedRoom.capacity} people</p>
                                {selectedRoom.description && (
                                    <p className="text-sm text-gray-600">{selectedRoom.description}</p>
                                )}
                                {selectedRoom.equipment && selectedRoom.equipment.length > 0 && (
                                    <div className="mt-2">
                                        <p className="text-sm text-gray-600">Equipment: {selectedRoom.equipment.join(', ')}</p>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                label="Start Time"
                                type="datetime-local"
                                value={time.startTime}
                                onChange={(e) => setTime(prev => ({ ...prev, startTime: e.target.value }))}
                                required
                            />
                            <Input
                                label="End Time"
                                type="datetime-local"
                                value={time.endTime}
                                onChange={(e) => setTime(prev => ({ ...prev, endTime: e.target.value }))}
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Participants ({form.participants.length}/{selectedRoom?.capacity || 0})
                            </label>
                            <ParticipantChips
                                participants={form.participants}
                                onAdd={addParticipant}
                                onRemove={removeParticipant}
                            />
                        </div>

                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                <p className="text-sm text-red-600">{error}</p>
                            </div>
                        )}

                        <Button
                            onClick={handleCreate}
                            loading={bookingLoading}
                            disabled={bookingLoading}
                            className="w-full"
                        >
                            {bookingLoading ? 'Creating Booking...' : 'Create Booking'}
                        </Button>
                    </div>
                </div>
            </Card>

            {/* Filters */}
            <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">Your Bookings</h2>
                    <Badge variant="default">{bookings.length} total</Badge>
                </div>
                
                <div className="flex items-center space-x-4">
                    <Select
                        label="Filter by Status"
                        name="status"
                        value={filters.status}
                        onChange={handleFilterChange}
                        options={statusOptions}
                        className="w-48"
                    />
                </div>
            </Card>

            {/* Bookings List */}
            <Card className="p-6">
                {bookings.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        <p>No bookings found</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {!Array.isArray(bookings) || bookings.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                                <p>No bookings found</p>
                            </div>
                        ) : (
                            bookings.map((booking) => {
                                if (!booking || !booking._id) return null;
                                return (
                                    <Card key={booking._id} className="p-4 border border-gray-200">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-2 mb-2">
                                                    <span className="font-medium text-gray-900">
                                                        {booking.room?.name || booking.room || 'Unknown Room'}
                                                    </span>
                                                    {getStatusBadge(booking.status)}
                                                </div>
                                                <p className="text-sm text-gray-600 mb-1">
                                                    {formatDate(booking.startTime)} - {formatDate(booking.endTime)}
                                                </p>
                                                {booking.participants && Array.isArray(booking.participants) && booking.participants.length > 0 && (
                                                    <p className="text-sm text-gray-500">
                                                        {booking.participants.length} participants
                                                    </p>
                                                )}
                                            </div>
                                            {booking.status === 'BOOKED' && (
                                                <Button
                                                    size="sm"
                                                    onClick={() => handleCheckIn(booking._id)}
                                                >
                                                    Check In
                                                </Button>
                                            )}
                                        </div>
                                    </Card>
                                );
                            })
                        )}
                    </div>
                )}
            </Card>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
                <div className="flex items-center justify-center space-x-2">
                    <Button
                        variant="secondary"
                        disabled={pagination.page === 1}
                        onClick={() => setFilters(prev => ({ ...prev, page: prev.page - 1 }))}
                    >
                        Previous
                    </Button>
                    <span className="text-sm text-gray-600">
                        Page {pagination.page} of {pagination.totalPages}
                    </span>
                    <Button
                        variant="secondary"
                        disabled={pagination.page === pagination.totalPages}
                        onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
                    >
                        Next
                    </Button>
                </div>
            )}
        </div>
    );
};

export default Rooms;