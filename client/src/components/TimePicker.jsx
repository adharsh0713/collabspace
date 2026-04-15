import { useState } from 'react';

const TimePicker = ({ onChange }) => {
    const [startTime, setStartTime] = useState('');
    const [duration, setDuration] = useState(60); // minutes

    const handleStartChange = (value) => {
        setStartTime(value);

        if (!value) return;

        const start = new Date(value);
        const end = new Date(start.getTime() + duration * 60000);

        onChange({
            startTime: start.toISOString(),
            endTime: end.toISOString(),
        });
    };

    const handleDurationChange = (value) => {
        setDuration(Number(value));

        if (!startTime) return;

        const start = new Date(startTime);
        const end = new Date(start.getTime() + value * 60000);

        onChange({
            startTime: start.toISOString(),
            endTime: end.toISOString(),
        });
    };

    return (
        <div>
            <input
                type="datetime-local"
                onChange={(e) => handleStartChange(e.target.value)}
            />

            <select onChange={(e) => handleDurationChange(e.target.value)}>
                <option value={30}>30 min</option>
                <option value={60}>1 hour</option>
                <option value={120}>2 hours</option>
            </select>
        </div>
    );
};

export default TimePicker;