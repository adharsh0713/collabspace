import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow, isFuture, isPast } from 'date-fns';
import { Calendar, MonitorSmartphone, MapPin, Clock } from 'lucide-react';
import { checkInSeatBooking, getMySeatBookings } from '../services/seatService';
import { getMyRoomBookings, checkInRoomBooking } from '../services/roomService';
import { useToast } from '../context/ToastContext';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import { Skeleton } from '../components/ui/Skeleton';

const formatDate = (d) => {
    if (!d) return '—';
    try {
        return new Date(d).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch { return '—'; }
};

const Dashboard = () => {
    const [seatBookings, setSeatBookings] = useState([]);
    const [roomBookings, setRoomBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const { success, error: toastError } = useToast();

    const fetchData = async () => {
        setLoading(true);
        try {
            const [seats, rooms] = await Promise.all([getMySeatBookings(), getMyRoomBookings()]);
            setSeatBookings(Array.isArray(seats) ? seats : seats?.bookings || seats?.docs || []);
            setRoomBookings(Array.isArray(rooms) ? rooms : rooms?.bookings || rooms?.docs || []);
        } catch {
            toastError('Failed to fetch bookings');
            setSeatBookings([]); setRoomBookings([]);
        } finally { setLoading(false); }
    };

    useEffect(() => { fetchData(); }, []);

    const checkInSeat = async (id) => {
        try { await checkInSeatBooking(id); success('Seat Checked in!'); fetchData(); }
        catch { toastError('Check-in failed'); }
    };
    const checkInRoom = async (id) => {
        try { await checkInRoomBooking(id); success('Room Checked in!'); fetchData(); }
        catch { toastError('Check-in failed'); }
    };

    const safe = (arr) => Array.isArray(arr) ? arr : [];
    const allBookings = [...safe(seatBookings), ...safe(roomBookings)]
        .filter(b => b?._id && b.status === 'BOOKED' && isFuture(new Date(b.startTime)))
        .sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

    const nextMeeting = allBookings[0];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header & Quick Actions */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard</h1>
                    <p className="text-slate-500 mt-1">Manage your workspace and meetings</p>
                </div>
                <div className="flex items-center gap-3">
                    <Link to="/seats" className="inline-flex items-center justify-center rounded-lg bg-white border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 transition-colors">
                        <MonitorSmartphone className="mr-2 h-4 w-4" />
                        Book Seat
                    </Link>
                    <Link to="/rooms" className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white shadow hover:bg-primary-700 transition-colors">
                        <Calendar className="mr-2 h-4 w-4" />
                        Book Room
                    </Link>
                </div>
            </div>

            {/* Next Meeting Banner */}
            {loading ? (
                <Skeleton className="w-full h-32 rounded-xl" />
            ) : nextMeeting ? (
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-primary-600 to-indigo-700 p-6 sm:p-8 shadow-lg text-white">
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <div className="flex items-center gap-2 text-primary-100 mb-2">
                                <Clock className="h-4 w-4" />
                                <span className="text-sm font-medium uppercase tracking-wider">Next up in {formatDistanceToNow(new Date(nextMeeting.startTime))}</span>
                            </div>
                            <h2 className="text-2xl sm:text-3xl font-bold mb-1">
                                {nextMeeting.room ? nextMeeting.room.name : `Seat ${nextMeeting.seat?.code}`}
                            </h2>
                            <p className="text-primary-100 flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                {formatDate(nextMeeting.startTime)} - {formatDate(nextMeeting.endTime)}
                            </p>
                        </div>
                        <div className="flex-shrink-0">
                            <button
                                onClick={() => nextMeeting.room ? checkInRoom(nextMeeting._id) : checkInSeat(nextMeeting._id)}
                                className="w-full md:w-auto inline-flex items-center justify-center rounded-lg bg-white/20 hover:bg-white/30 px-6 py-3 text-sm font-semibold text-white backdrop-blur-md transition-colors"
                            >
                                Check In Now
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center bg-slate-50">
                    <Calendar className="mx-auto h-8 w-8 text-slate-400 mb-3" />
                    <h3 className="text-lg font-medium text-slate-900">No upcoming bookings</h3>
                    <p className="text-slate-500 mt-1">You're all clear! Book a seat or room to get started.</p>
                </div>
            )}

            {/* Upcoming Bookings Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader className="border-b border-slate-100 pb-4">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <MonitorSmartphone className="h-5 w-5 text-slate-500" />
                                Upcoming Seats
                            </CardTitle>
                            <Badge variant="primary">{safe(seatBookings).length}</Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        {loading ? (
                            <div className="p-6 space-y-4"><Skeleton className="h-12 w-full"/><Skeleton className="h-12 w-full"/></div>
                        ) : safe(seatBookings).length === 0 ? (
                            <div className="p-8 text-center text-slate-500">No active seat bookings.</div>
                        ) : (
                            <div className="divide-y divide-slate-100 max-h-[400px] overflow-y-auto">
                                {safe(seatBookings).map(b => (
                                    <div key={b._id} className="p-4 hover:bg-slate-50 transition-colors flex justify-between items-center group">
                                        <div>
                                            <p className="font-semibold text-slate-900">Seat {b.seat?.code}</p>
                                            <p className="text-xs text-slate-500 mt-0.5">{formatDate(b.startTime)}</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Badge variant={b.status.toLowerCase()}>{b.status}</Badge>
                                            {b.status === 'BOOKED' && (
                                                <button onClick={() => checkInSeat(b._id)} className="text-primary-600 hover:text-primary-800 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                                                    Check in
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="border-b border-slate-100 pb-4">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Calendar className="h-5 w-5 text-slate-500" />
                                Upcoming Rooms
                            </CardTitle>
                            <Badge variant="booked">{safe(roomBookings).length}</Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        {loading ? (
                            <div className="p-6 space-y-4"><Skeleton className="h-12 w-full"/><Skeleton className="h-12 w-full"/></div>
                        ) : safe(roomBookings).length === 0 ? (
                            <div className="p-8 text-center text-slate-500">No active room bookings.</div>
                        ) : (
                            <div className="divide-y divide-slate-100 max-h-[400px] overflow-y-auto">
                                {safe(roomBookings).map(b => (
                                    <div key={b._id} className="p-4 hover:bg-slate-50 transition-colors flex justify-between items-center group">
                                        <div>
                                            <p className="font-semibold text-slate-900">{b.room?.name || 'Room'}</p>
                                            <p className="text-xs text-slate-500 mt-0.5">{formatDate(b.startTime)}</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Badge variant={b.status.toLowerCase()}>{b.status}</Badge>
                                            {b.status === 'BOOKED' && (
                                                <button onClick={() => checkInRoom(b._id)} className="text-primary-600 hover:text-primary-800 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                                                    Check in
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Dashboard;