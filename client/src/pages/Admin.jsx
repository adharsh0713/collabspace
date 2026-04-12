import { useState } from 'react';
import { createSeat, createRoom } from '../services/adminService';

const Admin = () => {
    const [seat, setSeat] = useState({
        code: '',
        floor: '',
    });

    const [room, setRoom] = useState({
        name: '',
        capacity: '',
        floor: '',
        amenities: '',
    });

    const handleSeatChange = (e) => {
        setSeat({ ...seat, [e.target.name]: e.target.value });
    };

    const handleRoomChange = (e) => {
        setRoom({ ...room, [e.target.name]: e.target.value });
    };

    const handleCreateSeat = async () => {
        await createSeat({
            code: seat.code,
            floor: Number(seat.floor),
        });

        alert('Seat created');
    };

    const handleCreateRoom = async () => {
        await createRoom({
            name: room.name,
            capacity: Number(room.capacity),
            floor: Number(room.floor),
            amenities: room.amenities.split(','),
        });

        alert('Room created');
    };

    return (
        <div>
            <h2>Admin Panel</h2>

            {/* Seat Form */}
            <div>
                <h3>Create Seat</h3>

                <input name="code" placeholder="A1" onChange={handleSeatChange} />
                <input name="floor" placeholder="1" onChange={handleSeatChange} />

                <button onClick={handleCreateSeat}>Create Seat</button>
            </div>

            {/* Room Form */}
            <div>
                <h3>Create Room</h3>

                <input name="name" placeholder="Room 1" onChange={handleRoomChange} />
                <input name="capacity" placeholder="10" onChange={handleRoomChange} />
                <input name="floor" placeholder="1" onChange={handleRoomChange} />
                <input
                    name="amenities"
                    placeholder="PROJECTOR,WHITEBOARD"
                    onChange={handleRoomChange}
                />

                <button onClick={handleCreateRoom}>Create Room</button>
            </div>
        </div>
    );
};

export default Admin;