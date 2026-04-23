import { useEffect, useState, useCallback } from 'react';
import { MonitorSmartphone, Clock, CheckCircle2, Info } from 'lucide-react';
import { format, formatDistanceToNow, isFuture } from 'date-fns';
import { getSeats, createSeatBooking } from '../services/seatService';
import { useAuth } from '../context/AuthContext';
import { connectSocket } from '../socket/socket';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button, Input } from '../components/ui';

/* ─── Seat status config ──────────────────────────────────── */
const STATUS_CONFIG = {
    AVAILABLE:   { bg: 'bg-emerald-500 hover:bg-emerald-400', text: 'text-white', label: 'Available', dot: 'bg-emerald-500' },
    BOOKED:      { bg: 'bg-slate-300 cursor-not-allowed',      text: 'text-slate-500', label: 'Booked',    dot: 'bg-slate-400' },
    MAINTENANCE: { bg: 'bg-amber-400 cursor-not-allowed',      text: 'text-white',     label: 'Maintenance', dot: 'bg-amber-400' },
    CLOSED:      { bg: 'bg-red-400 cursor-not-allowed',        text: 'text-white',     label: 'Closed',    dot: 'bg-red-400' },
};

/* ─── Floor Map ───────────────────────────────────────────── */
const FloorMap = ({ seats, selectedSeat, onSelect }) => {
    if (!seats.length) return null;

    // Group seats by row (first character of code)
    const rows = seats.reduce((acc, seat) => {
        const row = seat.code?.[0] || '?';
        if (!acc[row]) acc[row] = [];
        acc[row].push(seat);
        return acc;
    }, {});

    return (
        <div className="space-y-3">
            {Object.entries(rows).map(([row, rowSeats]) => (
                <div key={row} className="flex items-center gap-2">
                    <span className="w-5 text-xs font-bold text-slate-400 flex-shrink-0">{row}</span>
                    <div className="flex flex-wrap gap-2">
                        {rowSeats.sort((a, b) => a.code?.localeCompare(b.code)).map(seat => {
                            const cfg = STATUS_CONFIG[seat.status] || STATUS_CONFIG.CLOSED;
                            const isSelected = selectedSeat?._id === seat._id;
                            return (
                                <button
                                    key={seat._id}
                                    onClick={() => seat.status === 'AVAILABLE' && onSelect(seat)}
                                    title={`${seat.code} — ${cfg.label}`}
                                    className={`
                                        w-9 h-9 rounded-md text-xs font-bold transition-all duration-150
                                        ${cfg.bg} ${cfg.text}
                                        ${isSelected ? 'ring-2 ring-offset-2 ring-primary scale-110' : ''}
                                        ${seat.status === 'AVAILABLE' ? 'hover:scale-105 active:scale-95 shadow-sm' : 'opacity-70'}
                                    `}
                                >
                                    {seat.code?.slice(1) || seat.code}
                                </button>
                            );
                        })}
                    </div>
                </div>
            ))}

            {/* Legend */}
            <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-slate-100 mt-2">
                {Object.entries(STATUS_CONFIG).map(([status, cfg]) => (
                    <div key={status} className="flex items-center gap-1.5">
                        <span className={`w-2.5 h-2.5 rounded-sm ${cfg.dot}`}></span>
                        <span className="text-xs text-slate-500 font-medium">{cfg.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

/* ─── Main Page ───────────────────────────────────────────── */
const Seats = () => {
    const { user } = useAuth();
    const [seats, setSeats] = useState([]);
    const [selectedSeat, setSelectedSeat] = useState(null);
    const [loading, setLoading] = useState(false);
    const [bookingLoading, setBookingLoading] = useState(false);
    const [error, setError] = useState('');
    const [bookingError, setBookingError] = useState('');
    
    // Track successful booking object for confirmation card
    const [confirmedBooking, setConfirmedBooking] = useState(null);

    const [filters, setFilters] = useState({ floor: '', status: '' });
    const [booking, setBooking] = useState({ startTime: '', endTime: '', purpose: '' });

    /* ── Fetch seats ── */
    const fetchSeats = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const params = {};
            if (filters.floor) params.floor = filters.floor;
            if (filters.status) params.status = filters.status;

            const data = await getSeats(params);
            const seatData = Array.isArray(data) ? data : data?.seats || data?.docs || [];
            setSeats(Array.isArray(seatData) ? seatData : []);
        } catch (err) {
            setError('Failed to load seats');
            setSeats([]);
        } finally {
            setLoading(false);
        }
    }, [filters.floor, filters.status]);

    useEffect(() => {
        fetchSeats();
    }, [fetchSeats]);

    useEffect(() => {
        if (!user) return;
        const socket = connectSocket(user.organizationId);
        socket.on('seatBooked', fetchSeats);
        socket.on('seatReleased', fetchSeats);
        return () => socket.disconnect();
    }, [user, fetchSeats]);

    const handleSelectSeat = (seat) => {
        setSelectedSeat(seat);
        setConfirmedBooking(null); // Clear confirmation if picking new seat
        setBookingError('');
    };

    const handleBook = async () => {
        if (!booking.startTime || !booking.endTime) { setBookingError('Please fill in start and end time'); return; }
        if (new Date(booking.startTime) >= new Date(booking.endTime)) { setBookingError('End time must be after start time'); return; }

        setBookingLoading(true);
        setBookingError('');
        try {
            const newBooking = await createSeatBooking({ seatId: selectedSeat._id, ...booking });
            // Show confirmation card
            setConfirmedBooking({
                ...newBooking, // createSeatBooking returns res.data.data directly
                seatCode: selectedSeat.code,
                startTime: booking.startTime,
                endTime: booking.endTime
            });
            setBooking({ startTime: '', endTime: '', purpose: '' });
            fetchSeats();
        } catch (err) {
            setBookingError(err.response?.data?.message || 'Booking failed');
        } finally {
            setBookingLoading(false);
        }
    };

    const available = seats.filter(s => s.status === 'AVAILABLE').length;
    const booked = seats.filter(s => s.status === 'BOOKED').length;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-end justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Seat Booking</h1>
                    <p className="text-slate-500 text-sm mt-1">Pick a seat from the floor map and book it</p>
                </div>
                <div className="hidden sm:flex items-center gap-3 text-sm bg-white border border-slate-200 rounded-lg px-4 py-2 shadow-sm">
                    <span className="flex items-center gap-1.5 text-emerald-600 font-semibold">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>{available} available
                    </span>
                    <span className="text-slate-300">|</span>
                    <span className="flex items-center gap-1.5 text-slate-500">
                        <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span>{booked} booked
                    </span>
                </div>
            </div>

            {/* Filters Row */}
            <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-1.5 shadow-sm">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mr-1">Floor</span>
                    {['', '1', '2', '3'].map(f => (
                        <button
                            key={f}
                            onClick={() => { setFilters(p => ({ ...p, floor: f })); setSelectedSeat(null); setConfirmedBooking(null); }}
                            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                                filters.floor === f
                                    ? 'bg-primary text-white shadow-sm'
                                    : 'text-slate-600 hover:bg-slate-100'
                            }`}
                        >
                            {f === '' ? 'All' : `F${f}`}
                        </button>
                    ))}
                </div>

                <div className="hidden md:flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-1.5 shadow-sm">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mr-1">Status</span>
                    {[
                        { value: '', label: 'All' },
                        { value: 'AVAILABLE', label: 'Available' },
                        { value: 'BOOKED', label: 'Booked' },
                    ].map(opt => (
                        <button
                            key={opt.value}
                            onClick={() => { setFilters(p => ({ ...p, status: opt.value })); setSelectedSeat(null); setConfirmedBooking(null); }}
                            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                                filters.status === opt.value
                                    ? 'bg-primary text-white shadow-sm'
                                    : 'text-slate-600 hover:bg-slate-100'
                            }`}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>

                {(filters.floor || filters.status) && (
                    <button
                        onClick={() => { setFilters({ floor: '', status: '' }); setSelectedSeat(null); setConfirmedBooking(null); }}
                        className="text-xs font-medium text-slate-400 hover:text-slate-600 transition-colors underline ml-2"
                    >
                        Clear filters
                    </button>
                )}
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Floor Map */}
                <Card className="xl:col-span-2 border-0 shadow-md">
                    <CardHeader className="border-b border-slate-100 pb-4 flex flex-row items-center justify-between">
                        <CardTitle className="text-lg">Floor Map</CardTitle>
                        <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                            {seats.length} seats shown
                        </span>
                    </CardHeader>
                    <CardContent className="pt-6">
                        {loading ? (
                            <div className="flex items-center justify-center h-64">
                                <div className="flex flex-col items-center gap-3 text-primary">
                                    <svg className="animate-spin h-8 w-8" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                                    </svg>
                                </div>
                            </div>
                        ) : error ? (
                            <div className="flex items-center justify-center h-64 text-danger-500 text-sm font-medium">{error}</div>
                        ) : seats.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                                <span className="text-4xl mb-3">🪑</span>
                                <p className="text-sm font-medium">No seats match this filter</p>
                            </div>
                        ) : (
                            <FloorMap seats={seats} selectedSeat={selectedSeat} onSelect={handleSelectSeat} />
                        )}
                    </CardContent>
                </Card>

                {/* Booking Panel */}
                <Card className="border-0 shadow-md overflow-hidden">
                    {confirmedBooking ? (
                        <div className="h-full flex flex-col">
                            <div className="bg-success px-6 py-8 text-white text-center">
                                <CheckCircle2 className="w-16 h-16 mx-auto mb-4 text-success-100" />
                                <h3 className="text-2xl font-bold mb-1">Seat Booked!</h3>
                                <p className="text-success-100 text-sm">Your reservation is confirmed</p>
                            </div>
                            <div className="p-6 flex-1 bg-slate-50 space-y-4">
                                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-primary-50 p-2.5 rounded-lg text-primary-600">
                                            <MonitorSmartphone className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Seat Code</p>
                                            <p className="text-lg font-bold text-slate-900">{confirmedBooking.seatCode}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
                                    <div className="flex items-start gap-3">
                                        <Clock className="w-5 h-5 text-slate-400 mt-0.5" />
                                        <div>
                                            <p className="text-sm font-medium text-slate-900">
                                                {format(new Date(confirmedBooking.startTime), 'MMM d, h:mm a')}
                                            </p>
                                            <p className="text-xs text-slate-500 mt-0.5">
                                                Until {format(new Date(confirmedBooking.endTime), 'h:mm a')}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-warning-50 border border-warning-200 p-4 rounded-xl flex items-start gap-3">
                                    <Info className="w-5 h-5 text-warning-600 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="text-sm font-semibold text-warning-900">Check-in Reminder</p>
                                        <p className="text-xs text-warning-800 mt-1 leading-relaxed">
                                            {isFuture(new Date(confirmedBooking.startTime)) 
                                                ? `Check-in opens in ${formatDistanceToNow(new Date(confirmedBooking.startTime))}. ` 
                                                : "Check-in is now open. "}
                                            If you don't check in within 15 mins of start time, your seat will be released.
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="p-6 bg-white border-t border-slate-100">
                                <Button className="w-full" onClick={() => { setConfirmedBooking(null); setSelectedSeat(null); }}>
                                    Done
                                </Button>
                            </div>
                        </div>
                    ) : selectedSeat ? (
                        <div>
                            <div className="px-6 py-5 bg-primary text-white">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs font-medium text-primary-200 uppercase tracking-wider">Selected Seat</p>
                                        <p className="text-2xl font-bold mt-1">{selectedSeat.code}</p>
                                    </div>
                                    <div className="text-right text-sm">
                                        <p className="text-primary-100 font-medium">Floor {selectedSeat.floor}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 space-y-5">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Start Time</label>
                                    <Input
                                        type="datetime-local"
                                        value={booking.startTime}
                                        onChange={e => setBooking(p => ({ ...p, startTime: e.target.value }))}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">End Time</label>
                                    <Input
                                        type="datetime-local"
                                        value={booking.endTime}
                                        onChange={e => setBooking(p => ({ ...p, endTime: e.target.value }))}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Purpose <span className="text-slate-400 normal-case font-medium">(optional)</span></label>
                                    <Input
                                        type="text"
                                        placeholder="e.g. Focus work, Meetings…"
                                        value={booking.purpose}
                                        onChange={e => setBooking(p => ({ ...p, purpose: e.target.value }))}
                                    />
                                </div>

                                {bookingError && <p className="text-xs text-danger-600 bg-danger-50 border border-danger-200 px-3 py-2.5 rounded-lg font-medium">{bookingError}</p>}

                                <div className="flex gap-3 pt-2">
                                    <Button
                                        onClick={handleBook}
                                        disabled={bookingLoading}
                                        className="flex-1 py-2.5"
                                    >
                                        {bookingLoading ? 'Booking…' : 'Confirm Booking'}
                                    </Button>
                                    <Button
                                        onClick={() => { setSelectedSeat(null); setBookingError(''); }}
                                        variant="secondary"
                                        className="px-4"
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center p-8 bg-slate-50">
                            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm border border-slate-100">
                                <MonitorSmartphone className="w-7 h-7 text-primary-400" />
                            </div>
                            <h3 className="text-slate-800 font-bold text-lg">No seat selected</h3>
                            <p className="text-slate-500 text-sm mt-2 max-w-[200px] mx-auto leading-relaxed">
                                Click an available green seat on the floor map to start booking.
                            </p>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
};

export default Seats;