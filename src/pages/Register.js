import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const from = location.state?.from?.pathname || '/dashboard';

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) setError('');
  };

  const validateForm = () => {
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      return 'Please fill in all fields';
    }
    
    if (formData.name.length < 2) {
      return 'Name must be at least 2 characters long';
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      return 'Please enter a valid email address';
    }
    
    if (formData.password.length < 6) {
      return 'Password must be at least 6 characters long';
    }
    
    if (formData.password !== formData.confirmPassword) {
      return 'Passwords do not match';
    }
    
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      setLoading(false);
      return;
    }

    try {
      const { confirmPassword, ...registrationData } = formData;
      const result = await register(registrationData);
      
      if (result.success) {
        navigate(from, { replace: true });
      } else {
        setError(result.error || 'Registration failed');
      }
    } catch (error) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page min-vh-100 d-flex align-items-center bg-light">
      <Container>
        <Row className="justify-content-center">
          <Col md={7} lg={6} xl={5}>
            <Card className="shadow-lg border-0">
              <Card.Body className="p-5">
                <div className="text-center mb-4">
                  <h2 className="fw-bold text-primary">Join EduLearn</h2>
                  <p className="text-muted">Create your account to start learning</p>
                </div>

                {error && (
                  <Alert variant="danger" className="mb-4">
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    {error}
                  </Alert>
                )}

                <Form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <Form.Label className="fw-semibold">
                      <i className="bi bi-person me-2"></i>
                      Full Name
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="name"
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={handleChange}
                      size="lg"
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <Form.Label className="fw-semibold">
                      <i className="bi bi-envelope me-2"></i>
                      Email Address
                    </Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={handleChange}
                      size="lg"
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <Form.Label className="fw-semibold">
                      <i className="bi bi-shield-lock me-2"></i>
                      Account Type
                    </Form.Label>
                    <Form.Select
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      size="lg"
                    >
                      <option value="student">Student - Learn courses</option>
                      <option value="instructor">Instructor - Teach courses</option>
                    </Form.Select>
                  </div>

                  <Row>
                    <Col md={6}>
                      <div className="mb-3">
                        <Form.Label className="fw-semibold">
                          <i className="bi bi-lock me-2"></i>
                          Password
                        </Form.Label>
                        <Form.Control
                          type="password"
                          name="password"
                          placeholder="Enter password"
                          value={formData.password}
                          onChange={handleChange}
                          size="lg"
                          required
                        />
                      </div>
                    </Col>
                    <Col md={6}>
                      <div className="mb-3">
                        <Form.Label className="fw-semibold">
                          <i className="bi bi-lock me-2"></i>
                          Confirm Password
                        </Form.Label>
                        <Form.Control
                          type="password"
                          name="confirmPassword"
                          placeholder="Confirm password"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          size="lg"
                          required
                        />
                      </div>
                    </Col>
                  </Row>

                  <div className="mb-4">
                    <Form.Check
                      type="checkbox"
                      label={
                        <span className="text-muted">
                          I agree to the{' '}
                          <Link to="/terms" className="text-decoration-none">Terms of Service</Link>{' '}
                          and{' '}
                          <Link to="/privacy" className="text-decoration-none">Privacy Policy</Link>
                        </span>
                      }
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    className="w-100 mb-3"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Spinner
                          as="span"
                          animation="border"
                          size="sm"
                          role="status"
                          aria-hidden="true"
                          className="me-2"
                        />
                        Creating Account...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-person-plus me-2"></i>
                        Create Account
                      </>
                    )}
                  </Button>
                </Form>

                <hr className="my-4" />

                <div className="text-center">
                  <p className="text-muted mb-3">Already have an account?</p>
                  <Link 
                    to="/login" 
                    className="btn btn-outline-primary w-100"
                    state={{ from: location.state?.from }}
                  >
                    <i className="bi bi-box-arrow-in-right me-2"></i>
                    Sign In Instead
                  </Link>
                </div>
              </Card.Body>
            </Card>

            {/* Features */}
            <Card className="mt-3 border-0 bg-light">
              <Card.Body className="p-3">
                <h6 className="text-center mb-3 text-muted">Why Join EduLearn?</h6>
                <Row className="text-center">
                  <Col md={4}>
                    <i className="bi bi-play-circle text-primary mb-2 d-block"></i>
                    <small className="text-muted">Access to 1000+ courses</small>
                  </Col>
                  <Col md={4}>
                    <i className="bi bi-award text-primary mb-2 d-block"></i>
                    <small className="text-muted">Earn certificates</small>
                  </Col>
                  <Col md={4}>
                    <i className="bi bi-people text-primary mb-2 d-block"></i>
                    <small className="text-muted">Learn from experts</small>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Register;