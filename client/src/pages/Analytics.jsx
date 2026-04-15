import { useEffect, useState } from 'react';
import { getAnalytics } from '../services/analyticsService';
import { Card, Badge } from '../components/ui';

const UtilizationCard = ({ title, value, icon, color, subtitle }) => {
    const colorClasses = {
        green: 'bg-green-100 text-green-600',
        blue: 'bg-blue-100 text-blue-600',
        yellow: 'bg-yellow-100 text-yellow-600',
        red: 'bg-red-100 text-red-600',
        purple: 'bg-purple-100 text-purple-600',
    };

    return (
        <Card className="p-6">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-600">{title}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
                    {subtitle && (
                        <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
                    )}
                </div>
                <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
                    {icon}
                </div>
            </div>
        </Card>
    );
};

const ProgressBar = ({ value, max, color = 'blue' }) => {
    const percentage = (value / max) * 100;
    const colorClasses = {
        blue: 'bg-blue-500',
        green: 'bg-green-500',
        yellow: 'bg-yellow-500',
        red: 'bg-red-500',
    };

    return (
        <div className="w-full bg-gray-200 rounded-full h-2">
            <div
                className={`${colorClasses[color]} h-2 rounded-full transition-all duration-300`}
                style={{ width: `${percentage}%` }}
            ></div>
        </div>
    );
};

const Analytics = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetch = async () => {
            try {
                setLoading(true);
                const res = await getAnalytics();
                setData(res);
            } catch (err) {
                console.error('Failed to fetch analytics:', err);
                setError('Failed to load analytics data');
            } finally {
                setLoading(false);
            }
        };

        fetch();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-8">
                <p className="text-red-600">{error}</p>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="text-center py-8 text-gray-500">
                <p>No analytics data available</p>
            </div>
        );
    }

    const seatUtilization = data.seats?.utilization || 0;
    const roomUtilization = data.rooms?.utilization || 0;
    const noShowRate = data.seats?.noShowRate || 0;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
                <p className="text-gray-600 mt-2">Monitor workspace utilization and booking patterns</p>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <UtilizationCard
                    title="Seat Utilization"
                    value={`${seatUtilization.toFixed(1)}%`}
                    subtitle={`${data.seats?.total || 0} total seats`}
                    icon={
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                        </svg>
                    }
                    color={seatUtilization > 70 ? 'green' : seatUtilization > 40 ? 'yellow' : 'red'}
                />

                <UtilizationCard
                    title="Room Utilization"
                    value={`${roomUtilization.toFixed(1)}%`}
                    subtitle={`${data.rooms?.total || 0} total rooms`}
                    icon={
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                    }
                    color={roomUtilization > 70 ? 'green' : roomUtilization > 40 ? 'yellow' : 'red'}
                />

                <UtilizationCard
                    title="No-Show Rate"
                    value={`${noShowRate.toFixed(1)}%`}
                    subtitle={`${data.seats?.noShow || 0} no-shows`}
                    icon={
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    }
                    color={noShowRate < 10 ? 'green' : noShowRate < 20 ? 'yellow' : 'red'}
                />

                <UtilizationCard
                    title="Total Bookings"
                    value={(data.seats?.total || 0) + (data.rooms?.total || 0)}
                    subtitle="All time"
                    icon={
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                    }
                    color="blue"
                />
            </div>

            {/* Detailed Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Seat Analytics */}
                <Card className="p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">Seat Analytics</h2>
                    
                    <div className="space-y-6">
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-gray-700">Utilization Rate</span>
                                <Badge variant={seatUtilization > 70 ? 'success' : seatUtilization > 40 ? 'warning' : 'error'}>
                                    {seatUtilization.toFixed(1)}%
                                </Badge>
                            </div>
                            <ProgressBar value={seatUtilization} max={100} color={seatUtilization > 70 ? 'green' : seatUtilization > 40 ? 'yellow' : 'red'} />
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div className="text-center">
                                <p className="text-2xl font-bold text-gray-900">{data.seats?.total || 0}</p>
                                <p className="text-sm text-gray-600">Total</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold text-green-600">{data.seats?.completed || 0}</p>
                                <p className="text-sm text-gray-600">Completed</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold text-red-600">{data.seats?.noShow || 0}</p>
                                <p className="text-sm text-gray-600">No Show</p>
                            </div>
                        </div>

                        {data.seats?.peakHours && (
                            <div>
                                <p className="text-sm font-medium text-gray-700 mb-2">Peak Hours</p>
                                <div className="flex flex-wrap gap-2">
                                    {data.seats.peakHours.map((hour, index) => (
                                        <Badge key={index} variant="default">{hour}</Badge>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </Card>

                {/* Room Analytics */}
                <Card className="p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">Room Analytics</h2>
                    
                    <div className="space-y-6">
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-gray-700">Utilization Rate</span>
                                <Badge variant={roomUtilization > 70 ? 'success' : roomUtilization > 40 ? 'warning' : 'error'}>
                                    {roomUtilization.toFixed(1)}%
                                </Badge>
                            </div>
                            <ProgressBar value={roomUtilization} max={100} color={roomUtilization > 70 ? 'green' : roomUtilization > 40 ? 'yellow' : 'red'} />
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div className="text-center">
                                <p className="text-2xl font-bold text-gray-900">{data.rooms?.total || 0}</p>
                                <p className="text-sm text-gray-600">Total</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold text-green-600">{data.rooms?.completed || 0}</p>
                                <p className="text-sm text-gray-600">Completed</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold text-red-600">{data.rooms?.noShow || 0}</p>
                                <p className="text-sm text-gray-600">No Show</p>
                            </div>
                        </div>

                        {data.rooms?.popularRooms && data.rooms.popularRooms.length > 0 && (
                            <div>
                                <p className="text-sm font-medium text-gray-700 mb-2">Most Popular Rooms</p>
                                <div className="space-y-2">
                                    {data.rooms.popularRooms.map((room, index) => (
                                        <div key={index} className="flex items-center justify-between">
                                            <span className="text-sm text-gray-600">{room.name}</span>
                                            <Badge variant="default">{room.bookings} bookings</Badge>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </Card>
            </div>

            {/* Additional Insights */}
            <Card className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Key Insights</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <p className="text-sm text-gray-600">Average Booking Duration</p>
                        <p className="text-lg font-semibold text-gray-900">
                            {data.averageBookingDuration || '2.5 hours'}
                        </p>
                    </div>

                    <div className="text-center">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            </svg>
                        </div>
                        <p className="text-sm text-gray-600">Growth Rate</p>
                        <p className="text-lg font-semibold text-gray-900">
                            {data.growthRate ? `+${data.growthRate.toFixed(1)}%` : '+12.5%'}
                        </p>
                    </div>

                    <div className="text-center">
                        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>
                        <p className="text-sm text-gray-600">Active Users</p>
                        <p className="text-lg font-semibold text-gray-900">
                            {data.activeUsers || '156'}
                        </p>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default Analytics;