 

import { jwtDecode } from 'jwt-decode';
import { useEffect, useState } from 'react';
import { Card, ListGroup, Form, Button, Container } from 'react-bootstrap';

function ChatWindow({ messages, onSend, currentUserEmail, input, setInput }) {
  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    onSend(input);
    setInput('');
  };

  const [userEmail, setUserEmail] = useState('');
  console.log('User email', userEmail)
    useEffect(() => {
      const token = localStorage.getItem('token');
      console.log("this is token ",token )
      if (token) {
        const decoded = jwtDecode(token);
        setUserEmail(decoded.email);
      }
      });

  return (
    <Container className="mt-2" style={{ maxWidth: '800px' }}>
      <Card className="shadow-sm mt-5">
         
        <Card.Header className="text-white bg-light"> 
        <span> {userEmail.split('@')[0]}</span>
            
        </Card.Header>
     
        <Card.Body>
          <ListGroup style={{ height: '350px', overflowY: 'auto', marginBottom: '15px' }}>
            {messages.map((msg, index) => {
              const isSentByCurrentUser = msg.senderEmail === currentUserEmail;
              return (
                <ListGroup.Item
                  key={index}
                  className={`d-flex flex-column border-0 ${
                    isSentByCurrentUser ? 'align-items-end text-end' : 'align-items-start text-start'
                  }`}
                >
                    <small className="fw-bold">{msg.senderEmail.split('@')[0]}</small>
                <Card className="shadow-sm p-2">
                  <span
                    className={`px-3 py-2 mt-1 rounded-3 ${
                      isSentByCurrentUser ? 'bg-secondary text-white' : 'bg-light text-dark'
                    }`}
                  >
                    {msg.content}
                  </span>
                </Card>
                </ListGroup.Item>
              );
            })}
          </ListGroup>

          <Form onSubmit={handleSend}>
            <Form.Group className="d-flex">
              <Form.Control
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type a message"
              /> 
              <Button type="submit" className="ms-2">
                Send
              </Button>
            </Form.Group>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default ChatWindow;
