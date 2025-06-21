import React, { useState } from 'react';
import { Navbar, Nav, Container, Offcanvas, Button, ListGroup } from 'react-bootstrap';

function Homepage() {
  const [showSidebar, setShowSidebar] = useState(false);

  const toggleSidebar = () => setShowSidebar(!showSidebar);

  return (
    <>
      {/* Navbar */}
      <Navbar bg="dark" variant="dark" expand="lg" className="px-3">
        <Container fluid>
          <Button variant="outline-light" onClick={toggleSidebar} className="me-2">
            ☰
          </Button>
          <Navbar.Brand href="#">NimapChat</Navbar.Brand>
          <Navbar.Toggle aria-controls="navbarScroll" />
          <Navbar.Collapse id="navbarScroll">
            <Nav className="ms-auto">
              <Nav.Link href="/home">home</Nav.Link>
              <Nav.Link href="/chat">groups</Nav.Link>
              <Nav.Link href="#">Logout</Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* Sidebar */}
      <Offcanvas show={showSidebar} onHide={toggleSidebar} backdrop responsive="lg">
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Menu</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <ListGroup variant="flush">
            <ListGroup.Item action href="#">Dashboard</ListGroup.Item>
            <ListGroup.Item action href="#">Messages</ListGroup.Item>
            <ListGroup.Item action href="#">Settings</ListGroup.Item>
            <ListGroup.Item action href="#">Help</ListGroup.Item>
          </ListGroup>
        </Offcanvas.Body>
      </Offcanvas>

      {/* Main Content */}
      <Container className="mt-4">
 
      </Container>
    </>
  );
}

export default Homepage;
