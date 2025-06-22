import { Outlet, Link } from 'react-router-dom';
import { Navbar, Nav, Container, Button, ListGroup, Row, Col, Form, Spinner } from 'react-bootstrap';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Layout() {
  const [showSidebar, setShowSidebar] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [activeChats, setActiveChats] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [searching, setSearching] = useState(false);
  const [chattingUserId, setChattingUserId] = useState(null);


  const navigate = useNavigate();
  // Conversations and userTo details for conversations
  const [conversations, setConversations] = useState([]);
  const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
  // console.log(conversations)
  const [conversationsUserTo, setConversationsUserTo] = useState([]);

  const token = localStorage.getItem('authToken');

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser && storedUser !== "undefined") {
      try {
        const user = JSON.parse(storedUser);
        if (user) {
          setCurrentUser(user);
          fetchConversations(user.id);
        }
      } catch {
        localStorage.removeItem("user");
      }
    }

    const savedChats = localStorage.getItem("activeChats");
    if (savedChats && savedChats !== "undefined") {
      try {
        const chats = JSON.parse(savedChats);
        setActiveChats(chats);
      } catch {
        localStorage.removeItem("activeChats");
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("activeChats", JSON.stringify(activeChats));
  }, [activeChats]);

  const toggleSidebar = () => setShowSidebar(!showSidebar);

  const fetchConversations = async () => {
    if (!loggedInUser?.id) return;

    try {
      const response = await axios.get(
        `https://socketchatnode-1.onrender.com/api/conversation?userId=${loggedInUser.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setConversations(response.data.result);

      // setConversationsUserTo(response.data.userTo);  
    } catch (err) {
      console.error('Error fetching conversations:', err);
    }
  };
  useEffect(() => {
    fetchConversations();
  }, []);
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearching(true);

    try {
      const response = await axios.get(
        `https://socketchatnode-1.onrender.com/api/user/search?search=${searchQuery}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSearchResults(response.data.data || []);
    } catch (error) {
      alert("User not found");
      setSearchResults([]);
    }
    finally {
      setSearching(false);
    }
  };

  const startConversation = async (userToId) => {
    setChattingUserId(userToId);
    try {
      const loggedInUser = currentUser;
      await axios.post(
        `https://socketchatnode-1.onrender.com/api/conversation`,
        {
          type: 'private',
          userTo: userToId,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      // alert('Conversation created successfully!');
      setSearchResults([]);
      // fetchConversations(loggedInUser.id);
      fetchConversations();
    } catch (err) {
      console.error(err);
      // alert('Failed to start conversation');
    }
    finally {
      setChattingUserId(null);
    }
  };

  const handleRemoveChat = (email) => {
    setActiveChats((prev) => prev.filter(chat => chat.email !== email));
  };

  return (
    <>
      {/* Top Navbar */}
      <Navbar bg="dark" variant="dark" expand="lg" className="px-3 fixed-top">
        <Container fluid>
          <Navbar.Brand as={Link} to="/home">Ws Chat</Navbar.Brand>
          <Button variant="outline-light" onClick={toggleSidebar} className="me-2">☰</Button>

        </Container>
      </Navbar>

      {/* Sidebar + Main Content */}
      <Container fluid>
        <Row>
          {showSidebar && (
            <Col
              md={3}
              xs={10}
              className="bg-light p-2 vh-100"
              style={{
                position: 'fixed',
                top: '56px',
                left: 0,
                overflowY: 'auto',
                zIndex: 1050,
                width: '250px',  // default
              }}
            >

              <ListGroup variant="flush">
                <ListGroup.Item action as={Link} to="/home">Dashboard</ListGroup.Item>
              </ListGroup>

              {/* Search */}
              <Form className="mt-3" onSubmit={handleSearch}>
                <Form.Group controlId="searchUser">
                  <Form.Control
                    type="text"
                    placeholder="Search users"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className='shadow-sm'
                  />
                </Form.Group>
                <Button
                  variant="primary"
                  type="submit"
                  className="mt-2 w-100 shadow-sm d-flex align-items-center justify-content-center"
                  disabled={searching}
                >
                  {searching ? (
                    <>
                      <Spinner
                        as="span"
                        animation="border"
                        size="sm"
                        role="status"
                        aria-hidden="true"
                        className="me-2"
                      />
                      Searching...
                    </>
                  ) : (
                    'Search'
                  )}
                </Button>

              </Form>

              {/* Show Search Results OR Conversations */}
              {searchResults.length > 0 ? (
                <>
                  <h6 className="mt-4">Search Results</h6>
                  <ListGroup className="mt-2">
                    {searchResults.map((user, index) => (
                      <ListGroup.Item
                        key={index}
                        className="d-flex justify-content-between align-items-center"
                      >
                        {user.name}
                        {/* <Button size="sm" variant="success" onClick={() => startConversation(user._id)}>
                          Chat
                        </Button>
         */}
                        <Button
                          size="sm"
                          variant="success"
                          onClick={() => startConversation(user._id)}
                          disabled={chattingUserId === user._id}
                        >
                          {chattingUserId === user._id ? (
                            <Spinner
                              as="span"
                              animation="border"
                              size="sm"
                              role="status"
                              aria-hidden="true"
                            />
                          ) : (
                            'Chat'
                          )}
                        </Button>


                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                </>
              ) : (
                <>
                  <h6 className="mt-4">Conversations: </h6>
                  {conversations.length > 0 ? (

                    <ul className="list-group">
                      <ListGroup className="mb-4">
                        {conversations.map((conv) => {
                          const otherUser = conv.userBy._id === loggedInUser.id ? conv.userTo : conv.userBy;
                          return (
                            <ListGroup.Item
                              key={conv._id}
                              className="d-flex justify-content-between align-items-center border-0 shadow-sm"
                              onClick={() => {
                                navigate(`chat/${conv._id}`);
                                toggleSidebar();
                              }}
                            >
                              <img
                                src={otherUser.avatarUrl || otherUser.avatar}

                                alt={`${otherUser.name}`}
                                style={{
                                  width: '30px',
                                  height: '30px',
                                  borderRadius: '50%',
                                  objectFit: 'cover',
                                  marginRight: '8px',
                                }}
                              />
                              <span className="me-3"><strong>{otherUser.name}</strong></span>
                              {/* <Button
                size="sm"
                variant="info" */}
                              {/* > */}
                              {/* Chat
              </Button> */}
                            </ListGroup.Item>
                          );
                        })}
                      </ListGroup>
                    </ul>
                  ) : (
                    <p>No conversations found.</p>
                  )}
                </>
              )}

              {/* Active Chats */}
              {activeChats.length > 0 && (
                <>
                  <h6 className="mt-4">Active Chats</h6>
                  <ListGroup className="mt-2">
                    {activeChats.map((chatUser, index) => (
                      <ListGroup.Item
                        key={index}
                        className="d-flex justify-content-between align-items-center"
                      >
                        <Link
                          to={`/home/private-chat/${chatUser.email}`}
                          className="text-decoration-none text-dark flex-grow-1"
                        >
                          {chatUser.name}
                        </Link>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => handleRemoveChat(chatUser.email)}
                        >
                          ×
                        </Button>
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                </>
              )}
            </Col>
          )}

          {/* Main Content */}
          <Col className={showSidebar ? 'offset-md-2 mt-3' : 'mt-3'}>
            <Outlet />
          </Col>
        </Row>
      </Container>
    </>
  );
}

export default Layout;
