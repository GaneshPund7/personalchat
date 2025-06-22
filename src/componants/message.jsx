// import React, { useEffect, useState, useRef } from 'react';
// import { io } from 'socket.io-client';
// import { useParams } from 'react-router-dom';
// import { Card, ListGroup, Form, Button, Container, InputGroup } from 'react-bootstrap';
// import './message.css';

// const socket = io('https://socketchatnode-1.onrender.com');

// function Message() {
//   const { conversationId } = useParams();
//   const [messages, setMessages] = useState([]);
//   const [receiverName, setReceiverName] = useState('');
//   const [receiveravtarURL, setReceiveravtarURL] = useState('');
//   console.log("message url img",receiverName)
//   const messageRef = useRef(null);
//   const messagesEndRef = useRef(null);
//   // const messagesEndRef = useRef(null);
// const messagesContainerRef = useRef(null)
//   const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));

//   const scrollToBottom = () => {
//   messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
// };
//   // Safe date formatting helper
//   const formatDate = (dateString) => {
//     if (!dateString) return '';
//     const date = new Date(dateString);
//     if (isNaN(date.getTime())) return '';
//     return date.toLocaleString('en-IN', {
//       timeZone: 'Asia/Kolkata',
//       hour12: true,
//       hour: 'numeric',
//       minute: 'numeric',
//     });
//   };
//   useEffect(() => {
//   scrollToBottom();
// }, [messages]);

//   useEffect(() => {
//     if (!conversationId) return;

//     // Join conversation room
//     socket.emit('join', { conversationId, userName: loggedInUser.name });

//     // Fetch messages initially
//     fetch(`https://socketchatnode-1.onrender.com/api/message/${conversationId}`)
//       .then(res => res.json())
//       .then(result => {
//         const messagesFetched = Array.isArray(result.data) ? result.data : [];
//         console.log("message result", messagesFetched)
//         // Identify the other participant's name/email
//         const otherMessage = messagesFetched.find(
//           msg => msg.createdBy._id !== loggedInUser.id
//         );

//         setReceiverName(
//           otherMessage?.createdBy?.name || otherMessage?.createdBy?.email || 'Unknown'
//         );
        

//         setMessages(messagesFetched);
//       })
//       .catch(err => {
//         console.error('Error fetching messages:', err);
//         setMessages([]);
//         setReceiverName('Unknown');
//       });

//     // Listen for real-time messages
//     socket.on('receiveMessage', ({ userName: sender, message, createdAt }) => {
//       setMessages(prev => [
//         ...prev,
//         {
//           createdBy: { name: sender },
//           content: message,
//           createdAt: createdAt || new Date().toISOString(),
//         }
//       ]);
//     });

//     // Cleanup listener on unmount or conversationId change
//     return () => {
//       socket.off('receiveMessage');
//     };
//   }, [conversationId, loggedInUser.id, loggedInUser.name]);

//   // Auto-scroll to bottom on new messages
//   useEffect(() => {
//     if (messagesEndRef.current) {
//       messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
//     }
//   }, [messages]);

//   const handleSend = async (e) => {
//     e.preventDefault();
//     const msg = messageRef.current.value.trim();
//     if (!msg) return;

//     // Emit message via Socket.IO; server will save & broadcast
//     socket.emit('sendMessage', {
//       conversationId,
//       userName: loggedInUser.name,
//       message: msg,
//       userId: loggedInUser.id,
//     });

//     // Clear input
//     messageRef.current.value = '';
//   };

//   return (
// <Container fluid className="p-0 chat-container" style={{ height: 'calc(100vh - 76px)' }}>
//   <Card className="border-0 shadow-sm w-100 h-100 rounded-0 d-flex flex-column  mt-5">
//     {/* Header */}
//     <Card.Header
//       className="text-dark shadow-sm border-0"
//       style={{ backgroundColor: 'rgba(179, 206, 246, 0.2)', height: '56px' }}
//     >
//       <div className="d-flex justify-content-between align-items-center h-100">
//         <div className="d-flex align-items-center gap-2">
//           {/* <img
//             src={receiveravtarURL || 'https://via.placeholder.com/40'}
//             alt={receiverName}
//             style={{
//               width: '36px',
//               height: '36px',
//               borderRadius: '50%',
//               objectFit: 'cover',
//             }}
//           /> */}
//           <h6 className="mb-0">{receiverName}</h6>
//         </div>
//         <div className="d-flex align-items-center gap-3">
//           <i className="fa fa-phone"></i>
//           <i className="fa fa-video-camera"></i>
//           <i className="fa fa-ellipsis-v"></i>
//         </div>
//       </div>
//     </Card.Header>

//     {/* Body */}
//     <Card.Body className="d-flex flex-column p-0" style={{ height: 'calc(100% - 56px)' }}>
//       {/* Messages */}
//       <div className="flex-grow-1 overflow-auto p-3" ref={messagesContainerRef}>
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
//                 <div>
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

//       {/* Scroll-to-bottom button */}
//       <Button
//         variant="light"
//         className="position-absolute"
//         style={{
//           bottom: '75px',
//           right: '20px',
//           borderRadius: '50%',
//           boxShadow: '0 0 5px rgba(0,0,0,0.2)',
//           zIndex: 10,
//         }}
//         onClick={scrollToBottom}
//       >
//         <i className="fa fa-arrow-down"></i>
//       </Button>

