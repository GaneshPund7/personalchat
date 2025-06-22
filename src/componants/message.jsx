import React, { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { useParams } from 'react-router-dom';
import { Card, ListGroup, Form, Button, Container, InputGroup } from 'react-bootstrap';
import './message.css';

const socket = io('https://socketchatnode-1.onrender.com');

function Message() {
  const { conversationId } = useParams();
  const [messages, setMessages] = useState([]);
  const [receiverName, setReceiverName] = useState('');
  const [receiveravtarURL, setReceiveravtarURL] = useState('');
  console.log("message url img",receiverName)
  const messageRef = useRef(null);
  const messagesEndRef = useRef(null);
  // const messagesEndRef = useRef(null);
const messagesContainerRef = useRef(null)
  const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));

  const scrollToBottom = () => {
  messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
};
  // Safe date formatting helper
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      hour12: true,
      hour: 'numeric',
      minute: 'numeric',
    });
  };
  useEffect(() => {
  scrollToBottom();
}, [messages]);

  useEffect(() => {
    if (!conversationId) return;

    // Join conversation room
    socket.emit('join', { conversationId, userName: loggedInUser.name });

    // Fetch messages initially
    fetch(`https://socketchatnode-1.onrender.com/api/message/${conversationId}`)
      .then(res => res.json())
      .then(result => {
        const messagesFetched = Array.isArray(result.data) ? result.data : [];
        console.log("message result", messagesFetched)
        // Identify the other participant's name/email
        const otherMessage = messagesFetched.find(
          msg => msg.createdBy._id !== loggedInUser.id
        );

        setReceiverName(
          otherMessage?.createdBy?.name || otherMessage?.createdBy?.email || 'Unknown'
        );
        setReceiveravtarURL(
          otherMessage?.createdBy?.avatarUrl || otherMessage?.createdBy?.email || 'Unknown'
        );

        setMessages(messagesFetched);
      })
      .catch(err => {
        console.error('Error fetching messages:', err);
        setMessages([]);
        setReceiverName('Unknown');
      });

    // Listen for real-time messages
    socket.on('receiveMessage', ({ userName: sender, message, createdAt }) => {
      setMessages(prev => [
        ...prev,
        {
          createdBy: { name: sender },
          content: message,
          createdAt: createdAt || new Date().toISOString(),
        }
      ]);
    });

    // Cleanup listener on unmount or conversationId change
    return () => {
      socket.off('receiveMessage');
    };
  }, [conversationId, loggedInUser.id, loggedInUser.name]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    const msg = messageRef.current.value.trim();
    if (!msg) return;

    // Emit message via Socket.IO; server will save & broadcast
    socket.emit('sendMessage', {
      conversationId,
      userName: loggedInUser.name,
      message: msg,
      userId: loggedInUser.id,
    });

    // Clear input
    messageRef.current.value = '';
  };

  return (
//     <Container fluid className="p-0" style={{ height: '100vh' }}>
//   <Card className="border-0 shadow-sm w-100 h-100 rounded-0 mt-5">
//     <Card.Header
//       className="text-dark shadow-sm border-0"
//       style={{ backgroundColor: 'rgba(179, 206, 246, 0.2)' }}
//     >
//       <div className="d-flex justify-content-between align-items-center flex-wrap">
//         <h5 className="mb-0">{receiverName}</h5>
//         <div className="d-flex align-items-center gap-3 mt-2 mt-md-0">
//           <i className="fa fa-phone"></i>
//           <i className="fa fa-video-camera"></i>
//           <i className="fa fa-ellipsis-v"></i>
//         </div>
//       </div>
//     </Card.Header>

//     <Card.Body className="d-flex flex-column p-0" style={{ height: 'calc(100vh - 56px)' }}>
//       {/* Messages area */}
//       <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
//         {messages.length === 0 ? (
//           <div className="text-muted text-center mt-5">
//             No messages yet — start the conversation!
//           </div>
//         ) : (
//           messages.map((msg, idx) => {
//             const isSentByCurrentUser =
//               msg.createdBy?.email === loggedInUser.email ||
//               msg.createdBy?.name === loggedInUser.name;

//             return (
//               <div
//                 key={idx}
//                 className={`mb-2 d-flex flex-column ${
//                   isSentByCurrentUser ? 'align-items-end text-end' : 'align-items-start text-start'
//                 }`}
//               >
//                 <div className="d-flex align-items-center">
//                   <small className="text-muted">{formatDate(msg.createdAt)}</small>
//                 </div>
//                 <span
//                   className={`mt-1 rounded-3 border-0 shadow-sm p-3 ${
//                     isSentByCurrentUser ? '' : 'bg-light text-dark'
//                   }`}
//                   style={
//                     isSentByCurrentUser
//                       ? { backgroundColor: 'rgba(133, 221, 250, 0.2)' }
//                       : undefined
//                   }
//                 >
//                   {msg.content || msg.message}
//                 </span>
//               </div>
//             );
//           })
//         )}
//         <div ref={messagesEndRef} />
//       </div>

//       {/* Message input area */}
//      <Form onSubmit={handleSend}>
//   <Form.Group className="d-flex">
//     <InputGroup>
//       <Form.Control
//         type="text"
//         ref={messageRef}
//         placeholder="Type a message"
//         required
//         autoComplete="off"
//       />
//       {/* Paperclip icon inside input */}
//       <InputGroup.Text style={{ background: 'white', borderLeft: '0' }}>
//         <label htmlFor="fileInput" className="m-0" style={{ cursor: 'pointer' }}>
//           <i className="fa fa-paperclip" aria-hidden="true"></i>
//         </label>
//         <input type="file" id="fileInput" style={{ display: 'none' }} />
//       </InputGroup.Text>
//     </InputGroup>

//     {/* Send button */}
//     <Button type="submit" className="ms-2">
//       <i className="fa fa-paper-plane" aria-hidden="true"></i>
//     </Button>
//   </Form.Group>
// </Form>

//     </Card.Body>
//   </Card>
// </Container>

  // <Container fluid className="p-0 chat-container mt-2">
  //     <Card className="border-0 shadow-sm w-100 h-100 rounded-0 mt-5 fixed-top">
  //       <Card.Header
  //         className="text-dark shadow-sm border-0"
  //         style={{ backgroundColor: 'rgba(179, 206, 246, 0.2)' }}
  //       >
  //         <div className="d-flex justify-content-between align-items-center flex-wrap">
  //           <h5 className="mb-0">{receiverName}</h5>
  //           <div className="d-flex align-items-center gap-3 mt-2 mt-md-0">
  //             <i className="fa fa-phone"></i>
  //             <i className="fa fa-video-camera"></i>
  //             <i className="fa fa-ellipsis-v"></i>
  //           </div>
  //         </div>
  //       </Card.Header>

  //       <Card.Body className="d-flex flex-column p-0 chat-body">
  //         {/* Messages */}
  //         <div className="chat-messages">
  //           {messages.length === 0 ? (
  //             <div className="text-muted text-center mt-5">
  //               No messages yet — start the conversation!
  //             </div>
  //           ) : (
  //             messages.map((msg, idx) => {
  //               const isSentByCurrentUser =
  //                 msg.createdBy?.email === loggedInUser.email ||
  //                 msg.createdBy?.name === loggedInUser.name;

  //               return (
  //                 <div
  //                   key={idx}
  //                   className={`mb-2 d-flex flex-column ${
  //                     isSentByCurrentUser
  //                       ? 'align-items-end text-end'
  //                       : 'align-items-start text-start'
  //                   }`}
  //                 >
  //                   <div className="d-flex align-items-center">
  //                     <small className="text-muted">{formatDate(msg.createdAt)}</small>
  //                   </div>
  //                   <span
  //                     className={`mt-1 rounded-3 border-0 shadow-sm p-3 ${
  //                       isSentByCurrentUser ? '' : 'bg-light text-dark'
  //                     }`}
  //                     style={
  //                       isSentByCurrentUser
  //                         ? { backgroundColor: 'rgba(133, 221, 250, 0.2)' }
  //                         : undefined
  //                     }
  //                   >
  //                     {msg.content || msg.message}
  //                   </span>
  //                 </div>
  //               );
  //             })
  //           )}
  //           <div ref={messagesEndRef} />
  //         </div>

  //         {/* Message Input */}
  //         <Form onSubmit={handleSend} className="message-input-form">
  //           <Form.Group className="d-flex">
  //             <InputGroup>
  //               <Form.Control
  //                 type="text"
  //                 ref={messageRef}
  //                 placeholder="Type a message"
  //                 required
  //                 autoComplete="off"
  //               />
  //               <InputGroup.Text style={{ background: 'white', borderLeft: '0' }}>
  //                 <label htmlFor="fileInput" className="m-0" style={{ cursor: 'pointer' }}>
  //                   <i className="fa fa-paperclip" aria-hidden="true"></i>
  //                 </label>
  //                 <input type="file" id="fileInput" style={{ display: 'none' }} />
  //               </InputGroup.Text>
  //             </InputGroup>
  //             <Button type="submit" className="ms-2">
  //               <i className="fa fa-paper-plane" aria-hidden="true"></i>
  //             </Button>
  //           </Form.Group>
  //         </Form>
  //       </Card.Body>
  //     </Card>
  //   </Container>


//     <Container style={{ maxWidth: '1000px' }}>
//       <Card className="shadow-sm mt-5 border-0 w-100">
//        <Card.Header
//   className="text-dark shadow-sm border-0"
//   style={{ backgroundColor: 'rgba(179, 206, 246, 0.2)' }}
// >
//   <div className="d-flex justify-content-between align-items-center flex-wrap">
//     <h5 className="mb-0">{receiverName}</h5>

//     <div className="d-flex align-items-center gap-2 mt-2 mt-md-0">
//       <i className="fa fa-phone" aria-hidden="true"></i>
//       <i className="fa fa-video-camera" aria-hidden="true"></i>
//       <i className="fa fa-ellipsis-v" aria-hidden="true"></i>
//     </div>
//   </div>
// </Card.Header>


//         <Card.Body>
//           <ListGroup style={{ height: '350px', overflowY: 'auto', marginBottom: '15px' }}>
//             {messages.length === 0 ? (
//               <div className="text-muted text-center">
//                 No messages yet — start the conversation!
//               </div>
//             ) : (
//               messages.map((msg, idx) => {
//                 const isSentByCurrentUser =
//                   msg.createdBy?.email === loggedInUser.email ||
//                   msg.createdBy?.name === loggedInUser.name;

//                 return (
//                   <ListGroup.Item
//                     key={idx}
//                     className={`d-flex flex-column border-0 ${
//                       isSentByCurrentUser ? 'align-items-end text-end' : 'align-items-start text-start'
//                     }`}
//                   >
 
//                   <div className='d-flex'>
//                       <small className="text-muted">{formatDate(msg.createdAt)}</small>
//                      <span className='ms-2'>
//                        {/* <i class="fa fa-ellipsis-v" aria-hidden="true"></i> */}
//                           </span>
//                   </div>
//                     <span
//                       className={`mt-1 rounded-3 border-0 shadow-sm p-3 ${
//                         isSentByCurrentUser ? '' : 'bg-light text-dark'
//                       }`}
//                       style={
//                         isSentByCurrentUser
//                           ? { backgroundColor: 'rgba(133, 221, 250, 0.2)', padding: '4px' }
//                           : undefined
//                       }
//                     >
//                       {msg.content || msg.message}
//                     </span>
//                   </ListGroup.Item>
//                 );
//               })
//             )}
//             <div ref={messagesEndRef} />
//           </ListGroup>

//           {/* Send message input */}
//           <Form onSubmit={handleSend}>
//             <Form.Group className="d-flex">
//            <InputGroup>
//   <Form.Control
//     type="text"
//     ref={messageRef}
//     placeholder="Type a message"
//     required
//     autoComplete="off"
//   />
//   <InputGroup.Text style={{ background: 'white', borderLeft: '0' }}>
//   </InputGroup.Text>
// </InputGroup>
//               <Button type="submit" className="ms-2">
                
//               <i class="fa fa-paper-plane" aria-hidden="true"></i>
//               </Button>
//             </Form.Group>
//           </Form>
//         </Card.Body>
//       </Card>
//     </Container>






<Container fluid className="p-0 chat-container" style={{ height: 'calc(100vh - 56px)' }}>
  <Card className="border-0 shadow-sm w-100 h-100 rounded-0 d-flex mt-5 flex-column fixed-top">
    {/* Header */}
    <Card.Header
      className="text-dark shadow-sm border-0"
      style={{ backgroundColor: 'rgba(179, 206, 246, 0.2)', height: '60px' }}
    >
      <div className="d-flex justify-content-between align-items-center h-100">
        <div className="d-flex align-items-center gap-2">
          <img
            src={receiveravtarURL || 'https://via.placeholder.com/40'}
            alt={receiverName}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              objectFit: 'cover',
            }}
          />
          <h6 className="mb-0">{receiverName}</h6>
        </div>
        <div className="d-flex align-items-center gap-3">
          <i className="fa fa-phone"></i>
          <i className="fa fa-video-camera"></i>
          <i className="fa fa-ellipsis-v"></i>
        </div>
      </div>
    </Card.Header>

    {/* Body */}
    <Card.Body className="d-flex flex-column p-0" style={{ height: 'calc(100% - 60px)' }}>
      {/* Messages */}
      <div className="flex-grow-1 overflow-auto p-3" ref={messagesContainerRef}>
        {messages.length === 0 ? (
          <div className="text-muted text-center mt-5">
            No messages yet — start the conversation!
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isSentByCurrentUser =
              msg.createdBy?.email === loggedInUser.email ||
              msg.createdBy?.name === loggedInUser.name;

            return (
              <div
                key={idx}
                className={`mb-2 d-flex flex-column ${
                  isSentByCurrentUser ? 'align-items-end text-end' : 'align-items-start text-start'
                }`}
              >
                <div>
                  <small className="text-muted">{formatDate(msg.createdAt)}</small>
                </div>
                <span
                  className={`mt-1 rounded-3 border-0 shadow-sm p-3 ${
                    isSentByCurrentUser ? '' : 'bg-light text-dark'
                  }`}
                  style={
                    isSentByCurrentUser
                      ? { backgroundColor: 'rgba(133, 221, 250, 0.2)' }
                      : undefined
                  }
                >
                  {msg.content || msg.message}
                </span>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Scroll-to-bottom button */}
      <Button
        variant="light"
        className="position-absolute"
        style={{
          bottom: '75px',
          right: '20px',
          borderRadius: '50%',
          boxShadow: '0 0 5px rgba(0,0,0,0.2)',
          zIndex: 10,
        }}
        onClick={scrollToBottom}
      >
        <i className="fa fa-arrow-down"></i>
      </Button>

      {/* Input */}
      <Form
        onSubmit={handleSend}
        className="w-100 p-2"
        style={{ borderTop: '1px solid #ddd', background: '#fff' }}
      >
        <Form.Group className="d-flex m-0">
          <InputGroup>
            <Form.Control
              type="text"
              ref={messageRef}
              placeholder="Type a message"
              required
              autoComplete="off"
            />
            <InputGroup.Text style={{ background: 'white', borderLeft: '0' }}>
              <label htmlFor="fileInput" className="m-0" style={{ cursor: 'pointer' }}>
                <i className="fa fa-paperclip"></i>
              </label>
              <input type="file" id="fileInput" style={{ display: 'none' }} />
            </InputGroup.Text>
          </InputGroup>
          <Button type="submit" className="ms-2">
            <i className="fa fa-paper-plane"></i>
          </Button>
        </Form.Group>
      </Form>
    </Card.Body>
  </Card>
</Container>








  );
}

