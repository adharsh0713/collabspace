import { useEffect, useState, useMemo } from 'react';
import { Users, Clock, AlertCircle, Info, Calendar, Plus, X } from 'lucide-react';
import {
    getRoomBookings,
    createRoomBooking,
    checkInRoomBooking,
    getRooms,
} from '../services/roomService';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Select, Input, Button } from '../components/ui';
import Badge from '../components/ui/Badge';
import { useToast } from '../context/ToastContext';

const ParticipantChips = ({ participants, onRemove, onAdd, capacity }) => {
    const [email, setEmail] = useState('');

    const handleAdd = () => {
        if (email.trim() && !participants.includes(email.trim())) {
            onAdd(email.trim());
            setEmail('');
        }
    };

    const isFull = capacity && (participants.length + 1) >= capacity;

    return (
        <div className="space-y-3">
            <div className="flex gap-2">
                <Input
                    placeholder="participant@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAdd())}
                    className="flex-1"
                    disabled={isFull}
                />
                <Button
                    onClick={handleAdd}
                    disabled={!email.trim() || isFull}
                    variant="secondary"
                    className="flex-shrink-0"
                >
                    <Plus className="w-4 h-4 mr-1" /> Add
                </Button>
            </div>
            {isFull && (
                <p className="text-xs text-danger-600 flex items-center">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    Room capacity reached. Cannot add more participants.
                </p>
            )}
            {participants.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                    {participants.map((participant, index) => (
                        <span
                            key={index}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium border border-slate-200 transition-colors hover:bg-slate-200"
                        >
                            <Users className="w-3 h-3 text-slate-400" />
                            {participant}
                            <button
                                onClick={() => onRemove(index)}
                                className="text-slate-400 hover:text-danger-600 focus:outline-none ml-1 rounded-full hover:bg-white p-0.5"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
};

const Rooms = () => {
    const { success, error: toastError } = useToast();
    const [bookings, setBookings] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(false);
    const [bookingLoading, setBookingLoading] = useState(false);
    const [error, setError] = useState('');

    const [time, setTime] = useState({ startTime: '', endTime: '' });
    const [form, setForm] = useState({ roomId: '', participants: [] });
    const [minCapacity, setMinCapacity] = useState('');

    const [filters, setFilters] = useState({ page: 1, limit: 10, status: '' });
    const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });

    const fetchBookings = async () => {
        setLoading(true);
        setError('');
        try {
            const data = await getRoomBookings(filters);
            const bookingData = Array.isArray(data) ? data : data?.bookings || data?.docs || [];
            setBookings(Array.isArray(bookingData) ? bookingData : []);
            setPagination({
                page: data?.page || 1,
                totalPages: data?.pages || data?.totalPages || 1,
            });
        } catch (err) {
            toastError('Failed to fetch bookings');
            setBookings([]);
        } finally { setLoading(false); }
    };

    const fetchRooms = async () => {
        try {
            const data = await getRooms();
            const roomData = Array.isArray(data) ? data : data?.rooms || data?.docs || [];
            setRooms(Array.isArray(roomData) ? roomData : []);
        } catch (err) {
            toastError('Failed to fetch rooms');
            setRooms([]);
        }
    };

    useEffect(() => { fetchRooms(); fetchBookings(); }, []);
    useEffect(() => {
        const timeout = setTimeout(fetchBookings, 300);
        return () => clearTimeout(timeout);
    }, [filters]);

    const handleCreate = async () => {
        setError('');
        if (!form.roomId) return setError('Please select a room');
        if (!time.startTime || !time.endTime) return setError('Please select start and end times');
        if (new Date(time.endTime) <= new Date(time.startTime)) return setError('End time must be after start time');

        const selectedRoom = rooms.find(r => r._id === form.roomId);
        if (selectedRoom && (form.participants.length + 1) > selectedRoom.capacity) {
            return setError(`Room capacity is ${selectedRoom.capacity}. You have ${form.participants.length + 1} people (including host).`);
        }

        setBookingLoading(true);
        try {
            await createRoomBooking({
                roomId: form.roomId,
                startTime: time.startTime,
                endTime: time.endTime,
                participants: form.participants.map(email => ({ email })),
            });
            success('Room booked successfully! Email sent with check-in QR.');
            setForm({ roomId: '', participants: [] });
            setTime({ startTime: '', endTime: '' });
            fetchBookings();
        } catch (err) {
            setError(err.response?.data?.message || 'Booking failed');
        } finally { setBookingLoading(false); }
    };

    const handleCheckIn = async (id) => {
        try {
            await checkInRoomBooking(id);
            success('Checked in successfully!');
            fetchBookings();
        } catch (err) { toastError(err.response?.data?.message || 'Check-in failed'); }
    };

    const filteredRooms = useMemo(() => {
        if (!minCapacity) return rooms;
        return rooms.filter(r => r.capacity >= parseInt(minCapacity, 10));
    }, [rooms, minCapacity]);

    const roomOptions = [
        { value: '', label: 'Select a room' },
        ...filteredRooms.map(r => ({ value: r._id, label: `${r.name} (Cap: ${r.capacity})` }))
    ];

    const statusOptions = [
        { value: '', label: 'All Status' },
        { value: 'BOOKED', label: 'Booked' },
        { value: 'COMPLETED', label: 'Completed' },
        { value: 'NO_SHOW', label: 'No Show' },
        { value: 'CHECKED_IN', label: 'Checked In' },
    ];

    const selectedRoom = rooms.find(r => r._id === form.roomId);

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Room Booking</h1>
                <p className="text-slate-500 mt-1">Book meeting rooms and manage team participants</p>
            </div>

            <Card className="border-0 shadow-md">
                <CardHeader className="bg-slate-50 border-b border-slate-100 rounded-t-xl">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-primary" />
                        Create New Booking
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="space-y-5">
                            <div className="flex gap-4">
                                <div className="w-1/3">
                                    <Input
                                        label="Min Capacity"
                                        type="number"
                                        min="1"
                                        value={minCapacity}
                                        onChange={(e) => setMinCapacity(e.target.value)}
                                        placeholder="e.g. 5"
                                    />
                                </div>
                                <div className="flex-1">
                                    <Select
                                        label="Select Room"
                                        name="roomId"
                                        value={form.roomId}
                                        onChange={(e) => setForm(prev => ({ ...prev, roomId: e.target.value }))}
                                        options={roomOptions}
                                        required
                                    />
                                </div>
                            </div>

                            {selectedRoom && (
                                <div className="p-4 bg-primary-50 rounded-lg border border-primary-100 flex items-start gap-3">
                                    <Info className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" />
                                    <div className="space-y-1">
                                        <h3 className="text-sm font-semibold text-primary-900">Room Details</h3>
                                        <p className="text-sm text-primary-700">Capacity: <strong>{selectedRoom.capacity}</strong> people</p>
                                        {selectedRoom.amenities && selectedRoom.amenities.length > 0 && (
                                            <div className="flex flex-wrap gap-1 mt-2">
                                                {selectedRoom.amenities.map((a, i) => (
                                                    <span key={i} className="px-2 py-0.5 text-xs bg-white text-primary-700 rounded-md border border-primary-200">
                                                        {a}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

                        <div className="space-y-5">
                            <div>
                                <label className="flex justify-between text-sm font-medium text-slate-700 mb-2">
                                    <span>Participants</span>
                                    <span className={selectedRoom && (form.participants.length + 1) >= selectedRoom.capacity ? 'text-danger-600 font-bold' : ''}>
                                        {form.participants.length + 1} / {selectedRoom?.capacity || '?'} (inc. Host)
                                    </span>
                                </label>
                                <ParticipantChips
                                    participants={form.participants}
                                    onAdd={(email) => setForm(p => ({ ...p, participants: [...p.participants, email] }))}
                                    onRemove={(idx) => setForm(p => ({ ...p, participants: p.participants.filter((_, i) => i !== idx) }))}
                                    capacity={selectedRoom?.capacity}
                                />
                            </div>

                            {error && (
                                <div className="bg-danger-50 border border-danger-200 rounded-lg p-4 flex items-center gap-3">
                                    <AlertCircle className="w-5 h-5 text-danger-500 flex-shrink-0" />
                                    <p className="text-sm text-danger-700 font-medium">{error}</p>
                                </div>
                            )}

                            <div className="pt-4">
                                <Button
                                    onClick={handleCreate}
                                    disabled={bookingLoading}
                                    className="w-full py-2.5"
                                >
                                    {bookingLoading ? 'Processing Booking...' : 'Confirm Room Booking'}
                                </Button>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8">
                <h2 className="text-xl font-bold text-slate-900 flex items-center">
                    Your Bookings
                    <Badge className="ml-3">{bookings.length} total</Badge>
                </h2>
                <div className="w-full sm:w-64">
                    <Select
                        name="status"
                        value={filters.status}
                        onChange={(e) => setFilters(p => ({ ...p, status: e.target.value, page: 1 }))}
                        options={statusOptions}
                    />
                </div>
            </div>

            {/* Bookings List */}
            <Card className="p-0 overflow-hidden shadow-sm border-slate-200">
                {bookings.length === 0 ? (
                    <div className="text-center py-16 bg-slate-50">
                        <Calendar className="mx-auto h-10 w-10 text-slate-300 mb-3" />
                        <p className="text-slate-500 font-medium">No room bookings found</p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {bookings.map((booking) => {
                            if (!booking || !booking._id) return null;
                            return (
                                <div key={booking._id} className="p-5 hover:bg-slate-50/50 transition-colors">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1 space-y-2">
                                            <div className="flex items-center space-x-3">
                                                <span className="font-semibold text-slate-900 text-lg">
                                                    {booking.room?.name || 'Unknown Room'}
                                                </span>
                                                <Badge variant={booking.status.toLowerCase()}>{booking.status.replace('_', ' ')}</Badge>
                                            </div>
                                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 text-sm text-slate-500">
                                                <span className="flex items-center gap-1.5">
                                                    <Clock className="w-4 h-4" />
                                                    {new Date(booking.startTime).toLocaleString([], {month:'short', day:'numeric', hour:'2-digit', minute:'2-digit'})} 
                                                    {' - '} 
                                                    {new Date(booking.endTime).toLocaleString([], {hour:'2-digit', minute:'2-digit'})}
                                                </span>
                                                {booking.participants?.length > 0 && (
                                                    <span className="flex items-center gap-1.5">
                                                        <Users className="w-4 h-4" />
                                                        {booking.participants.length} participant(s)
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        {booking.status === 'BOOKED' && (
                                            <Button size="sm" onClick={() => handleCheckIn(booking._id)} variant="secondary" className="shadow-sm">
                                                Check In
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </Card>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
                <div className="flex items-center justify-center space-x-4 pt-2">
                    <Button
                        variant="secondary" size="sm"
                        disabled={pagination.page === 1}
                        onClick={() => setFilters(prev => ({ ...prev, page: prev.page - 1 }))}
                    >
                        Previous
                    </Button>
                    <span className="text-sm font-medium text-slate-600">
                        Page {pagination.page} of {pagination.totalPages}
                    </span>
                    <Button
                        variant="secondary" size="sm"
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