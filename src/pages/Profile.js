import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner, Badge } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    bio: '',
    phone: '',
    location: '',
    website: '',
    linkedIn: '',
    skills: [],
    expertise: [],
    experience: '',
    education: ''
  });

  const [newSkill, setNewSkill] = useState('');
  const [newExpertise, setNewExpertise] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        bio: user.bio || '',
        phone: user.phone || '',
        location: user.location || '',
        website: user.website || '',
        linkedIn: user.linkedIn || '',
        skills: user.skills || [],
        expertise: user.expertise || [],
        experience: user.experience || '',
        education: user.education || ''
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
    if (success) setSuccess('');
  };

  const addSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }));
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const addExpertise = () => {
    if (newExpertise.trim() && !formData.expertise.includes(newExpertise.trim())) {
      setFormData(prev => ({
        ...prev,
        expertise: [...prev.expertise, newExpertise.trim()]
      }));
      setNewExpertise('');
    }
  };

  const removeExpertise = (expertiseToRemove) => {
    setFormData(prev => ({
      ...prev,
      expertise: prev.expertise.filter(exp => exp !== expertiseToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Basic validation
    if (!formData.name.trim()) {
      setError('Name is required');
      setLoading(false);
      return;
    }

    if (!formData.email.trim()) {
      setError('Email is required');
      setLoading(false);
      return;
    }

    try {
      const result = await updateProfile(formData);
      if (result.success) {
        setSuccess('Profile updated successfully!');
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      } else {
        setError(result.error || 'Failed to update profile');
      }
    } catch (error) {
      setError('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getRoleDisplayName = (role) => {
    switch (role) {
      case 'admin': return 'Administrator';
      case 'instructor': return 'Instructor';
      case 'student': return 'Student';
      default: return 'User';
    }
  };

  const getRoleBadgeVariant = (role) => {
    switch (role) {
      case 'admin': return 'danger';
      case 'instructor': return 'success';
      case 'student': return 'primary';
      default: return 'secondary';
    }
  };

  return (
    <div className="profile-page py-5" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      <Container>
        <Row className="justify-content-center">
          <Col lg={10}>
            {/* Header */}
            <div className="d-flex align-items-center justify-content-between mb-4">
              <div>
                <h1 className="fw-bold text-dark mb-2">Update Profile</h1>
                <p className="text-muted mb-0">Keep your profile information up to date</p>
              </div>
              <div className="d-flex align-items-center">
                <Badge bg={getRoleBadgeVariant(user?.role)} className="me-3 px-3 py-2">
                  <i className="bi bi-person-badge me-2"></i>
                  {getRoleDisplayName(user?.role)}
                </Badge>
                <Button 
                  variant="outline-secondary" 
                  className="rounded-pill px-4"
                  onClick={() => navigate('/dashboard')}
                >
                  <i className="bi bi-arrow-left me-2"></i>
                  Back to Dashboard
                </Button>
              </div>
            </div>

            <Card className="border-0 shadow-sm" style={{ borderRadius: '16px' }}>
              <Card.Body className="p-4">
                {error && (
                  <Alert variant="danger" className="mb-4 rounded-pill text-center">
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    {error}
                  </Alert>
                )}

                {success && (
                  <Alert variant="success" className="mb-4 rounded-pill text-center">
                    <i className="bi bi-check-circle me-2"></i>
                    {success}
                  </Alert>
                )}

                <Form onSubmit={handleSubmit}>
                  <Row>
                    {/* Basic Information */}
                    <Col lg={6}>
                      <Card className="border-0 bg-light mb-4">
                        <Card.Header className="bg-primary text-white border-0" style={{ borderRadius: '12px 12px 0 0' }}>
                          <h5 className="mb-0">
                            <i className="bi bi-person me-2"></i>
                            Basic Information
                          </h5>
                        </Card.Header>
                        <Card.Body className="p-3">
                          <Row>
                            <Col md={12} className="mb-3">
                              <Form.Label className="fw-semibold text-dark mb-2">
                                <i className="bi bi-person-fill me-2 text-primary"></i>
                                Full Name *
                              </Form.Label>
                              <Form.Control
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                placeholder="Enter your full name"
                                style={{ borderRadius: '8px', border: '1px solid #e9ecef' }}
                              />
                            </Col>
                            <Col md={12} className="mb-3">
                              <Form.Label className="fw-semibold text-dark mb-2">
                                <i className="bi bi-envelope-fill me-2 text-primary"></i>
                                Email Address *
                              </Form.Label>
                              <Form.Control
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                placeholder="Enter your email address"
                                style={{ borderRadius: '8px', border: '1px solid #e9ecef' }}
                              />
                            </Col>
                            <Col md={6} className="mb-3">
                              <Form.Label className="fw-semibold text-dark mb-2">
                                <i className="bi bi-telephone-fill me-2 text-primary"></i>
                                Phone Number
                              </Form.Label>
                              <Form.Control
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="Enter phone number"
                                style={{ borderRadius: '8px', border: '1px solid #e9ecef' }}
                              />
                            </Col>
                            <Col md={6} className="mb-3">
                              <Form.Label className="fw-semibold text-dark mb-2">
                                <i className="bi bi-geo-alt-fill me-2 text-primary"></i>
                                Location
                              </Form.Label>
                              <Form.Control
                                type="text"
                                name="location"
                                value={formData.location}
                                onChange={handleChange}
                                placeholder="City, Country"
                                style={{ borderRadius: '8px', border: '1px solid #e9ecef' }}
                              />
                            </Col>
                            <Col md={12} className="mb-3">
                              <Form.Label className="fw-semibold text-dark mb-2">
                                <i className="bi bi-chat-text-fill me-2 text-primary"></i>
                                Bio
                              </Form.Label>
                              <Form.Control
                                as="textarea"
                                rows={3}
                                name="bio"
                                value={formData.bio}
                                onChange={handleChange}
                                placeholder={user?.role === 'instructor' ? "Tell students about your teaching experience and background..." : "Tell us about yourself..."}
                                style={{ borderRadius: '8px', border: '1px solid #e9ecef' }}
                              />
                            </Col>
                          </Row>
                        </Card.Body>
                      </Card>
                    </Col>

                    {/* Professional Information */}
                    <Col lg={6}>
                      <Card className="border-0 bg-light mb-4">
                        <Card.Header className="bg-success text-white border-0" style={{ borderRadius: '12px 12px 0 0' }}>
                          <h5 className="mb-0">
                            <i className="bi bi-briefcase me-2"></i>
                            Professional Information
                          </h5>
                        </Card.Header>
                        <Card.Body className="p-3">
                          <Row>
                            <Col md={6} className="mb-3">
                              <Form.Label className="fw-semibold text-dark mb-2">
                                <i className="bi bi-globe me-2 text-success"></i>
                                Website
                              </Form.Label>
                              <Form.Control
                                type="url"
                                name="website"
                                value={formData.website}
                                onChange={handleChange}
                                placeholder="https://yourwebsite.com"
                                style={{ borderRadius: '8px', border: '1px solid #e9ecef' }}
                              />
                            </Col>
                            <Col md={6} className="mb-3">
                              <Form.Label className="fw-semibold text-dark mb-2">
                                <i className="bi bi-linkedin me-2 text-success"></i>
                                LinkedIn
                              </Form.Label>
                              <Form.Control
                                type="url"
                                name="linkedIn"
                                value={formData.linkedIn}
                                onChange={handleChange}
                                placeholder="LinkedIn profile URL"
                                style={{ borderRadius: '8px', border: '1px solid #e9ecef' }}
                              />
                            </Col>
                            
                            {user?.role === 'instructor' && (
                              <>
                                <Col md={12} className="mb-3">
                                  <Form.Label className="fw-semibold text-dark mb-2">
                                    <i className="bi bi-clock-history me-2 text-success"></i>
                                    Teaching Experience
                                  </Form.Label>
                                  <Form.Control
                                    as="textarea"
                                    rows={3}
                                    name="experience"
                                    value={formData.experience}
                                    onChange={handleChange}
                                    placeholder="Describe your teaching and professional experience..."
                                    style={{ borderRadius: '8px', border: '1px solid #e9ecef' }}
                                  />
                                </Col>
                              </>
                            )}
                            
                            <Col md={12} className="mb-3">
                              <Form.Label className="fw-semibold text-dark mb-2">
                                <i className="bi bi-mortarboard me-2 text-success"></i>
                                Education
                              </Form.Label>
                              <Form.Control
                                as="textarea"
                                rows={2}
                                name="education"
                                value={formData.education}
                                onChange={handleChange}
                                placeholder="Your educational background..."
                                style={{ borderRadius: '8px', border: '1px solid #e9ecef' }}
                              />
                            </Col>
                          </Row>
                        </Card.Body>
                      </Card>
                    </Col>

                    {/* Skills Section */}
                    <Col lg={6}>
                      <Card className="border-0 bg-light mb-4">
                        <Card.Header className="bg-info text-white border-0" style={{ borderRadius: '12px 12px 0 0' }}>
                          <h5 className="mb-0">
                            <i className="bi bi-tools me-2"></i>
                            Skills
                          </h5>
                        </Card.Header>
                        <Card.Body className="p-3">
                          <div className="mb-3">
                            <div className="d-flex">
                              <Form.Control
                                type="text"
                                value={newSkill}
                                onChange={(e) => setNewSkill(e.target.value)}
                                placeholder="Add a skill"
                                style={{ borderRadius: '8px 0 0 8px', border: '1px solid #e9ecef' }}
                                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                              />
                              <Button 
                                variant="info" 
                                onClick={addSkill}
                                style={{ borderRadius: '0 8px 8px 0' }}
                              >
                                <i className="bi bi-plus"></i>
                              </Button>
                            </div>
                          </div>
                          <div className="d-flex flex-wrap gap-2">
                            {formData.skills.map((skill, index) => (
                              <Badge 
                                key={index} 
                                bg="info" 
                                className="d-flex align-items-center px-3 py-2"
                                style={{ borderRadius: '20px' }}
                              >
                                {skill}
                                <button
                                  type="button"
                                  className="btn-close btn-close-white ms-2"
                                  style={{ fontSize: '0.7rem' }}
                                  onClick={() => removeSkill(skill)}
                                ></button>
                              </Badge>
                            ))}
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>

                    {/* Expertise Section (for instructors) */}
                    {user?.role === 'instructor' && (
                      <Col lg={6}>
                        <Card className="border-0 bg-light mb-4">
                          <Card.Header className="bg-warning text-dark border-0" style={{ borderRadius: '12px 12px 0 0' }}>
                            <h5 className="mb-0">
                              <i className="bi bi-star me-2"></i>
                              Areas of Expertise
                            </h5>
                          </Card.Header>
                          <Card.Body className="p-3">
                            <div className="mb-3">
                              <div className="d-flex">
                                <Form.Control
                                  type="text"
                                  value={newExpertise}
                                  onChange={(e) => setNewExpertise(e.target.value)}
                                  placeholder="Add expertise area"
                                  style={{ borderRadius: '8px 0 0 8px', border: '1px solid #e9ecef' }}
                                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addExpertise())}
                                />
                                <Button 
                                  variant="warning" 
                                  onClick={addExpertise}
                                  style={{ borderRadius: '0 8px 8px 0' }}
                                >
                                  <i className="bi bi-plus"></i>
                                </Button>
                              </div>
                            </div>
                            <div className="d-flex flex-wrap gap-2">
                              {formData.expertise.map((exp, index) => (
                                <Badge 
                                  key={index} 
                                  bg="warning" 
                                  text="dark"
                                  className="d-flex align-items-center px-3 py-2"
                                  style={{ borderRadius: '20px' }}
                                >
                                  {exp}
                                  <button
                                    type="button"
                                    className="btn-close ms-2"
                                    style={{ fontSize: '0.7rem' }}
                                    onClick={() => removeExpertise(exp)}
                                  ></button>
                                </Badge>
                              ))}
                            </div>
                          </Card.Body>
                        </Card>
                      </Col>
                    )}
                  </Row>

                  {/* Submit Button */}
                  <div className="text-center pt-3 border-top">
                    <Button 
                      type="submit" 
                      variant="primary" 
                      size="lg" 
                      disabled={loading}
                      className="rounded-pill px-5 py-3"
                      style={{ 
                        background: 'linear-gradient(45deg, #007bff, #0056b3)',
                        border: 'none',
                        fontSize: '1.1rem',
                        fontWeight: '600'
                      }}
                    >
                      {loading ? (
                        <>
                          <Spinner
                            as="span"
                            animation="border"
                            size="sm"
                            role="status"
                            className="me-2"
                          />
                          Updating Profile...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-check-circle me-2"></i>
                          Update Profile
                        </>
                      )}
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Profile;