export default Message;










































// import React, { useEffect, useState, useRef } from 'react';
// import { io } from 'socket.io-client';
// import { useParams } from 'react-router-dom';
// import { Card, ListGroup, Form, Button, Container } from 'react-bootstrap';

// const socket = io('http://localhost:3000');

// function Message() {
//   const { conversationId } = useParams();
//   const [messages, setMessages] = useState([]);
//   const [receiverName, setReceiverName] = useState('');
//   const messageRef = useRef(null);
//   const messagesEndRef = useRef(null);
//   const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));

//   useEffect(() => {
//     if (!conversationId) return;

//     // Join room and acknowledge
//     socket.emit('join', { conversationId, userName: loggedInUser.name }, () => {
//       console.log("Joined room successfully");
//     });

//     // Fetch existing messages
//     fetch(`http://localhost:3000/api/message/${conversationId}`)
//       .then(res => res.json())
//       .then(result => {
//         const messagesFetched = Array.isArray(result.data) ? result.data : [];

//         // Identify other participant
//         const otherMessage = messagesFetched.find(
//           msg => msg.createdBy._id !== loggedInUser.id
//         );

//         setReceiverName(
//           otherMessage ? (otherMessage.createdBy.name || otherMessage.createdBy.email) : 'Unknown'
//         );

