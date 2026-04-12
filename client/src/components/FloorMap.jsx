const FloorMap = ({ seats, onSelect }) => {
    return (
        <div
            style={{
                position: 'relative',
                width: 600,
                height: 400,
                border: '1px solid #ccc',
            }}
        >
            {seats.map((seat) => (
                <div
                    key={seat._id}
                    onClick={() => {
                        if (seat.status !== 'AVAILABLE') return;
                        onSelect(seat);
                    }}
                    style={{
                        position: 'absolute',
                        left: seat.position?.x || 0,
                        top: seat.position?.y || 0,
                        width: 40,
                        height: 40,
                        cursor: 'pointer',
                        background:
                            seat.status === 'AVAILABLE' ? 'green' : 'gray',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                    }}
                >
                    {seat.code}
                </div>
            ))}
        </div>
    );
};

export default FloorMap;