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

const socket = io('http://localhost:3000');

function Message() {
  const { conversationId } = useParams();
  const [messages, setMessages] = useState([]);
  const [receiverName, setReceiverName] = useState('');
  const [receiverAvatarURL, setReceiverAvatarURL] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showScrollButton, setShowScrollButton] = useState(false);
console.log("Avtar Url :",receiverAvatarURL)
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

    fetch(`http://localhost:3000/api/message/${conversationId}`)
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




















// import React, { useEffect, useState, useRef } from 'react';
// import { io } from 'socket.io-client';
// import { useParams } from 'react-router-dom';
// import {
//   Card,
//   Form,
//   Button,
//   Container,
//   InputGroup,
//   Toast,
//   ToastContainer,
// } from 'react-bootstrap';
// import './message.css';

// const socket = io('http://localhost:3000');

// function Message() {
//   const { conversationId } = useParams();
//   const [messages, setMessages] = useState([]);
//   const [receiverName, setReceiverName] = useState('');
//   const [receiverAvatarURL, setReceiverAvatarURL] = useState('');
//   const [showToast, setShowToast] = useState(false);
//   const [toastMessage, setToastMessage] = useState('');
//   const [showScrollButton, setShowScrollButton] = useState(false);
//   const [selectedFile, setSelectedFile] = useState(null);

//   const messageRef = useRef(null);
//   const messagesEndRef = useRef(null);
//   const messagesContainerRef = useRef(null);

//   const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));

//   const scrollToBottom = () => {
//     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//   };

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
//     if (!conversationId) return;

//     socket.emit('join', { conversationId, userName: loggedInUser.name });

//     fetch(`http://localhost:3000/api/message/${conversationId}`)
//       .then((res) => res.json())
//       .then((result) => {
//         const messagesFetched = Array.isArray(result.data) ? result.data : [];

//         const otherMessage = messagesFetched.find(
//           (msg) => msg.createdBy._id !== loggedInUser.id
//         );

//         setReceiverName(
//           otherMessage?.createdBy?.name || otherMessage?.createdBy?.email || 'Unknown'
//         );
//         setReceiverAvatarURL(
//           otherMessage?.createdBy?.avatarUrl || 'https://via.placeholder.com/40'
//         );

//         setMessages(messagesFetched);
//         setTimeout(scrollToBottom, 100);
//       })
//       .catch((err) => {
//         console.error('Error fetching messages:', err);
//         setMessages([]);
//         setReceiverName('Unknown');
//         setReceiverAvatarURL('https://via.placeholder.com/40');
//       });

//     socket.on('receiveMessage', ({ userName: sender, message, fileUrl, createdAt }) => {
//       setMessages((prev) => [
//         ...prev,
//         {
//           createdBy: { name: sender },
//           content: message,
//           fileUrl,
//           createdAt: createdAt || new Date().toISOString(),
//         },
//       ]);

//       if (sender !== loggedInUser.name) {
//         setToastMessage(`New message from ${sender}`);
//         setShowToast(true);
//       }
//     });

//     return () => {
//       socket.off('receiveMessage');
//     };
//   }, [conversationId, loggedInUser.id, loggedInUser.name]);

//   useEffect(() => {
//     scrollToBottom();
//   }, [messages]);

//   const handleScroll = () => {
//     const container = messagesContainerRef.current;
//     if (!container) return;
//     const atBottom =
//       container.scrollHeight - container.scrollTop - container.clientHeight < 50;
//     setShowScrollButton(!atBottom);
//   };

//   useEffect(() => {
//     const container = messagesContainerRef.current;
//     if (!container) return;
//     container.addEventListener('scroll', handleScroll);
//     return () => {
//       container.removeEventListener('scroll', handleScroll);
//     };
//   }, []);

//   const handleSend = async (e) => {
//     e.preventDefault();
//     const msg = messageRef.current.value.trim();
//     if (!msg && !selectedFile) return;

//     const formData = new FormData();
//     formData.append('message', msg);
//     formData.append('conversationId', conversationId);
//     formData.append('userName', loggedInUser.name);
//     formData.append('userId', loggedInUser.id);
//     if (selectedFile) formData.append('file', selectedFile);

//     try {
//       const res = await fetch('http://localhost:3000/api/message/send', {
//         method: 'POST',
//         body: formData,
//       });
//       const result = await res.json();

//       if (res.ok) {
//         socket.emit('sendMessage', {
//           conversationId,
//           userName: loggedInUser.name,
//           message: msg,
//           fileUrl: result.fileUrl, // include file URL if sent
//           userId: loggedInUser.id,
//         });