//         setMessages(messagesFetched);
//       })
//       .catch(err => {
//         console.error('Error fetching messages:', err);
//         setReceiverName('Unknown');
//         setMessages([]);
//       });

//     // Listen for real-time messages
//     socket.on('receiveMessage', ({ userName: sender, message, createdAt }) => {
//       setMessages(prev => [
//         ...prev,
//         {
//           createdBy: { name: sender },
//           content: message,
//           createdAt
//         }
//       ]);
//     });

//     // Clean up listeners
//     return () => {
//       socket.off('receiveMessage');
//     };
//   }, [conversationId, loggedInUser.id, loggedInUser.name]);

//   useEffect(() => {
//     if (messagesEndRef.current) {
//       messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
//     }
//   }, [messages]);

//   const handleSend = async (e) => {
//     e.preventDefault();
//     const msg = messageRef.current.value.trim();
//     if (!msg) return;

//     // Emit message via socket
//     socket.emit('sendMessage', {
//       conversationId,
//       userName: loggedInUser.name,
//       message: msg,
//       userId: loggedInUser.id
//     });

//     // Save to DB via API
//     try {
//       await fetch('http://localhost:3000/api/message', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           conversationId,
//           createdBy: loggedInUser.id,
//           content: msg,
//           type: 'text'
//         })
//       });
//     } catch (err) {
//       console.error('Error saving message:', err);
//     }

