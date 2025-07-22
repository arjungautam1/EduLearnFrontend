import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Button, Badge, ProgressBar, Tab, Tabs } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import { coursesAPI, enrollmentAPI } from '../services/api';
import CourseBanner from '../components/CourseBanner';

const Dashboard = () => {
  const { user, isInstructor, isAdmin } = useAuth();
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [instructorCourses, setInstructorCourses] = useState([]);
  const [stats, setStats] = useState({
    totalEnrolled: 0,
    completed: 0,
    inProgress: 0,
    certificates: 0
  });
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch enrolled courses for students
      if (user?.role === 'student') {
        const enrolledResponse = await enrollmentAPI.getEnrolledCourses();
        if (enrolledResponse.success) {
          setEnrolledCourses(enrolledResponse.data);
          calculateStats(enrolledResponse.data);
        }
      }
      
      // Fetch instructor courses
      if (isInstructor()) {
        const instructorResponse = await coursesAPI.getInstructorCourses();
        if (instructorResponse.success) {
          setInstructorCourses(instructorResponse.data);
        }
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.role, isInstructor]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const calculateStats = (courses) => {
    const totalEnrolled = courses.length;
    const completed = courses.filter(c => c.progress >= 100).length;
    const inProgress = courses.filter(c => c.progress > 0 && c.progress < 100).length;
    const certificates = courses.filter(c => c.certificateEarned).length;
    
    setStats({ totalEnrolled, completed, inProgress, certificates });
  };

  const getProgressVariant = (progress) => {
    if (progress >= 100) return 'success';
    if (progress >= 50) return 'info';
    if (progress >= 25) return 'warning';
    return 'danger';
  };

  if (loading) {
    return (
      <Container className="py-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 text-muted">Loading your dashboard...</p>
        </div>
      </Container>
    );
  }

  return (
    <div className="dashboard-page py-5">
      <Container>
        {/* Header */}
        <Row className="mb-4">
          <Col>
            <h1 className="fw-bold">Welcome back, {user?.name}!</h1>
            <p className="text-muted lead">
              {user?.role === 'student' ? 'Continue your learning journey' : 'Manage your courses and students'}
            </p>
          </Col>
        </Row>

        {user?.role === 'student' && (
          <>
            {/* Stats Cards */}
            <Row className="mb-5">
              <Col md={3} sm={6} className="mb-4">
                <Card className="text-center border-0 shadow-sm">
                  <Card.Body>
                    <i className="bi bi-book-half display-4 text-primary mb-3"></i>
                    <h3 className="fw-bold">{stats.totalEnrolled}</h3>
                    <p className="text-muted mb-0">Enrolled Courses</p>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={3} sm={6} className="mb-4">
                <Card className="text-center border-0 shadow-sm">
                  <Card.Body>
                    <i className="bi bi-check-circle display-4 text-success mb-3"></i>
                    <h3 className="fw-bold">{stats.completed}</h3>
                    <p className="text-muted mb-0">Completed</p>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={3} sm={6} className="mb-4">
                <Card className="text-center border-0 shadow-sm">
                  <Card.Body>
                    <i className="bi bi-clock-history display-4 text-warning mb-3"></i>
                    <h3 className="fw-bold">{stats.inProgress}</h3>
                    <p className="text-muted mb-0">In Progress</p>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={3} sm={6} className="mb-4">
                <Card className="text-center border-0 shadow-sm">
                  <Card.Body>
                    <i className="bi bi-award display-4 text-info mb-3"></i>
                    <h3 className="fw-bold">{stats.certificates}</h3>
                    <p className="text-muted mb-0">Certificates</p>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            {/* Enrolled Courses */}
            <Row className="mb-5">
              <Col>
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h3 className="fw-bold">My Courses</h3>
                  <LinkContainer to="/courses">
                    <Button 
                      className="rounded-pill px-4 py-2 shadow-sm"
                      style={{
                        background: 'linear-gradient(45deg, #007bff, #0056b3)',
                        border: 'none',
                        fontWeight: '600',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      <i className="bi bi-search me-2"></i>
                      Browse Courses
                    </Button>
                  </LinkContainer>
                </div>

                {enrolledCourses.length > 0 ? (
                  <Row>
                    {enrolledCourses.map((enrollment) => (
                      <Col lg={4} md={6} className="mb-4" key={enrollment._id}>
                        <Card className="h-100 shadow-sm border-0">
                          <div className="course-image-container">
                            <CourseBanner 
                              category={enrollment.course.category} 
                              title={enrollment.course.title}
                              size="default"
                            />
                          </div>
                          <Card.Body className="d-flex flex-column">
                            <div className="mb-auto">
                              <Badge bg="primary" className="mb-2">
                                {enrollment.course.category}
                              </Badge>
                              <Card.Title className="h6 mb-2">
                                {enrollment.course.title}
                              </Card.Title>
                              <div className="mb-3">
                                <div className="d-flex justify-content-between mb-1">
                                  <small className="text-muted">Progress</small>
                                  <small className="text-muted">
                                    {enrollment.progress || 0}%
                                  </small>
                                </div>
                                <ProgressBar 
                                  now={enrollment.progress || 0} 
                                  variant={getProgressVariant(enrollment.progress || 0)}
                                  className="mb-2"
                                />
                              </div>
                              <small className="text-muted d-block mb-2">
                                <i className="bi bi-calendar me-1"></i>
                                Enrolled: {new Date(enrollment.enrolledAt).toLocaleDateString()}
                              </small>
                              {enrollment.certificateEarned && (
                                <Badge bg="success" className="mb-2">
                                  <i className="bi bi-award me-1"></i>
                                  Certificate Earned
                                </Badge>
                              )}
                            </div>
                            <div className="mt-auto">
                              <LinkContainer to={`/learn/${enrollment.course._id}`}>
                                <Button 
                                  className="w-100 rounded-pill py-2 shadow-sm"
                                  style={{
                                    background: 'linear-gradient(45deg, #007bff, #0056b3)',
                                    border: 'none',
                                    fontWeight: '600'
                                  }}
                                >
                                  <i className={`bi ${enrollment.progress === 0 ? 'bi-play-circle' : 'bi-arrow-right-circle'} me-2`}></i>
                                  {enrollment.progress === 0 ? 'Start Learning' : 'Continue Learning'}
                                </Button>
                              </LinkContainer>
                            </div>
                          </Card.Body>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                ) : (
                  <Card className="text-center py-5">
                    <Card.Body>
                      <i className="bi bi-book display-4 text-muted mb-3"></i>
                      <h5 className="text-muted">No courses enrolled yet</h5>
                      <p className="text-muted">Start your learning journey by enrolling in a course</p>
                      <LinkContainer to="/courses">
                        <Button 
                          className="rounded-pill px-4 py-3 shadow-sm"
                          style={{
                            background: 'linear-gradient(45deg, #007bff, #0056b3)',
                            border: 'none',
                            fontWeight: '600',
                            fontSize: '1.1rem'
                          }}
                        >
                          <i className="bi bi-search me-2"></i>
                          Browse Courses
                        </Button>
                      </LinkContainer>
                    </Card.Body>
                  </Card>
                )}
              </Col>
            </Row>
          </>
        )}

        {/* Instructor/Admin Section */}
        {isInstructor() && (
          <Tabs defaultActiveKey="courses" className="mb-4">
            <Tab eventKey="courses" title="My Courses">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="fw-bold">Instructor Dashboard</h4>
                <LinkContainer to="/create-course">
                  <Button 
                    className="rounded-pill px-4 py-2 shadow-sm"
                    style={{
                      background: 'linear-gradient(45deg, #28a745, #1e7e34)',
                      border: 'none',
                      fontWeight: '600',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <i className="bi bi-plus-circle me-2"></i>
                    Create New Course
                  </Button>
                </LinkContainer>
              </div>

              {instructorCourses.length > 0 ? (
                <Row>
                  {instructorCourses.map((course) => (
                    <Col lg={4} md={6} className="mb-4" key={course._id}>
                      <Card className="h-100 shadow-sm border-0">
                        <div className="course-image-container">
                          <CourseBanner 
                            category={course.category} 
                            title={course.title}
                            size="default"
                          />
                        </div>
                        <Card.Body>
                          <Badge bg="primary" className="mb-2">{course.category}</Badge>
                          <Card.Title className="h6 mb-2">{course.title}</Card.Title>
                          <div className="course-stats mb-3">
                            <small className="text-muted d-block">
                              <i className="bi bi-people me-1"></i>
                              {course.studentsEnrolled || 0} students enrolled
                            </small>
                            <small className="text-muted d-block">
                              <i className="bi bi-star me-1"></i>
                              Rating: {course.rating || 'No ratings'}
                            </small>
                            <small className="text-muted d-block">
                              <i className="bi bi-currency-dollar me-1"></i>
                              Price: ${course.price}
                            </small>
                          </div>
                          <div className="d-flex gap-2">
                            <LinkContainer to={`/course/${course._id}`}>
                              <Button 
                                size="sm" 
                                className="flex-fill rounded-pill me-1"
                                style={{
                                  background: 'linear-gradient(45deg, #007bff, #0056b3)',
                                  border: 'none',
                                  color: 'white',
                                  fontWeight: '500'
                                }}
                              >
                                <i className="bi bi-pencil-square me-1"></i>
                                Edit
                              </Button>
                            </LinkContainer>
                            <Button 
                              size="sm" 
                              className="flex-fill rounded-pill ms-1"
                              style={{
                                background: 'linear-gradient(45deg, #17a2b8, #138496)',
                                border: 'none',
                                color: 'white',
                                fontWeight: '500'
                              }}
                            >
                              <i className="bi bi-graph-up me-1"></i>
                              Analytics
                            </Button>
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                  ))}
                </Row>
              ) : (
                <Card className="text-center py-5">
                  <Card.Body>
                    <i className="bi bi-mortarboard display-4 text-muted mb-3"></i>
                    <h5 className="text-muted">No courses created yet</h5>
                    <p className="text-muted">Start teaching by creating your first course</p>
                    <LinkContainer to="/create-course">
                      <Button 
                        className="rounded-pill px-4 py-3 shadow-sm"
                        style={{
                          background: 'linear-gradient(45deg, #28a745, #1e7e34)',
                          border: 'none',
                          fontWeight: '600',
                          fontSize: '1.1rem'
                        }}
                      >
                        <i className="bi bi-plus-circle me-2"></i>
                        Create Your First Course
                      </Button>
                    </LinkContainer>
                  </Card.Body>
                </Card>
              )}
            </Tab>

            {isAdmin() && (
              <Tab eventKey="admin" title="Admin Panel">
                <Row>
                  <Col md={4} className="mb-4">
                    <Card className="text-center border-0 shadow-sm">
                      <Card.Body>
                        <i className="bi bi-people display-4 text-primary mb-3"></i>
                        <h4>Manage Users</h4>
                        <p className="text-muted">View and manage all users</p>
                        <LinkContainer to="/admin">
                          <Button 
                            className="rounded-pill px-4 py-2 shadow-sm"
                            style={{
                              background: 'linear-gradient(45deg, #007bff, #0056b3)',
                              border: 'none',
                              fontWeight: '600'
                            }}
                          >
                            <i className="bi bi-gear me-2"></i>
                            Go to Admin Panel
                          </Button>
                        </LinkContainer>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col md={4} className="mb-4">
                    <Card className="text-center border-0 shadow-sm">
                      <Card.Body>
                        <i className="bi bi-graph-up display-4 text-success mb-3"></i>
                        <h4>Analytics</h4>
                        <p className="text-muted">View platform analytics</p>
                        <Button 
                          className="rounded-pill px-4 py-2 shadow-sm"
                          style={{
                            background: 'linear-gradient(45deg, #28a745, #1e7e34)',
                            border: 'none',
                            fontWeight: '600'
                          }}
                        >
                          <i className="bi bi-graph-up me-2"></i>
                          View Analytics
                        </Button>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col md={4} className="mb-4">
                    <Card className="text-center border-0 shadow-sm">
                      <Card.Body>
                        <i className="bi bi-gear display-4 text-warning mb-3"></i>
                        <h4>Settings</h4>
                        <p className="text-muted">Manage platform settings</p>
                        <Button 
                          className="rounded-pill px-4 py-2 shadow-sm"
                          style={{
                            background: 'linear-gradient(45deg, #ffc107, #e0a800)',
                            border: 'none',
                            color: '#212529',
                            fontWeight: '600'
                          }}
                        >
                          <i className="bi bi-sliders me-2"></i>
                          Manage Settings
                        </Button>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              </Tab>
            )}
          </Tabs>
        )}

        {/* Quick Actions */}
        <Row>
          <Col>
            <Card className="border-0 shadow-sm" style={{ borderRadius: '16px', background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)' }}>
              <Card.Body className="text-center p-4">
                <h5 className="fw-bold mb-4" style={{ color: '#2c3e50' }}>Quick Actions</h5>
                <div className="d-flex gap-3 justify-content-center flex-wrap">
                  <LinkContainer to="/courses">
                    <Button 
                      className="rounded-pill px-4 py-2 shadow-sm"
                      style={{
                        background: 'linear-gradient(45deg, #007bff, #0056b3)',
                        border: 'none',
                        fontWeight: '600',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      <i className="bi bi-search me-2"></i>
                      Browse Courses
                    </Button>
                  </LinkContainer>
                  <LinkContainer to="/profile">
                    <Button 
                      className="rounded-pill px-4 py-2 shadow-sm"
                      style={{
                        background: 'linear-gradient(45deg, #17a2b8, #138496)',
                        border: 'none',
                        color: 'white',
                        fontWeight: '600',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      <i className="bi bi-person-gear me-2"></i>
                      Update Profile
                    </Button>
                  </LinkContainer>
                  {user?.role === 'student' && (
                    <>
                      <Button 
                        className="rounded-pill px-4 py-2 shadow-sm"
                        style={{
                          background: 'linear-gradient(45deg, #28a745, #1e7e34)',
                          border: 'none',
                          color: 'white',
                          fontWeight: '600',
                          transition: 'all 0.3s ease'
                        }}
                      >
                        <i className="bi bi-award me-2"></i>
                        View Certificates
                      </Button>
                      <Button 
                        className="rounded-pill px-4 py-2 shadow-sm"
                        style={{
                          background: 'linear-gradient(45deg, #ffc107, #e0a800)',
                          border: 'none',
                          color: '#212529',
                          fontWeight: '600',
                          transition: 'all 0.3s ease'
                        }}
                      >
                        <i className="bi bi-question-circle me-2"></i>
                        Get Help
                      </Button>
                    </>
                  )}
                  {isInstructor() && (
                    <>
                      <LinkContainer to="/create-course">
                        <Button 
                          className="rounded-pill px-4 py-2 shadow-sm"
                          style={{
                            background: 'linear-gradient(45deg, #28a745, #1e7e34)',
                            border: 'none',
                            color: 'white',
                            fontWeight: '600',
                            transition: 'all 0.3s ease'
                          }}
                        >
                          <i className="bi bi-plus-circle me-2"></i>
                          Create Course
                        </Button>
                      </LinkContainer>
                      <Button 
                        className="rounded-pill px-4 py-2 shadow-sm"
                        style={{
                          background: 'linear-gradient(45deg, #6f42c1, #5a32a3)',
                          border: 'none',
                          color: 'white',
                          fontWeight: '600',
                          transition: 'all 0.3s ease'
                        }}
                      >
                        <i className="bi bi-graph-up me-2"></i>
                        View Analytics
                      </Button>
                    </>
                  )}
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Dashboard;