//         messageRef.current.value = '';
//         setSelectedFile(null);
//       }
//     } catch (err) {
//       console.error('Send error:', err);
//     }
//   };

//   return (
//     <Container fluid className="p-0 chat-container" style={{ height: 'calc(100vh - 76px)' }}>
//       <Card className="border-0 shadow-sm w-100 h-100 rounded-0 d-flex flex-column mt-5">
//         <Card.Header
//           className="text-dark shadow-sm border-0"
//           style={{ backgroundColor: 'rgba(179, 206, 246, 0.2)', height: '56px' }}
//         >
//           <div className="d-flex justify-content-between align-items-center h-100">
//             <div className="d-flex align-items-center gap-2">
//               <img
//                 src={receiverAvatarURL}
//                 alt={receiverName}
//                 style={{
//                   width: '36px',
//                   height: '36px',
//                   borderRadius: '50%',
//                   objectFit: 'cover',
//                 }}
//               />
//               <h6 className="mb-0">{receiverName}</h6>
//             </div>
//           </div>
//         </Card.Header>

//         <Card.Body className="d-flex flex-column p-0" style={{ height: 'calc(100% - 56px)' }}>
//           <div className="flex-grow-1 overflow-auto p-3" ref={messagesContainerRef}>
//             {messages.length === 0 ? (
//               <div className="text-muted text-center mt-5">
//                 No messages yet — start the conversation!
//               </div>
//             ) : (
//               messages.map((msg, idx) => {
//                 const isSentByCurrentUser =
//                   msg.createdBy?.email === loggedInUser.email ||
//                   msg.createdBy?.name === loggedInUser.name;

//                 return (
//                   <div
//                     key={idx}
//                     className={`mb-2 d-flex flex-column ${
//                       isSentByCurrentUser ? 'align-items-end text-end' : 'align-items-start text-start'
//                     }`}
//                   >
//                     <div>
//                       <small className="text-muted">{formatDate(msg.createdAt)}</small>
//                     </div>

//                     <div
//                       className={`mt-1 rounded-3 border-0 shadow-sm p-3 ${
//                         isSentByCurrentUser ? '' : 'bg-light text-dark'
//                       }`}
//                       style={
//                         isSentByCurrentUser
//                           ? { backgroundColor: 'rgba(133, 221, 250, 0.2)' }
//                           : undefined
//                       }
//                     >
//                       {msg.fileUrl ? (
//                         msg.fileUrl.match(/\.(jpeg|jpg|png|gif|webp)$/i) ? (
//                           <img
//                             src={msg.fileUrl}
//                             alt="uploaded"
//                             style={{
//                               maxWidth: '200px',
//                               maxHeight: '200px',
//                               borderRadius: '8px',
//                               objectFit: 'cover',
//                             }}
//                           />
//                         ) : (
//                           <a
//                             href={msg.fileUrl}
//                             target="_blank"
//                             rel="noopener noreferrer"
//                             style={{ textDecoration: 'none' }}
//                           >
//                             📎 Download file
//                           </a>
//                         )
//                       ) : (
//                         <span>{msg.content || msg.message}</span>
//                       )}
//                     </div>
//                   </div>
//                 );
//               })
//             )}
//             <div ref={messagesEndRef} />
//           </div>

//           {showScrollButton && (
//             <Button
//               variant="light"
//               className="position-absolute"
//               style={{
//                 bottom: '75px',
//                 right: '20px',
//                 borderRadius: '50%',
//                 boxShadow: '0 0 5px rgba(0,0,0,0.2)',
//                 zIndex: 10,
//               }}
//               onClick={scrollToBottom}
//             >
//               <i className="fa fa-arrow-down"></i>
//             </Button>
//           )}

//           <Form
//             onSubmit={handleSend}
//             className="w-100 p-2"
//             style={{ borderTop: '1px solid #ddd', background: '#fff' }}
//           >
//             <Form.Group className="d-flex m-0">
//               <InputGroup>
//                 <Form.Control
//                   type="text"
//                   ref={messageRef}
//                   placeholder="Type a message"
//                   autoComplete="off"
//                 />
//                 <InputGroup.Text style={{ background: 'white', borderLeft: '0' }}>
//                   <label htmlFor="fileInput" className="m-0" style={{ cursor: 'pointer' }}>
//                     <i className="fa fa-paperclip"></i>
//                   </label>
//                   <input
//                     type="file"
//                     id="fileInput"
//                     style={{ display: 'none' }}
//                     onChange={(e) => setSelectedFile(e.target.files[0])}
//                   />
//                 </InputGroup.Text>
//               </InputGroup>
//               <Button type="submit" className="ms-2">
//                 <i className="fa fa-paper-plane"></i>
//               </Button>
//             </Form.Group>
//           </Form>
//         </Card.Body>
//       </Card>

