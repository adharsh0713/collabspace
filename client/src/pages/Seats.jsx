import { useEffect, useState } from 'react';
import { getSeats, createSeatBooking } from '../services/seatService';
import { useAuth } from '../context/AuthContext';
import { connectSocket } from '../socket/socket';
import { Card, Select, Input, Button, Badge } from '../components/ui';

const FloorMap = ({ seats, selectedSeat, onSelect }) => {
    const getSeatColor = (status) => {
        switch (status) {
            case 'AVAILABLE': return 'bg-status-available hover:bg-green-600';
            case 'BOOKED': return 'bg-status-booked';
            case 'MAINTENANCE': return 'bg-status-maintenance';
            case 'CLOSED': return 'bg-status-closed';
            default: return 'bg-gray-400';
        }
    };

    return (
        <div className="bg-gray-100 rounded-lg p-4 min-h-[400px] relative">
            <div className="grid grid-cols-8 gap-2 max-w-4xl mx-auto">
                {Array.isArray(seats) && seats.map((seat) => (
                    <div
                        key={seat._id}
                        onClick={() => {
                            if (seat.status === 'AVAILABLE') {
                                onSelect(seat);
                            }
                        }}
                        className={`aspect-square rounded-lg flex items-center justify-center text-white font-medium text-sm cursor-pointer transition-all transform hover:scale-105 ${
                            getSeatColor(seat.status)
                        } ${
                            selectedSeat?._id === seat._id ? 'ring-4 ring-blue-300 scale-110' : ''
                        } ${
                            seat.status !== 'AVAILABLE' ? 'cursor-not-allowed opacity-75' : ''
                        }`}
                    >
                        {seat.code}
                    </div>
                ))}
            </div>
            
            {/* Legend */}
            <div className="absolute bottom-4 right-4 bg-white rounded-lg p-3 shadow-md">
                <p className="text-xs font-medium text-gray-700 mb-2">Legend</p>
                <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-status-available rounded"></div>
                        <span className="text-xs text-gray-600">Available</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-status-booked rounded"></div>
                        <span className="text-xs text-gray-600">Booked</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-status-maintenance rounded"></div>
                        <span className="text-xs text-gray-600">Maintenance</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-status-closed rounded"></div>
                        <span className="text-xs text-gray-600">Closed</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

const Seats = () => {
    const { user } = useAuth();

    const [seats, setSeats] = useState([]);
    const [selectedSeat, setSelectedSeat] = useState(null);
    const [loading, setLoading] = useState(false);
    const [bookingLoading, setBookingLoading] = useState(false);

    const [filters, setFilters] = useState({
        floor: '',
        status: '',
        page: 1,
        limit: 50,
    });

    const [pagination, setPagination] = useState({
        page: 1,
        totalPages: 1,
    });

    const [booking, setBooking] = useState({
        startTime: '',
        endTime: '',
        purpose: '',
    });

    const [error, setError] = useState('');

    const fetchSeats = async () => {
        setLoading(true);
        setError('');
        try {
            console.log("Fetching seats with filters:", filters);
            const data = await getSeats(filters);
            console.log("Seats API response:", data);
            
            // Standardized data handling
            const seatData = Array.isArray(data) ? data : data?.seats || data?.docs || [];
            
            if (Array.isArray(seatData)) {
                setSeats(seatData);
                setPagination({
                    page: data?.page || 1,
                    totalPages: data?.pages || data?.totalPages || 1,
                });
                console.log("Seats set successfully:", seatData.length, "seats");
            } else {
                console.error("Seats data is not an array:", seatData);
                setSeats([]);
                setError('Invalid data format received');
            }
        } catch (err) {
            console.error('Seat fetch error:', err.response?.data || err);
            setError('Failed to fetch seats');
            // Always set empty array on error
            setSeats([]);
            setPagination({ page: 1, totalPages: 1 });
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (e) => {
        setFilters((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
            page: 1,
        }));
        setSelectedSeat(null);
    };

    useEffect(() => {
        if (!user) return;

        fetchSeats();

        const socket = connectSocket(user.organizationId);
        socket.on('seatBooked', fetchSeats);
        socket.on('seatReleased', fetchSeats);

        return () => {
            socket.disconnect();
        };
    }, [user]);

    useEffect(() => {
        const timeout = setTimeout(() => {
            fetchSeats();
        }, 300);

        return () => clearTimeout(timeout);
    }, [filters]);

    const handleBook = async () => {
        if (!booking.startTime || !booking.endTime) {
            setError('Please select start and end times');
            return;
        }

        if (new Date(booking.startTime) >= new Date(booking.endTime)) {
            setError('End time must be after start time');
            return;
        }

        setBookingLoading(true);
        setError('');

        try {
            if (selectedSeat.status !== 'AVAILABLE') {
                setError('Seat is not available');
                return;
            }

            await createSeatBooking({
                seatId: selectedSeat._id,
                startTime: booking.startTime,
                endTime: booking.endTime,
                purpose: booking.purpose,
            });

            setSelectedSeat(null);
            setBooking({ startTime: '', endTime: '', purpose: '' });
            fetchSeats();
        } catch (err) {
            setError(err.response?.data?.message || 'Booking failed');
        } finally {
            setBookingLoading(false);
        }
    };

    const floorOptions = [
        { value: '', label: 'All Floors' },
        { value: '1', label: 'Floor 1' },
        { value: '2', label: 'Floor 2' },
        { value: '3', label: 'Floor 3' },
    ];

    const statusOptions = [
        { value: '', label: 'All Status' },
        { value: 'AVAILABLE', label: 'Available' },
        { value: 'BOOKED', label: 'Booked' },
        { value: 'MAINTENANCE', label: 'Maintenance' },
        { value: 'CLOSED', label: 'Closed' },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Seat Booking</h1>
                <p className="text-gray-600 mt-2">Select a seat and book your workspace</p>
            </div>

            {/* Filters */}
            <Card className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Filters</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Select
                        label="Floor"
                        name="floor"
                        value={filters.floor}
                        onChange={handleFilterChange}
                        options={floorOptions}
                    />
                    <Select
                        label="Status"
                        name="status"
                        value={filters.status}
                        onChange={handleFilterChange}
                        options={statusOptions}
                    />
                    <div className="flex items-end">
                        <Button
                            onClick={() => setFilters({ floor: '', status: '', page: 1, limit: 50 })}
                            variant="secondary"
                            className="w-full"
                        >
                            Clear Filters
                        </Button>
                    </div>
                </div>
            </Card>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Floor Map */}
                <div className="lg:col-span-2">
                    <Card className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-gray-900">Floor Map</h2>
                            <Badge variant="default">{seats.length} seats</Badge>
                        </div>
                        
                        {loading ? (
                            <div className="flex items-center justify-center h-64">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                            </div>
                        ) : seats.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                                </svg>
                                <p>No seats found</p>
                            </div>
                        ) : (
                            <FloorMap
                                seats={seats}
                                selectedSeat={selectedSeat}
                                onSelect={setSelectedSeat}
                            />
                        )}
                    </Card>
                </div>

                {/* Booking Panel */}
                <div className="lg:col-span-1">
                    <Card className="p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Booking Details</h2>
                        
                        {selectedSeat ? (
                            <div className="space-y-4">
                                <div className="p-4 bg-gray-50 rounded-lg">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="font-medium text-gray-900">Seat {selectedSeat.code}</span>
                                        <Badge variant={selectedSeat.status.toLowerCase()}>
                                            {selectedSeat.status}
                                        </Badge>
                                    </div>
                                    <p className="text-sm text-gray-600">Floor {selectedSeat.floor}</p>
                                    {selectedSeat.type && (
                                        <p className="text-sm text-gray-600">Type: {selectedSeat.type}</p>
                                    )}
                                </div>

                                <Input
                                    label="Start Time"
                                    type="datetime-local"
                                    value={booking.startTime}
                                    onChange={(e) => setBooking(prev => ({ ...prev, startTime: e.target.value }))}
                                    required
                                />

                                <Input
                                    label="End Time"
                                    type="datetime-local"
                                    value={booking.endTime}
                                    onChange={(e) => setBooking(prev => ({ ...prev, endTime: e.target.value }))}
                                    required
                                />

                                <Input
                                    label="Purpose (Optional)"
                                    type="text"
                                    placeholder="Meeting, focus work, etc."
                                    value={booking.purpose}
                                    onChange={(e) => setBooking(prev => ({ ...prev, purpose: e.target.value }))}
                                />

                                {error && (
                                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                        <p className="text-sm text-red-600">{error}</p>
                                    </div>
                                )}

                                <Button
                                    onClick={handleBook}
                                    loading={bookingLoading}
                                    disabled={bookingLoading || selectedSeat.status !== 'AVAILABLE'}
                                    className="w-full"
                                >
                                    {bookingLoading ? 'Booking...' : 'Book Seat'}
                                </Button>
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2z" />
                                </svg>
                                <p>Select a seat to book</p>
                                <p className="text-sm mt-2">Click on an available seat in the floor map</p>
                            </div>
                        )}
                    </Card>
                </div>
            </div>

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

export default Seats;