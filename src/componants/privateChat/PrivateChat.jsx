// import { useEffect, useState } from 'react';
// import { useParams } from 'react-router-dom';
// import { io } from 'socket.io-client';
// import { jwtDecode } from 'jwt-decode';
import ChatWindow from '../../utils/chatCard';

// const socket = io('http://localhost:3000');

// function PrivateChat() {
//     const { receiverEmail } = useParams();
//   const [messages, setMessages] = useState([]);
//   const [input, setInput] = useState('');
//   const [userEmail , setUserEmail] = useState('');
// console.log('User email', userEmail)
//   useEffect(() => {
//     const token = localStorage.getItem('token');
//     console.log("this is token ",token )
//     if (token) {
//       const decoded = jwtDecode(token);
//       setUserEmail(decoded.email);
//     }

//     if (receiverEmail) {
//       fetch(`http://localhost:3000/private-chat?receiverEmail=${receiverEmail}`, {
//         headers: { Authorization: `Bearer ${token}` }
//       })
//         .then((res) => res.json())
//         .then((data) => setMessages(data.data))
//         .catch((err) => console.error('Failed to fetch messages:', err));
//     }

//     socket.on('private message', (msgObj) => {
//       if (
//         (msgObj.senderEmail === userEmail && msgObj.receiverEmail === receiverEmail) ||
//         (msgObj.senderEmail === receiverEmail && msgObj.receiverEmail === userEmail)
//       ) {
//         setMessages((prev) => [...prev, msgObj]);
//       }
//     });

//     return () => {
//       socket.off('private message');
//     };
//   }, [receiverEmail, userEmail]);

//   const handleSendMessage = (messageText) => {
//     const token = localStorage.getItem('token');
//     if (!messageText.trim() || !token) return;

//     const messageData = {
//       token,
//       content: messageText,
//       receiverEmail
//     };

//     socket.emit('private message', messageData);
//   };

//   return (
//     <ChatWindow
//       messages={messages}
//       onSend={handleSendMessage}
//       currentUserEmail={userEmail}
//       input={input}
//       setInput={setInput}
//     />
//   );
// }

// export default PrivateChat;

// // import { useParams, useOutletContext } from 'react-router-dom';
// // import { useEffect, useState } from 'react';
// // // import ChatWindow from '../../utils/chatCard'; // your existing chat card component
// // import ChatWindow from '../../utils/chatCard';
// // import { io } from 'socket.io-client';

// // function PrivateChat() {
// //   const { receiverEmail } = useParams();
// //   const { socket, currentUser } = useOutletContext();
// //   const [messages, setMessages] = useState([]);
// //   const [content, setContent] = useState("");
// //   const token = localStorage.getItem("token");

// //   // Listen for private messages in real-time
// //   useEffect(() => {
// //     if (!socket) return;

// //     const handleMessage = (msg) => {
// //       // Only add messages relevant to this conversation
// //       if (
// //         (msg.senderEmail === receiverEmail && msg.receiverEmail === currentUser.email) ||
// //         (msg.senderEmail === currentUser.email && msg.receiverEmail === receiverEmail)
// //       ) {
// //         setMessages((prev) => [...prev, msg]);
// //       }
// //     };

// //     socket.on("private message", handleMessage);

// //     return () => {
// //       socket.off("private message", handleMessage);
// //     };
// //   }, [socket, receiverEmail, currentUser]);

// //   // Fetch existing messages from the server when chat opens
// //   useEffect(() => {
// //     const fetchMessages = async () => {
// //       try {
// //         const response = await fetch(`http://localhost:3000/private-messages?receiverEmail=${receiverEmail}`, {
// //           headers: { Authorization: `Bearer ${token}` }
// //         });
// //         const data = await response.json();
// //         setMessages(data.data);
// //       } catch (err) {
// //         console.error("Error fetching messages:", err);
// //       }
// //     };

// //     if (receiverEmail) fetchMessages();
// //   }, [receiverEmail, token]);

// //   // Send message handler
// //   const sendMessage = () => {
// //     if (socket && content.trim()) {
// //       socket.emit("private message", {
// //         token,
// //         receiverEmail,
// //         content
// //       });
// //       setContent("");
// //     }
// //   };

// //   return (
// //     <div className="p-3">
// //       <h5>Chat with {receiverEmail}</h5>

// //       {/* Render your existing chat card */}
// //       <ChatWindow
// //         messages={messages}
// //         currentUserEmail={currentUser.email}
// //         content={content}
// //         setContent={setContent}
// //         sendMessage={sendMessage}
// //       />
// //     </div>
// //   );
// // }

// // export default PrivateChat;

import React, { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { useParams } from 'react-router-dom';
// import ChatWindow from '../../components/ChatWindow'; // adjust path as per your project

const socket = io('https://socketchatnode-1.onrender.com'); // Connect socket

function PrivateChat() {
  const { conversationId } = useParams();
  const [messages, setMessages] = useState([]);
  const [receiverName, setReceiverName] = useState('');
  const [input, setInput] = useState('');
  const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));

  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!conversationId) return;

    // Join room
    socket.emit('join', { conversationId, userName: loggedInUser.name });

    // Fetch messages
    fetch(`http://localhost:3000/api/message/${conversationId}`)
      .then(res => res.json())
      .then(result => {
        const messagesFetched = Array.isArray(result.data) ? result.data : [];

        // Find other user
        const otherMessage = messagesFetched.find(
          msg => msg.createdBy._id !== loggedInUser.id
        );

        setReceiverName(
          otherMessage
            ? (otherMessage.createdBy.name || otherMessage.createdBy.email)
            : 'Unknown'
        );

        setMessages(messagesFetched);
      })
      .catch(err => {
        console.error('Error fetching messages:', err);
        setMessages([]);
        setReceiverName('Unknown');
      });

    // Listen for real-time messages
    socket.on('receiveMessage', ({ userName: sender, message }) => {
      setMessages(prev => [...prev, { createdBy: { name: sender }, content: message }]);
    });

    // Cleanup listener on unmount
    return () => {
      socket.off('receiveMessage');
    };
  }, [conversationId, loggedInUser.id, loggedInUser.name]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = async (msgText) => {
    if (!msgText.trim()) return;

    // Emit via socket
    socket.emit('sendMessage', {
      conversationId,
      userName: loggedInUser.name,
      message: msgText,
      userId: loggedInUser.id,
    });

    // Save to DB
    try {
      await fetch('http://localhost:3000/api/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId,
          createdBy: loggedInUser.id,
          content: msgText,
          type: 'text',
        }),
      });
    } catch (err) {
      console.error('Error saving message:', err);
    }
  };

  return (
    <>
      <ChatWindow
        messages={messages}
        onSend={handleSendMessage}
        currentUserEmail={loggedInUser.email}
        input={input}
        setInput={setInput}
        receiverName={receiverName}
        messagesEndRef={messagesEndRef}
      />
    </>
  );
}

export default PrivateChat;