//       <ToastContainer position="top-end" className="p-3">
//         <Toast
//           onClose={() => setShowToast(false)}
//           show={showToast}
//           delay={3000}
//           autohide
//           bg="primary"
//         >
//           <Toast.Body className="text-white">{toastMessage}</Toast.Body>
//         </Toast>
//       </ToastContainer>
//     </Container>
//   );
// }

// export default Message;



// import React, { useEffect, useState, useRef } from 'react';
// import { io } from 'socket.io-client';
// import { useParams } from 'react-router-dom';
// import {
//   Card,
//   Form,
//   Button,
//   Container,
//   InputGroup,
//   Toast,
//   ToastContainer,
// } from 'react-bootstrap';
// import './message.css';

// const socket = io('https://socketchatnode-1.onrender.com');

// function Message() {
//   const { conversationId } = useParams();
//   const [messages, setMessages] = useState([]);
//   const [receiverName, setReceiverName] = useState('');
//   const [receiverAvatarURL, setReceiverAvatarURL] = useState('');
//   const [showToast, setShowToast] = useState(false);
//   const [toastMessage, setToastMessage] = useState('');
//   const [showScrollButton, setShowScrollButton] = useState(false);
//   const [selectedFile, setSelectedFile] = useState(null);

//   const messageRef = useRef(null);
//   const messagesEndRef = useRef(null);
//   const messagesContainerRef = useRef(null);
//   const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));

//   const scrollToBottom = () => {
//     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//   };

//   const formatDate = (dateString) => {
//     if (!dateString) return '';
//     const date = new Date(dateString);
//     return date.toLocaleString('en-IN', {
//       timeZone: 'Asia/Kolkata',
//       hour12: true,
//       hour: 'numeric',
//       minute: 'numeric',
//     });
//   };

//   // Fetch messages on mount
//   useEffect(() => {
//     if (!conversationId) return;

//     socket.emit('join', { conversationId, userName: loggedInUser.name });

//     fetch(`https://socketchatnode-1.onrender.com/api/message/${conversationId}`)
//       .then((res) => res.json())
//       .then((result) => {
//         const msgs = Array.isArray(result.data) ? result.data : [];

//         const otherUserMsg = msgs.find(
//           (msg) => msg.createdBy._id !== loggedInUser.id
//         );
//         setReceiverName(
//           otherUserMsg?.createdBy?.name || otherUserMsg?.createdBy?.email || 'Unknown'
//         );
//         setReceiverAvatarURL(
//           otherUserMsg?.createdBy?.avatarUrl || 'https://via.placeholder.com/40'
//         );

//         setMessages(msgs);
//         setTimeout(scrollToBottom, 100);
//       })
//       .catch(() => {
//         setMessages([]);
//         setReceiverName('Unknown');
//         setReceiverAvatarURL('https://via.placeholder.com/40');
//       });

//     socket.on('receiveMessage', (msgData) => {
//       setMessages((prev) => [...prev, msgData]);
//       if (msgData.createdBy?.name !== loggedInUser.name) {
//         setToastMessage(`New message from ${msgData.createdBy.name}`);
//         setShowToast(true);
//       }
//     });

//     return () => {
//       socket.off('receiveMessage');
//     };
//   }, [conversationId, loggedInUser.id, loggedInUser.name]);

//   useEffect(() => {
//     scrollToBottom();
//   }, [messages]);

//   const handleScroll = () => {
//     const container = messagesContainerRef.current;
//     if (!container) return;
//     const atBottom =
//       container.scrollHeight - container.scrollTop - container.clientHeight < 50;
//     setShowScrollButton(!atBottom);
//   };

//   useEffect(() => {
//     const container = messagesContainerRef.current;
//     if (!container) return;
//     container.addEventListener('scroll', handleScroll);
//     return () => container.removeEventListener('scroll', handleScroll);
//   }, []);

//   const handleSend = async (e) => {
//     e.preventDefault();
//     const msg = messageRef.current.value.trim();
//     if (!msg && !selectedFile) return;

//     const formData = new FormData();
//     formData.append('message', msg);
//     formData.append('conversationId', conversationId);
//     formData.append('userName', loggedInUser.name);
//     formData.append('userId', loggedInUser.id);
//     if (selectedFile) formData.append('file', selectedFile);