//       {/* Input */}
//       <Form
//         onSubmit={handleSend}
//         className="w-100 p-2"
//         style={{ borderTop: '1px solid #ddd', background: '#fff' }}
//       >
//         <Form.Group className="d-flex m-0">
//           <InputGroup>
//             <Form.Control
//               type="text"
//               ref={messageRef}
//               placeholder="Type a message"
//               required
//               autoComplete="off"
//             />
//             <InputGroup.Text style={{ background: 'white', borderLeft: '0' }}>
//               <label htmlFor="fileInput" className="m-0" style={{ cursor: 'pointer' }}>
//                 <i className="fa fa-paperclip"></i>
//               </label>
//               <input type="file" id="fileInput" style={{ display: 'none' }} />
//             </InputGroup.Text>
//           </InputGroup>
//           <Button type="submit" className="ms-2">
//             <i className="fa fa-paper-plane"></i>
//           </Button>
//         </Form.Group>
//       </Form>
//     </Card.Body>
//   </Card>
// </Container>
//   );
// }

// export default Message;
import React, { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { useParams } from 'react-router-dom';
import {
  Card,
  Form,
  Button,
  Container,
  InputGroup,
  Toast,
  ToastContainer,
} from 'react-bootstrap';
import './message.css';

const socket = io('https://socketchatnode-1.onrender.com');

function Message() {
  const { conversationId } = useParams();
  const [messages, setMessages] = useState([]);
  const [receiverName, setReceiverName] = useState('');
  const [receiverAvatarURL, setReceiverAvatarURL] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showScrollButton, setShowScrollButton] = useState(false);

  const messageRef = useRef(null);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

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
    if (!conversationId) return;

    socket.emit('join', { conversationId, userName: loggedInUser.name });

    fetch(`https://socketchatnode-1.onrender.com/api/message/${conversationId}`)
      .then((res) => res.json())
      .then((result) => {
        const messagesFetched = Array.isArray(result.data) ? result.data : [];

        const otherMessage = messagesFetched.find(
          (msg) => msg.createdBy._id !== loggedInUser.id
        );

        setReceiverName(
          otherMessage?.createdBy?.name || otherMessage?.createdBy?.email || 'Unknown'
        );
        setReceiverAvatarURL(
          otherMessage?.createdBy?.avatarUrl || 'https://via.placeholder.com/40'
        );

        setMessages(messagesFetched);
        setTimeout(scrollToBottom, 100);
      })
      .catch((err) => {
        console.error('Error fetching messages:', err);
        setMessages([]);
        setReceiverName('Unknown');
        setReceiverAvatarURL('https://via.placeholder.com/40');
      });

    socket.on('receiveMessage', ({ userName: sender, message, createdAt }) => {
      setMessages((prev) => [
        ...prev,
        {
          createdBy: { name: sender },
          content: message,
          createdAt: createdAt || new Date().toISOString(),
        },
      ]);

      // Toast for new incoming message if it's not you
      if (sender !== loggedInUser.name) {
        setToastMessage(`New message from ${sender}`);
        setShowToast(true);
      }
    });

    return () => {
      socket.off('receiveMessage');
    };
  }, [conversationId, loggedInUser.id, loggedInUser.name]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Scroll button visibility handler
  const handleScroll = () => {
    const container = messagesContainerRef.current;
    if (!container) return;
    const atBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight < 50;
    setShowScrollButton(!atBottom);
  };

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;
    container.addEventListener('scroll', handleScroll);
    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleSend = async (e) => {
    e.preventDefault();
    const msg = messageRef.current.value.trim();
    if (!msg) return;

    socket.emit('sendMessage', {
      conversationId,
      userName: loggedInUser.name,
      message: msg,
      userId: loggedInUser.id,
    });

    messageRef.current.value = '';
  };

  return (
    <Container fluid className="p-0 chat-container" style={{ height: 'calc(100vh - 76px)' }}>
      <Card className="border-0 shadow-sm w-100 h-100 rounded-0 d-flex flex-column mt-5">
        {/* Header */}
        <Card.Header
          className="text-dark shadow-sm border-0"
          style={{ backgroundColor: 'rgba(179, 206, 246, 0.2)', height: '56px' }}
        >
          <div className="d-flex justify-content-between align-items-center h-100">
            <div className="d-flex align-items-center gap-2">
              <img
                src={receiverAvatarURL}
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
        <Card.Body className="d-flex flex-column p-0" style={{ height: 'calc(100% - 56px)' }}>
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
                      isSentByCurrentUser
                        ? 'align-items-end text-end'
                        : 'align-items-start text-start'
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
          {showScrollButton && (
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
          )}

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

      {/* Toast notification */}
      <ToastContainer position="top-end" className="p-3">
        <Toast
          onClose={() => setShowToast(false)}
          show={showToast}
          delay={3000}
          autohide
          bg="primary"
        >
          <Toast.Body className="text-white">{toastMessage}</Toast.Body>
        </Toast>
      </ToastContainer>
    </Container>
  );
}

export default Message;
