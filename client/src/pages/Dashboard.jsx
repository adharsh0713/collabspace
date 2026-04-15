import { useEffect, useState } from 'react';
import {checkInSeatBooking, getMySeatBookings} from '../services/seatService';
import {
    getMyRoomBookings,
    checkInRoomBooking,
} from '../services/roomService';
import { Card, Button, Badge } from '../components/ui';
import { useToast } from '../context/ToastContext';

const Dashboard = () => {
    console.log("Dashboard mounted");
    const [seatBookings, setSeatBookings] = useState([]);
    const [roomBookings, setRoomBookings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { success, error: toastError } = useToast();

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            console.log("Fetching dashboard data...");
            const seats = await getMySeatBookings();
            const rooms = await getMyRoomBookings();

            console.log("Seat API response:", seats);
            console.log("Room API response:", rooms);

            // Standardized data handling
            const seatData = Array.isArray(seats) ? seats : seats?.bookings || seats?.docs || [];
            const roomData = Array.isArray(rooms) ? rooms : rooms?.bookings || rooms?.docs || [];

            console.log("Processed seat data:", seatData);
            console.log("Processed room data:", roomData);

            // Always set arrays, never undefined/null
            setSeatBookings(Array.isArray(seatData) ? seatData : []);
            setRoomBookings(Array.isArray(roomData) ? roomData : []);
        } catch (error) {
            console.error("Failed to fetch bookings:", error);
            setError("Failed to load bookings");
            toastError('Failed to fetch bookings');
            // Always set empty arrays on error
            setSeatBookings([]);
            setRoomBookings([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSeatCheckIn = async (id) => {
        if (!id) {
            console.error("No booking ID provided for seat check-in");
            toastError('Invalid booking ID');
            return;
        }
        
        try {
            console.log("Checking in seat booking:", id);
            await checkInSeatBooking(id);
            success('Seat checked in successfully!');
            fetchData();
        } catch (error) {
            console.error('Seat check-in failed:', error);
            toastError('Check-in failed');
        }
    };

    const handleRoomCheckIn = async (id) => {
        if (!id) {
            console.error("No booking ID provided for room check-in");
            toastError('Invalid booking ID');
            return;
        }
        
        try {
            console.log("Checking in room booking:", id);
            await checkInRoomBooking(id);
            success('Room checked in successfully!');
            fetchData();
        } catch (error) {
            console.error('Room check-in failed:', error);
            toastError('Check-in failed');
        }
    };

    // Standardized calculated values with safety checks
    const totalSeatBookings = Array.isArray(seatBookings) ? seatBookings.length : 0;
    const totalRoomBookings = Array.isArray(roomBookings) ? roomBookings.length : 0;
    const safeSeatBookings = Array.isArray(seatBookings) ? seatBookings : [];
    const safeRoomBookings = Array.isArray(roomBookings) ? roomBookings : [];
    const allBookings = [...safeSeatBookings, ...safeRoomBookings];
    const noShows = allBookings.filter(b => b && b.status === 'NO_SHOW').length;
    const activeBookings = allBookings.filter(b => b && b.status === 'BOOKED').length;

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

    const getStatusBadge = (status) => {
        const variant = status === 'BOOKED' ? 'booked' : 
                       status === 'CHECKED_IN' ? 'success' : 
                       status === 'NO_SHOW' ? 'error' : 'default';
        return <Badge variant={variant}>{status.replace('_', ' ')}</Badge>;
    };

    // Comprehensive loading state - ALWAYS render something
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-900">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <div className="text-white text-lg">Loading dashboard...</div>
                </div>
            </div>
        );
    }

    // Error state with retry - ALWAYS render something
    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-900">
                <div className="text-center">
                    <div className="text-red-400 text-lg mb-4">Failed to load dashboard</div>
                    <button 
                        onClick={fetchData}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    // Final safety check - NEVER render with undefined data
    if (!Array.isArray(seatBookings) || !Array.isArray(roomBookings)) {
        console.log("Dashboard: Invalid data state, showing loading");
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-900">
                <div className="text-white text-lg">Loading dashboard...</div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-white">Dashboard</h1>
                <p className="text-gray-400 mt-2">Overview of your bookings and workspace utilization</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="p-6 bg-gray-800 border-gray-700">
                    <div className="flex items-center">
                        <div className="p-3 bg-blue-600/20 rounded-lg">
                            <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                            </svg>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-400">Total Seat Bookings</p>
                            <p className="text-2xl font-bold text-white">{totalSeatBookings}</p>
                        </div>
                    </div>
                </Card>

                <Card className="p-6 bg-gray-800 border-gray-700">
                    <div className="flex items-center">
                        <div className="p-3 bg-green-600/20 rounded-lg">
                            <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-400">Total Room Bookings</p>
                            <p className="text-2xl font-bold text-white">{totalRoomBookings}</p>
                        </div>
                    </div>
                </Card>

                <Card className="p-6 bg-gray-800 border-gray-700">
                    <div className="flex items-center">
                        <div className="p-3 bg-red-600/20 rounded-lg">
                            <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-400">No Shows</p>
                            <p className="text-2xl font-bold text-white">{noShows}</p>
                        </div>
                    </div>
                </Card>

                <Card className="p-6 bg-gray-800 border-gray-700">
                    <div className="flex items-center">
                        <div className="p-3 bg-purple-600/20 rounded-lg">
                            <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            </svg>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-400">Active Bookings</p>
                            <p className="text-2xl font-bold text-white">{activeBookings}</p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* My Bookings Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Seat Bookings */}
                <Card className="p-6 bg-gray-800 border-gray-700">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-semibold text-white">My Seat Bookings</h2>
                        <Badge variant="default" className="bg-gray-700 text-gray-300">{seatBookings.length} total</Badge>
                    </div>
                    
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                        {!Array.isArray(seatBookings) || seatBookings.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                                </svg>
                                <p>No seat bookings yet</p>
                            </div>
                        ) : (
                            seatBookings.map((booking) => {
                                if (!booking || !booking._id) return null;
                                return (
                                    <Card key={booking._id} className="p-4 border border-gray-200">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-2 mb-2">
                                                    <span className="font-medium text-gray-900">Seat {booking.seat?.code || 'Unknown'}</span>
                                                    {getStatusBadge(booking.status)}
                                                </div>
                                                <p className="text-sm text-gray-600 mb-1">
                                                    {formatDate(booking.startTime)} - {formatDate(booking.endTime)}
                                                </p>
                                                {booking.purpose && (
                                                    <p className="text-sm text-gray-500">{booking.purpose}</p>
                                                )}
                                            </div>
                                            {booking.status === 'BOOKED' && (
                                                <Button
                                                    size="sm"
                                                    onClick={() => handleSeatCheckIn(booking._id)}
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
                </Card>

                {/* Room Bookings */}
                <Card className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-semibold text-gray-900">My Room Bookings</h2>
                        <Badge variant="default">{roomBookings.length} total</Badge>
                    </div>
                    
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                        {!Array.isArray(roomBookings) || roomBookings.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                                <p>No room bookings yet</p>
                            </div>
                        ) : (
                            roomBookings.map((booking) => {
                                if (!booking || !booking._id) return null;
                                return (
                                    <Card key={booking._id} className="p-4 border border-gray-200">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-2 mb-2">
                                                    <span className="font-medium text-gray-900">Room {booking.room || 'Unknown'}</span>
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
                                                    onClick={() => handleRoomCheckIn(booking._id)}
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
                </Card>
            </div>
        </div>
    );
};

export default Dashboard;