//     try {
//       await fetch('https://socketchatnode-1.onrender.com/api/message/send', {
//         method: 'POST',
//         body: formData,
//       });

//       messageRef.current.value = '';
//       setSelectedFile(null);
//     } catch (err) {
//       console.error('Send error:', err);
//     }
//   };

//   return (
//     <Container fluid className="p-0 chat-container" style={{ height: 'calc(100vh - 76px)' }}>
//       <Card className="border-0 shadow-sm w-100 h-100 rounded-0 d-flex flex-column mt-5">
//         {/* Header */}
//         <Card.Header className="text-dark shadow-sm border-0" style={{ backgroundColor: 'rgba(179, 206, 246, 0.2)' }}>
//           <div className="d-flex align-items-center gap-2">
//             <img src={receiverAvatarURL} alt={receiverName} style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }} />
//             <h6 className="mb-0">{receiverName}</h6>
//           </div>
//         </Card.Header>

//         {/* Messages */}
//         <Card.Body className="d-flex flex-column p-0" style={{ height: 'calc(100% - 56px)' }}>
//           <div className="flex-grow-1 overflow-auto p-3" ref={messagesContainerRef}>
//             {messages.length === 0 ? (
//               <div className="text-muted text-center mt-5">No messages yet — start the conversation!</div>
//             ) : (
//               messages.map((msg, idx) => {
//                 const isOwn = msg.createdBy?.email === loggedInUser.email || msg.createdBy?.name === loggedInUser.name;
//                 return (
//                   <div key={idx} className={`mb-2 d-flex flex-column ${isOwn ? 'align-items-end text-end' : 'align-items-start text-start'}`}>
//                     <small className="text-muted">{formatDate(msg.createdAt)}</small>
//                     <div className={`mt-1 rounded-3 border-0 shadow-sm p-3 ${isOwn ? '' : 'bg-light text-dark'}`} style={isOwn ? { backgroundColor: 'rgba(133, 221, 250, 0.2)' } : undefined}>
//                       {msg.media?.length > 0 ? (
//                         msg.media.map((url, i) =>
//                           url.match(/\.(jpeg|jpg|png|gif|webp)$/i) ? (
//                             <img key={i} src={url} alt="uploaded" style={{ maxWidth: '200px', maxHeight: '200px', borderRadius: '8px', objectFit: 'cover' }} />
//                           ) : (
//                             <a key={i} href={url} target="_blank" rel="noopener noreferrer">📎 Download file</a>
//                           )
//                         )
//                       ) : (
//                         <span>{msg.content}</span>
//                       )}
//                     </div>
//                   </div>
//                 );
//               })
//             )}
//             <div ref={messagesEndRef} />
//           </div>

//           {/* Scroll-to-bottom */}
//           {showScrollButton && (
//             <Button variant="light" className="position-absolute" style={{ bottom: '75px', right: '20px', borderRadius: '50%', boxShadow: '0 0 5px rgba(0,0,0,0.2)', zIndex: 10 }} onClick={scrollToBottom}>
//               <i className="fa fa-arrow-down"></i>
//             </Button>
//           )}

//           {/* Message Input */}
//           <Form onSubmit={handleSend} className="w-100 p-2" style={{ borderTop: '1px solid #ddd', background: '#fff' }}>
//             <Form.Group className="d-flex m-0">
//               <InputGroup>
//                 <Form.Control type="text" ref={messageRef} placeholder="Type a message" autoComplete="off" />
//                 <InputGroup.Text style={{ background: 'white', borderLeft: '0' }}>
//                   <label htmlFor="fileInput" className="m-0" style={{ cursor: 'pointer' }}>
//                     <i className="fa fa-paperclip"></i>
//                   </label>
//                   <input type="file" id="fileInput" style={{ display: 'none' }} onChange={(e) => setSelectedFile(e.target.files[0])} />
//                 </InputGroup.Text>
//               </InputGroup>
//               <Button type="submit" className="ms-2"><i className="fa fa-paper-plane"></i></Button>
//             </Form.Group>
//           </Form>
//         </Card.Body>
//       </Card>

//       {/* Toast */}
//       <ToastContainer position="top-end" className="p-3">
//         <Toast onClose={() => setShowToast(false)} show={showToast} delay={3000} autohide bg="primary">
//           <Toast.Body className="text-white">{toastMessage}</Toast.Body>
//         </Toast>
//       </ToastContainer>
//     </Container>
//   );
// }

// export default Message;
