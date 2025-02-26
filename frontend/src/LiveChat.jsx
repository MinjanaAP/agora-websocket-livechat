import React, { useState, useEffect, useRef } from "react";

const LiveChat = () => {
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState("");
    const ws = useRef(null);

    useEffect(() => {
        ws.current = new WebSocket("ws://localhost:8080");

        ws.current.onmessage = (event) => {
            setMessages((prev) => [...prev, event.data]);
        };

        return () => ws.current.close();
    }, []);

    const sendMessage = () => {
        ws.current.send(message);
        setMessage("");
    };

    return (
        <div>
            <div>
                {messages.map((msg, index) => (
                    <p key={index}>{msg}</p>
                ))}
            </div>
            <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
            />
            <button onClick={sendMessage}>Send</button>
        </div>
    );
};

export default LiveChat;
