import React, { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { useParams } from 'react-router-dom';
import { Card, ListGroup, Form, Button, Container } from 'react-bootstrap';

const socket = io('http://localhost:3000'); // Connect socket

function Message() {
  const { conversationId } = useParams();
  const [messages, setMessages] = useState([]);
  const [receiverName, setReceiverName] = useState('');
  const ganesh = "Ganesh"
  console.log("Reciver receiverName" ,receiverName)
  console.log(messages)
  const messageRef = useRef(null);
  const messagesEndRef = useRef(null);  
  const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));

 
useEffect(() => {
  if (!conversationId) return;

  // Join room
  socket.emit('join', { conversationId, userName: loggedInUser.name });

  // Fetch messages
  fetch(`http://178.18.241.165:6013/api/message/${conversationId}`)
    .then(res => res.json())
    .then(result => {
      const messagesFetched = Array.isArray(result.data) ? result.data : [];

      // Find the other user (any message not sent by loggedInUser)
      const otherMessage = messagesFetched.find(
        msg => msg.createdBy._id !== loggedInUser.id
      );

      if (otherMessage) {
        setReceiverName(otherMessage.createdBy.name || otherMessage.createdBy.email || 'Unknown');
      } else {
        setReceiverName('Unknown'); // in case all messages are by logged-in user
      }

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

  // Cleanup
  return () => {
    socket.off('receiveMessage');
  };
}, [conversationId, loggedInUser.id, loggedInUser.name]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    const msg = messageRef.current.value.trim();
    if (!msg) return;

    // Emit via socket
    socket.emit('sendMessage', {
      conversationId,
      userName: loggedInUser.name,
      message: msg,
      userId: loggedInUser.id,
    });

    // Save to DB via API
    try {
      await fetch('http://178.18.241.165:6013/api/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId,
          createdBy: loggedInUser.id,
          content: msg,
          type: 'text',
        }),
      });
    } catch (err) {
      console.error('Error saving message:', err);
    }

    messageRef.current.value = '';
  };

  return (
    <div>
<Container className="" style={{ maxWidth: '1000px' }}>
  <Card className="shadow-sm mt-5">
 <Card.Header className="text-white bg-primary">
 
 <h5> <span>{receiverName}</span></h5>
</Card.Header>

    <Card.Body>
      <ListGroup style={{ height: '350px', overflowY: 'auto', marginBottom: '15px' }}>
        {messages.length === 0 ? (
          <div className="text-muted text-center">
            No messages yet — start the conversation!
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isSentByCurrentUser =
              msg.createdBy?.email === loggedInUser.email ||
              msg.createdBy?.name === loggedInUser.name;
   
            return (
              <ListGroup.Item
                key={idx}
                
                className={`d-flex flex-column border-0 ${
                  isSentByCurrentUser
                    ? 'align-items-end text-end'
                    : 'align-items-start text-start'
                }`}
              >
                {/* <span>{otherUser || ganesh}</span> */}
                <small className="fw-bold">
                  {(msg.createdBy?.email || msg.createdBy?.name || 'Unknown').split('@')[0]}
                </small>
                <Card className="shadow-sm p-2">
                  <span
                    className={`px-3 py-2 mt-1 rounded-3 ${
                      isSentByCurrentUser
                        ? 'bg-secondary text-white'
                        : 'bg-light text-dark'
                    }`}
                  >
                    {msg.content || msg.message}
                  </span>
                </Card>
              </ListGroup.Item>
            );
          })
        )}
        <div ref={messagesEndRef}></div>
      </ListGroup>

      {/* Send input */}
      <Form onSubmit={handleSend}>
        <Form.Group className="d-flex">
          <Form.Control
            type="text"
            ref={messageRef}
            placeholder="Type a message"
            required
          />
          <Button type="submit" className="ms-2">
            Send
          </Button>
        </Form.Group>
      </Form>
    </Card.Body>
  </Card>
</Container>
</div>
  );
}
export default Message;



// import React, { useEffect, useState, useRef } from 'react';
// import { io } from 'socket.io-client';

// const socket = io('http://localhost:3000');

// function Message({ userId, userName, conversationId }) {
//   const [messages, setMessages] = useState([]);
//   const messageRef = useRef(null);
//   const messagesEndRef = useRef(null);

//   useEffect(() => {
//     if (!conversationId) return;

//     socket.emit('join', { conversationId, userName });

//     fetch(`http://localhost:3000/api/message/${conversationId}`)
//       .then(res => res.json())
//       .then(result => {
//         setMessages(Array.isArray(result.data) ? result.data : []);
//       })
//       .catch(err => {
//         console.error('Error fetching messages:', err);
//         setMessages([]);
//       });

//     socket.on('receiveMessage', ({ userName: sender, message }) => {
//       setMessages(prev => [...prev, { createdBy: { name: sender }, content: message }]);
//     });

//     return () => {
//       socket.off('receiveMessage');
//     };
//   }, [conversationId, userName]);

//   useEffect(() => {
//     if (messagesEndRef.current) {
//       messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
//     }
//   }, [messages]);

//   const handleSend = async (e) => {
//     e.preventDefault();
//     const msg = messageRef.current.value.trim();
//     if (!msg) return;

//     socket.emit('sendMessage', { conversationId, userName, message: msg, userId });

//     try {
//       await fetch('http://localhost:3000/api/message', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           conversationId,
//           createdBy: userId,
//           content: msg,
//           type: 'text',
//         }),
//       });
//     } catch (err) {
//       console.error('Error saving message:', err);
//     }

