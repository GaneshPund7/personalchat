import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Container, Form, Button, Card, Row, Col } from 'react-bootstrap';

function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [roleId, setRoleId] = useState('');
  const [roles, setRoles] = useState([]);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [isOtpVerified, setIsOtpVerified] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await axios.get('http://localhost:3000/user/role');
        console.log("Roles API Response:", response.data);
        setRoles(response.data.data);
        if (response.data.data.length > 0) {
          setRoleId(response.data.data[0].id);
        }
      } catch (error) {
        console.error("Error fetching roles:", error);
      }
    };

    fetchRoles();
  }, []);

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!isOtpVerified) {
      alert('Please verify your OTP before registering.');
      return;
    }

    try {
      const response = await axios.post('http://localhost:3000/user', {
        email,
        password,
        name,
        RoleId: roleId,
      });

      console.log("Registration Success:", response.data);
      navigate('/');
    } catch (error) {
      console.error("Registration Failed:", error);
      alert("Error creating user.");
    }
  };

  const handleCreateOtp = async () => {
    if (!email) {
      alert('Please enter an email first.');
      return;
    }

    try {
      const response = await axios.post('http://localhost:3000/user/creatOTP', { email });
      console.log("OTP Sent:", response.data);
      setOtpSent(true);
      alert('OTP sent to your email.');
    } catch (error) {
      console.error("Failed to send OTP:", error);
      alert('Failed to send OTP.');
    }
  };
const handleVerifyOtp = async () => {
  if (!otp) {
    alert('Please enter the OTP.');
    return;
  }

  try {
    const response = await axios.post('http://localhost:3000/user/verifyOTP', { email, otp });
    console.log("OTP Verification:", response.data);

    if (response.data.success || response.data.message === 'OTP verify successfully') {
      setIsOtpVerified(true);
      alert('OTP verified successfully!');
    } else {
      alert('Invalid OTP.');
    }

  } catch (error) {
    console.error("OTP verification failed:", error);
    alert('Failed to verify OTP.');
  }
};


  return (
    <Container className="mt-5" style={{ maxWidth: '400px' }}>
      <Card>
        <Card.Header as="h5">Register</Card.Header>
        <Card.Body>
          <Form onSubmit={handleRegister}>
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Enter name"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Row>
                <Col xs={8}>
                  <Form.Control
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setOtpSent(false);
                      setIsOtpVerified(false);
                      setOtp('');
                    }}
                    required
                    placeholder="Enter email"
                  />
                </Col>
                <Col xs={4}>
                  <Button variant="secondary" onClick={handleCreateOtp}>
                    Get OTP
                  </Button>
                </Col>
              </Row>
            </Form.Group>

            {otpSent && !isOtpVerified && (
              <Form.Group className="mb-3">
                <Form.Label>Enter OTP</Form.Label>
                <Row>
                  <Col xs={8}>
                    <Form.Control
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="Enter OTP"
                    />
                  </Col>
                  <Col xs={4}>
                    <Button variant="success" onClick={handleVerifyOtp}>
                      Verify
                    </Button>
                  </Col>
                </Row>
              </Form.Group>
            )}

            <Form.Group className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter password"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Role</Form.Label>
              <Form.Select
                value={roleId}
                onChange={(e) => setRoleId(e.target.value)}
                required
              >
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.roleName}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Button type="submit" className="w-100" disabled={!isOtpVerified}>
              Register
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default Register;
