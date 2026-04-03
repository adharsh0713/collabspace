import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import socket from './socket/socket';

socket.on('connect', () => {
    console.log('Connected to server:', socket.id);
});

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);