//     messageRef.current.value = '';
//   };

//   return (
//     <div className="container mt-4">
//       <h5>Conversation ID: {conversationId}</h5>

//       <div className="border p-2 mb-2" style={{ height: '300px', overflowY: 'auto' }}>
//         {messages.length === 0 ? (
//           <div className="text-muted text-center">No messages yet — start the conversation!</div>
//         ) : (
//           messages.map((msg, idx) => (
//             <div key={idx}>
//               <strong>{msg.createdBy?.name || 'Unknown'}</strong>: {msg.content}
//             </div>
//           ))
//         )}
//         <div ref={messagesEndRef}></div>
//       </div>

//       <form onSubmit={handleSend} className="d-flex">
//         <input
//           type="text"
//           ref={messageRef}
//           className="form-control me-2"
//           placeholder="Type a message..."
//           required
//         />
//         <button type="submit" className="btn btn-primary">Send</button>
//       </form>
//     </div>
//   );
// }

// export default Message;

// import React, { useEffect, useState, useRef } from 'react';
// import { io } from 'socket.io-client';
// import { useParams } from 'react-router-dom';
// import { Card, ListGroup, Form, Button, Container } from 'react-bootstrap';
// import { jwtDecode } from 'jwt-decode';

// const socket = io('http://localhost:3000');

// function Message() {
//   const { conversationId } = useParams();
//   const [messages, setMessages] = useState([]);
//   const [input, setInput] = useState('');
//   const messageRef = useRef(null);
//   const messagesEndRef = useRef(null);

//   const token = localStorage.getItem('token');
//   const loggedInUser = token ? jwtDecode(token) : null;
//   const userEmail = loggedInUser?.email;

//   // Join conversation and fetch messages
//   useEffect(() => {
//     if (!conversationId || !loggedInUser) return;

//     // Join Socket.IO room
//     socket.emit('join', { conversationId, userName: loggedInUser.name });

//     // Fetch existing messages from API
//     fetch(`http://localhost:3000/api/message/${conversationId}`)
//       .then((res) => res.json())
//       .then((result) => {
//         setMessages(Array.isArray(result.data) ? result.data : []);
//       })
//       .catch((err) => {
//         console.error('Error fetching messages:', err);
//         setMessages([]);
//       });

//     // Listen for real-time messages
//     socket.on('receiveMessage', ({ userName: sender, message }) => {
//       setMessages((prev) => [
//         ...prev,
//         { createdBy: { name: sender }, content: message },
//       ]);
//     });

//     // Cleanup listener on unmount
//     return () => {
//       socket.off('receiveMessage');
//     };
//   }, [conversationId, loggedInUser]);

//   // Scroll to bottom on message update
//   useEffect(() => {
//     if (messagesEndRef.current) {
//       messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
//     }
//   }, [messages]);

//   // Handle send
//   const handleSend = async (e) => {
//     e.preventDefault();
//     if (!input.trim()) return;

//     socket.emit('sendMessage', {
//       conversationId,
//       userName: loggedInUser.name,
//       message: input,
//       userId: loggedInUser.userId,
//     });

//     try {
//       await fetch('http://localhost:3000/api/message', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           conversationId,
//           createdBy: loggedInUser.userId,
//           content: input,
//           type: 'text',
//         }),
//       });
//     } catch (err) {
//       console.error('Error saving message:', err);
//     }

//     setInput('');
//   };

//   return (
//     <Container className="mt-2" style={{ maxWidth: '800px' }}>
//       <Card className="shadow-sm mt-5">
//         <Card.Header className="text-white bg-info">
//           <span>{userEmail?.split('@')[0]}</span>
//         </Card.Header>

//         <Card.Body>
//           <ListGroup
//             style={{ height: '350px', overflowY: 'auto', marginBottom: '15px' }}
//           >
//             {messages.length === 0 ? (
//               <div className="text-muted text-center">
//                 No messages yet — start the conversation!
//               </div>
//             ) : (
//               messages.map((msg, idx) => {
//                 const isSentByCurrentUser =
//                   msg.createdBy?.email === userEmail ||
//                   msg.createdBy?.name === loggedInUser.name;
//                 return (
//                   <ListGroup.Item
//                     key={idx}
//                     className={`d-flex flex-column border-0 ${
//                       isSentByCurrentUser
//                         ? 'align-items-end text-end'
//                         : 'align-items-start text-start'
//                     }`}
//                   >
//                     <small className="fw-bold">
//                       {(msg.createdBy?.email || msg.createdBy?.name || 'Unknown').split('@')[0]}
//                     </small>
//                     <Card className="shadow-sm p-2">
//                       <span
//                         className={`px-3 py-2 mt-1 rounded-3 ${
//                           isSentByCurrentUser
//                             ? 'bg-secondary text-white'
//                             : 'bg-light text-dark'
//                         }`}
//                       >
//                         {msg.content}
//                       </span>
//                     </Card>
//                   </ListGroup.Item>
//                 );
//               })
//             )}
//             <div ref={messagesEndRef}></div>
//           </ListGroup>

//           {/* Send input */}
//           <Form onSubmit={handleSend}>
//             <Form.Group className="d-flex">
//               <Form.Control
//                 type="text"
//                 value={input}
//                 onChange={(e) => setInput(e.target.value)}
//                 placeholder="Type a message"
//               />
//               <Button type="submit" className="ms-2">
//                 Send
//               </Button>
//             </Form.Group>
//           </Form>
//         </Card.Body>
//       </Card>
//     </Container>
//   );
// }

// export default Message;
