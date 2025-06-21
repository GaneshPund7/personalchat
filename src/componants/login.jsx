// import { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import axios from 'axios';
// import { Outlet, Link } from 'react-router-dom';
// // import { Navbar, Nav, Container, Offcanvas, Button, ListGroup } from 'react-bootstrap';
// import { Container, Form, Button, Card , Nav} from 'react-bootstrap';

// function Login() {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const navigate = useNavigate();

//   const handleLogin = async (e) => {
//     e.preventDefault();

//     try {
//       const response = await axios.post('http://localhost:3000/login', {
//         email,
//         password,
//       });

//       console.log("Login Success:", response.data);

//     localStorage.setItem("token", response.data.token);
//     localStorage.setItem("user", JSON.stringify(response.data.user));
//       // Navigate to /chat after successful logins
//       navigate('/home');
//     } catch (error) {
//       console.error("Login Failed:", error);
//       alert("Invalid credentials or server error.");
//     }
//   };

//   return (
//     <Container className="mt-5" style={{ maxWidth: '400px' }}>
//       <Card>
//         <Card.Header as="h5">Login</Card.Header>
//         <Card.Body className="border-0 shadow">
//           <Form onSubmit={handleLogin}>
//             <Form.Group className="mb-3">
//               <Form.Label>Email</Form.Label>
//               <Form.Control 
//                 type="email" 
//                 value={email} 
//                 onChange={(e) => setEmail(e.target.value)} 
//                 required 
//                 placeholder="Enter email"
//               />
//             </Form.Group>
//             <Form.Group className="mb-3">
//               <Form.Label>Password</Form.Label>
//               <Form.Control 
//                 type="password" 
//                 value={password} 
//                 onChange={(e) => setPassword(e.target.value)} 
//                 required 
//                 placeholder="Enter password"
//               />
//             </Form.Group>
//             <Button type="submit" className="w-100">Login</Button>
//             {/* <Button type="submit" className="w-100">Login</Button> */}
//          <div className="d-flex justify-content-between"> 
//              <Nav.Link as={Link} to="/register" className="mt-3">Register </Nav.Link>
//             <Nav.Link as={Link} to="/register" className="mt-3">Forgot Password </Nav.Link>
//          </div>
//           </Form>
//         </Card.Body>
//       </Card>
//     </Container>
//   );
// }

// export default Login;
import React, { useState } from "react";
import { Link } from 'react-router-dom';
import axios from "axios";
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from "jwt-decode";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleEmailChange = (e) => setEmail(e.target.value);
  const handlePasswordChange = (e) => setPassword(e.target.value);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("https://socketchatnode-1.onrender.com/sign-up/login", { email, password });
      
      // Store user email
      localStorage.setItem("loggedInUser", JSON.stringify({ email }));

      alert("Login successful!");
      console.log(response.data);
      window.location.href = "/home";
    } catch (error) {
      console.error("Error logging in", error);
      alert("Login failed");
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center vh-100">
      <div className="card p-4 shadow" style={{ width: "400px" }}>
        <h2 className="text-center mb-4">Login</h2>
        <form onSubmit={handleLogin}>
          <div className="mb-3">
            <label className="form-label">Email</label>
            <input
              type="email"
              name="email"
              className="form-control"
              placeholder="Enter your email"
              onChange={handleEmailChange}
              value={email}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Password</label>
            <input
              type="password"
              name="password"
              className="form-control"
              placeholder="Enter your password"
              onChange={handlePasswordChange}
              value={password}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary w-100 mb-4">Login</button>
        </form>

        {/* Google Login */}
        {/* <div className="text-center mb-3">
          <GoogleLogin
            onSuccess={credentialResponse => {
              const decoded = jwtDecode(credentialResponse.credential);
              console.log("Google user:", decoded);

              // Store email or user info
              localStorage.setItem("loggedInUser", JSON.stringify({ email: decoded.email }));

              alert("Login successful via Google!");
              window.location.href = "/home";
            }}
            onError={() => {
              alert("Google Login Failed");
            }}
          />
        </div> */}
  <GoogleLogin
  onSuccess={credentialResponse => {
    axios.post(
      'https://socketchatnode-1.onrender.com/api/auth/googleSign',
      { token: credentialResponse.credential }, 
      
    )
    .then(response => {
      console.log('Login success:', response.data);

      localStorage.setItem("loggedInUser", JSON.stringify(response.data.user));
      localStorage.setItem("authToken", response.data.token);

      alert("Login successful via Google!");
      window.location.href = "/home";
    })
    .catch(err => {
      console.error(err);
      alert("Google login failed");
    });
  }}
  onError={() => {
    alert("Google Login Failed");
  }}
/>



        {/* Links */}
        <div className="d-flex justify-content-between mt-4">
          <Link to="/forgetPassword" className="btn btn-info">Forget Password</Link>
          <Link to="/register" className="btn btn-info">Register here</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
