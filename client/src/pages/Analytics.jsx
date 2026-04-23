import { useEffect, useState } from 'react';
import { getAnalytics } from '../services/analyticsService';

/* ─── Thin animated progress bar ─────────────────────────── */
const Bar = ({ pct, color }) => {
    const colors = {
        indigo:  'from-indigo-500 to-indigo-400',
        violet:  'from-violet-500 to-violet-400',
        emerald: 'from-emerald-500 to-teal-400',
        rose:    'from-rose-500 to-pink-400',
        amber:   'from-amber-500 to-yellow-400',
    };
    return (
        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
                className={`h-2 rounded-full bg-gradient-to-r ${colors[color]} transition-all duration-700`}
                style={{ width: `${Math.min(pct, 100)}%` }}
            />
        </div>
    );
};

/* ─── KPI Card: colored top stripe, no icon ──────────────── */
const KpiCard = ({ label, value, sub, stripe }) => {
    const stripes = {
        indigo:  'bg-gradient-to-r from-indigo-500 to-indigo-600',
        violet:  'bg-gradient-to-r from-violet-500 to-purple-600',
        rose:    'bg-gradient-to-r from-rose-500 to-pink-500',
        emerald: 'bg-gradient-to-r from-emerald-500 to-teal-500',
    };
    const texts = {
        indigo: 'text-indigo-600', violet: 'text-violet-600',
        rose: 'text-rose-600',     emerald: 'text-emerald-600',
    };
    return (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className={`h-1.5 w-full ${stripes[stripe]}`} />
            <div className="px-5 py-4">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</p>
                <p className={`text-3xl font-bold mt-1 ${texts[stripe]}`}>{value}</p>
                {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
            </div>
        </div>
    );
};

/* ─── Stat trio inside a card ────────────────────────────── */
const StatTrio = ({ items }) => (
    <div className="grid grid-cols-3 gap-0 divide-x divide-slate-100">
        {items.map(({ label, value, color }) => (
            <div key={label} className="text-center py-4">
                <p className={`text-2xl font-bold ${color}`}>{value}</p>
                <p className="text-xs text-slate-400 mt-0.5">{label}</p>
            </div>
        ))}
    </div>
);

/* ─── Analytics Page ─────────────────────────────────────── */
const Analytics = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        (async () => {
            try {
                setLoading(true);
                setData(await getAnalytics());
            } catch {
                setError('Failed to load analytics data');
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    if (loading) return (
        <div className="flex items-center justify-center min-h-[50vh]">
            <div className="text-center">
                <svg className="animate-spin h-7 w-7 text-indigo-500 mx-auto mb-3" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                <p className="text-sm text-slate-500">Loading analytics…</p>
            </div>
        </div>
    );

    if (error) return (
        <div className="flex items-center justify-center min-h-[50vh]">
            <div className="text-center">
                <p className="text-rose-600 text-sm font-semibold">{error}</p>
                <p className="text-slate-400 text-xs mt-1">Try refreshing the page</p>
            </div>
        </div>
    );

    if (!data) return (
        <div className="flex items-center justify-center min-h-[50vh]">
            <p className="text-slate-400 text-sm">No analytics data available yet</p>
        </div>
    );

    const seatUtil  = data.seats?.utilization  || 0;
    const roomUtil  = data.rooms?.utilization  || 0;
    const noShowRate = data.seats?.noShowRate  || 0;
    const totalBookings = (data.seats?.total || 0) + (data.rooms?.total || 0);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Analytics</h1>
                <p className="text-slate-500 text-sm mt-0.5">Workspace utilization and booking patterns</p>
            </div>

            {/* KPI Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <KpiCard
                    label="Seat Utilization"
                    value={`${seatUtil.toFixed(1)}%`}
                    sub={`${data.seats?.total || 0} total bookings`}
                    stripe={seatUtil > 70 ? 'emerald' : seatUtil > 40 ? 'indigo' : 'rose'}
                />
                <KpiCard
                    label="Room Utilization"
                    value={`${roomUtil.toFixed(1)}%`}
                    sub={`${data.rooms?.total || 0} total bookings`}
                    stripe={roomUtil > 70 ? 'emerald' : roomUtil > 40 ? 'violet' : 'rose'}
                />
                <KpiCard
                    label="No-show Rate"
                    value={`${noShowRate.toFixed(1)}%`}
                    sub={`${data.seats?.noShow || 0} no-shows`}
                    stripe={noShowRate < 10 ? 'emerald' : noShowRate < 20 ? 'indigo' : 'rose'}
                />
                <KpiCard
                    label="Total Bookings"
                    value={totalBookings}
                    sub="seats + rooms combined"
                    stripe="violet"
                />
            </div>

            {/* Detail Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Seat Analytics */}
                <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                    <div className="px-5 pt-5 pb-4 border-b border-slate-100 flex items-center justify-between">
                        <h2 className="text-sm font-semibold text-slate-800">Seat Analytics</h2>
                        <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
                            {seatUtil.toFixed(0)}% utilized
                        </span>
                    </div>

                    <div className="px-5 py-4 space-y-4">
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-medium text-slate-500">Utilization</span>
                                <span className="text-xs font-bold text-slate-700">{seatUtil.toFixed(1)}%</span>
                            </div>
                            <Bar pct={seatUtil} color="indigo" />
                        </div>

                        <StatTrio items={[
                            { label: 'Total',     value: data.seats?.total     || 0, color: 'text-slate-800' },
                            { label: 'Completed', value: data.seats?.completed || 0, color: 'text-emerald-600' },
                            { label: 'No-shows',  value: data.seats?.noShow    || 0, color: 'text-rose-500' },
                        ]} />

                        {data.seats?.peakHours?.length > 0 && (
                            <div>
                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Peak Hours</p>
                                <div className="flex flex-wrap gap-1.5">
                                    {data.seats.peakHours.map((h, i) => (
                                        <span key={i} className="px-2.5 py-1 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded-full border border-indigo-100">
                                            {h}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Room Analytics */}
                <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                    <div className="px-5 pt-5 pb-4 border-b border-slate-100 flex items-center justify-between">
                        <h2 className="text-sm font-semibold text-slate-800">Room Analytics</h2>
                        <span className="text-xs font-bold text-violet-600 bg-violet-50 px-2.5 py-1 rounded-full">
                            {roomUtil.toFixed(0)}% utilized
                        </span>
                    </div>

                    <div className="px-5 py-4 space-y-4">
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-medium text-slate-500">Utilization</span>
                                <span className="text-xs font-bold text-slate-700">{roomUtil.toFixed(1)}%</span>
                            </div>
                            <Bar pct={roomUtil} color="violet" />
                        </div>

                        <StatTrio items={[
                            { label: 'Total',     value: data.rooms?.total     || 0, color: 'text-slate-800' },
                            { label: 'Completed', value: data.rooms?.completed || 0, color: 'text-emerald-600' },
                            { label: 'No-shows',  value: data.rooms?.noShow    || 0, color: 'text-rose-500' },
                        ]} />

                        {data.rooms?.popularRooms?.length > 0 && (
                            <div>
                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Most Popular</p>
                                <div className="space-y-2">
                                    {data.rooms.popularRooms.map((room, i) => {
                                        const maxBookings = data.rooms.popularRooms[0]?.bookings || 1;
                                        const pct = (room.bookings / maxBookings) * 100;
                                        return (
                                            <div key={i}>
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="text-xs font-medium text-slate-600">{room.name}</span>
                                                    <span className="text-xs text-violet-600 font-bold">{room.bookings}</span>
                                                </div>
                                                <Bar pct={pct} color="violet" />
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Insights Strip */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                    {
                        label: 'Avg. Booking Duration',
                        value: data.averageBookingDuration || '0 hrs',
                        stripe: 'from-indigo-500 to-indigo-600',
                        bg: 'bg-indigo-50',
                        text: 'text-indigo-700',
                    },
                    {
                        label: 'Active Users (30d)',
                        value: data.activeUsers || 0,
                        stripe: 'from-violet-500 to-purple-600',
                        bg: 'bg-violet-50',
                        text: 'text-violet-700',
                    },
                ].map(card => (
                    <div key={card.label} className={`${card.bg} border border-slate-200 rounded-xl px-5 py-4 flex items-center justify-between`}>
                        <p className="text-sm font-medium text-slate-600">{card.label}</p>
                        <p className={`text-xl font-bold ${card.text}`}>{card.value}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Analytics;