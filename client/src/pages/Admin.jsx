import { useState } from 'react';
import { createSeat, createRoom } from '../services/adminService';
import { Card, Input, Button, Select } from '../components/ui';

const Admin = () => {
    const [activeTab, setActiveTab] = useState('seats');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [seat, setSeat] = useState({
        code: '',
        floor: '',
        type: 'STANDARD',
    });

    const [room, setRoom] = useState({
        name: '',
        capacity: '',
        floor: '',
        amenities: '',
        equipment: '',
        description: '',
    });

    const handleSeatChange = (e) => {
        setSeat({ ...seat, [e.target.name]: e.target.value });
        setError('');
        setSuccess('');
    };

    const handleRoomChange = (e) => {
        setRoom({ ...room, [e.target.name]: e.target.value });
        setError('');
        setSuccess('');
    };

    const validateSeat = () => {
        if (!seat.code.trim()) {
            setError('Seat code is required');
            return false;
        }
        if (!seat.floor) {
            setError('Floor is required');
            return false;
        }
        return true;
    };

    const validateRoom = () => {
        if (!room.name.trim()) {
            setError('Room name is required');
            return false;
        }
        if (!room.capacity || room.capacity < 1) {
            setError('Capacity must be at least 1');
            return false;
        }
        if (!room.floor) {
            setError('Floor is required');
            return false;
        }
        return true;
    };

    const handleCreateSeat = async () => {
        if (!validateSeat()) return;

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            await createSeat({
                code: seat.code.trim(),
                floor: Number(seat.floor),
                type: seat.type,
            });

            setSeat({ code: '', floor: '', type: 'STANDARD' });
            setSuccess('Seat created successfully!');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create seat');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateRoom = async () => {
        if (!validateRoom()) return;

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const amenities = room.amenities ? room.amenities.split(',').map(a => a.trim()).filter(Boolean) : [];
            const equipment = room.equipment ? room.equipment.split(',').map(e => e.trim()).filter(Boolean) : [];

            await createRoom({
                name: room.name.trim(),
                capacity: Number(room.capacity),
                floor: Number(room.floor),
                amenities,
                equipment,
                description: room.description.trim(),
            });

            setRoom({ name: '', capacity: '', floor: '', amenities: '', equipment: '', description: '' });
            setSuccess('Room created successfully!');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create room');
        } finally {
            setLoading(false);
        }
    };

    const floorOptions = [
        { value: '', label: 'Select floor' },
        { value: '1', label: 'Floor 1' },
        { value: '2', label: 'Floor 2' },
        { value: '3', label: 'Floor 3' },
        { value: '4', label: 'Floor 4' },
    ];

    const seatTypeOptions = [
        { value: 'STANDARD', label: 'Standard' },
        { value: 'PREMIUM', label: 'Premium' },
        { value: 'EXECUTIVE', label: 'Executive' },
        { value: 'STANDING', label: 'Standing Desk' },
    ];

    const tabs = [
        { id: 'seats', label: 'Create Seats', icon: 'event_seat' },
        { id: 'rooms', label: 'Create Rooms', icon: 'meeting_room' },
    ];

    const getTabIcon = (iconName) => {
        const icons = {
            event_seat: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                </svg>
            ),
            meeting_room: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
            ),
        };
        return icons[iconName];
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Admin Panel</h1>
                <p className="text-gray-500 mt-1">Manage seats and rooms for your organization</p>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => {
                                setActiveTab(tab.id);
                                setError('');
                                setSuccess('');
                            }}
                            className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                                activeTab === tab.id
                                    ? 'border-primary-500 text-primary-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            {getTabIcon(tab.icon)}
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </nav>
            </div>

            {/* Tab Content */}
            <div className="mt-6">
                {activeTab === 'seats' ? (
                    <Card className="p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-6">Create New Seat</h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <Input
                                label="Seat Code"
                                name="code"
                                placeholder="e.g., A1, B2, C3"
                                value={seat.code}
                                onChange={handleSeatChange}
                                required
                            />

                            <Select
                                label="Floor"
                                name="floor"
                                value={seat.floor}
                                onChange={handleSeatChange}
                                options={floorOptions}
                                required
                            />

                            <Select
                                label="Seat Type"
                                name="type"
                                value={seat.type}
                                onChange={handleSeatChange}
                                options={seatTypeOptions}
                            />
                        </div>

                        {error && (
                            <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3">
                                <p className="text-sm text-red-600">{error}</p>
                            </div>
                        )}

                        {success && (
                            <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-3">
                                <p className="text-sm text-green-600">{success}</p>
                            </div>
                        )}

                        <div className="mt-6">
                            <Button
                                onClick={handleCreateSeat}
                                loading={loading}
                                disabled={loading}
                            >
                                {loading ? 'Creating Seat...' : 'Create Seat'}
                            </Button>
                        </div>
                    </Card>
                ) : (
                    <Card className="p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-6">Create New Room</h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <Input
                                    label="Room Name"
                                    name="name"
                                    placeholder="e.g., Conference Room A"
                                    value={room.name}
                                    onChange={handleRoomChange}
                                    required
                                />

                                <Input
                                    label="Capacity"
                                    name="capacity"
                                    type="number"
                                    placeholder="e.g., 10"
                                    value={room.capacity}
                                    onChange={handleRoomChange}
                                    min="1"
                                    required
                                />

                                <Select
                                    label="Floor"
                                    name="floor"
                                    value={room.floor}
                                    onChange={handleRoomChange}
                                    options={floorOptions}
                                    required
                                />
                            </div>

                            <div className="space-y-4">
                                <Input
                                    label="Amenities"
                                    name="amenities"
                                    placeholder="e.g., WiFi, Air Conditioning, Coffee"
                                    value={room.amenities}
                                    onChange={handleRoomChange}
                                />

                                <Input
                                    label="Equipment"
                                    name="equipment"
                                    placeholder="e.g., Projector, Whiteboard, TV"
                                    value={room.equipment}
                                    onChange={handleRoomChange}
                                />

                                <Input
                                    label="Description"
                                    name="description"
                                    placeholder="Optional room description"
                                    value={room.description}
                                    onChange={handleRoomChange}
                                />
                            </div>
                        </div>

                        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-600">
                                <strong>Note:</strong> Enter multiple amenities or equipment as comma-separated values.
                            </p>
                        </div>

                        {error && (
                            <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3">
                                <p className="text-sm text-red-600">{error}</p>
                            </div>
                        )}

                        {success && (
                            <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-3">
                                <p className="text-sm text-green-600">{success}</p>
                            </div>
                        )}

                        <div className="mt-6">
                            <Button
                                onClick={handleCreateRoom}
                                loading={loading}
                                disabled={loading}
                            >
                                {loading ? 'Creating Room...' : 'Create Room'}
                            </Button>
                        </div>
                    </Card>
                )}
            </div>
        </div>
    );
};

export default Admin;