//     messageRef.current.value = '';
//   };

//   return (
//     <Container style={{ maxWidth: '1000px' }}>
//       <Card className="shadow-sm mt-5 border-0">
//         <Card.Header className="text-dark shadow-sm border-0"
//           style={{ backgroundColor: 'rgba(179, 206, 246, 0.2)' }}>
//           <h5>{receiverName}</h5>
//         </Card.Header>

//         <Card.Body>
//           <ListGroup style={{ height: '350px', overflowY: 'auto', marginBottom: '15px' }}>
//             {messages.length === 0 ? (
//               <div className="text-muted text-center">No messages yet — start the conversation!</div>
//             ) : (
//               messages.map((msg, idx) => {
//                 const isSentByCurrentUser =
//                   msg.createdBy?.email === loggedInUser.email ||
//                   msg.createdBy?.name === loggedInUser.name;

//                 return (
//                   <ListGroup.Item
//                     key={idx}
//                     className={`d-flex flex-column border-0 ${
//                       isSentByCurrentUser ? 'align-items-end text-end' : 'align-items-start text-start'
//                     }`}
//                   >
//                     <small className="text-muted">
//                       {new Date(msg.createdAt).toLocaleString('en-IN', {
//                         timeZone: 'Asia/Kolkata',
//                         hour12: true,
//                         hour: 'numeric',
//                         minute: 'numeric'
//                       })}
//                     </small>
//                     <span
//                       className={`mt-1 rounded-3 border-0 shadow-sm p-3 ${
//                         isSentByCurrentUser ? '' : 'bg-light text-dark'
//                       }`}
//                       style={
//                         isSentByCurrentUser
//                           ? { backgroundColor: 'rgba(133, 221, 250, 0.2)' }
//                           : undefined
//                       }
//                     >
//                       {msg.content || msg.message}
//                     </span>
//                   </ListGroup.Item>
//                 );
//               })
//             )}
//             <div ref={messagesEndRef}></div>
//           </ListGroup>

//           <Form onSubmit={handleSend}>
//             <Form.Group className="d-flex">
//               <Form.Control type="text" ref={messageRef} placeholder="Type a message" required />
//               <Button type="submit" className="ms-2">Send</Button>
//             </Form.Group>
//           </Form>
//         </Card.Body>
//       </Card>
//     </Container>
//   );
// }

// export default Message;














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
