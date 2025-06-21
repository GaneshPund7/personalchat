import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { jwtDecode } from 'jwt-decode';
// import ChatWindow from '../utils/chatCard';

const socket = io('http://localhost:3000');

function Msg() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const decoded = jwtDecode(token);
      setUserEmail(decoded.email);
    }

    fetch('http://localhost:3000/messages')
      .then((res) => res.json())
      .then((data) => {
        setMessages(data.data);
      })
      .catch((err) => console.error('Failed to fetch messages:', err));

    socket.on('chat message', (msgObj) => {
      setMessages((prev) => [...prev, msgObj]);
    });

    return () => {
      socket.off('chat message');
    };
  }, []);

  const handleSendMessage = (messageText) => {
    const token = localStorage.getItem('token');
    if (!messageText.trim() || !token) return;

    const messageData = {
      token: token,
      content: messageText
    };

    socket.emit('chat message', messageData);
  };

  return (
    <grpChatCard
      messages={messages}
      onSend={handleSendMessage}
      userEmail={userEmail}
      input={input}
      setInput={setInput}
    />
  );
}

export default Msg;
