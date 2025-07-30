import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Button, Badge, ProgressBar, Alert, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { certificateAPI } from '../services/api';
import { generateCertificate, downloadCertificate } from '../utils/certificateGenerator';

const DashboardPage = () => {
  const { user, isInstructor, isAdmin, isAuthenticated } = useAuth();
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [instructorCourses, setInstructorCourses] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [stats, setStats] = useState({
    totalEnrolled: 0,
    completed: 0,
    inProgress: 0,
    certificates: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloadingCert, setDownloadingCert] = useState(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication required');
        return;
      }

      const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://edulearn-9aygc.ondigitalocean.app';

      // Fetch enrolled courses for students
      if (user?.role === 'student') {
        try {
          const response = await fetch(`${API_BASE_URL}/api/enrollments/user`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
          
          if (response.ok) {
            const data = await response.json();
            if (data.success) {
              // Map courseId to course for consistency
              const enrollmentsWithCourse = (data.data || []).map(enrollment => ({
                ...enrollment,
                course: enrollment.courseId || enrollment.course
              }));
              setEnrolledCourses(enrollmentsWithCourse);
              calculateStats(enrollmentsWithCourse);
            }
          }
        } catch (error) {
          console.error('Error fetching enrolled courses:', error);
        }
      }
      
      // Fetch instructor courses
      if (isInstructor()) {
        try {
          console.log('=== FRONTEND DEBUG ===');
          console.log('User is instructor, fetching courses...');
          console.log('User object:', user);
          console.log('Token:', token);
          
          const response = await fetch(`${API_BASE_URL}/api/courses/instructor`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
          console.log('Instructor courses fetch response status:', response.status);
          console.log('Instructor courses fetch response:', response);
          
          let data = null;
          try {
            data = await response.clone().json();
            console.log('Instructor courses fetch data:', data);
          } catch (jsonErr) {
            console.error('Error parsing instructor courses response as JSON:', jsonErr);
          }
          
          if (response.ok && data && data.success) {
            console.log('Setting instructor courses:', data.data);
              setInstructorCourses(data.data || []);
          } else {
            console.error('Instructor courses fetch error:', data);
            setError('Failed to load instructor courses');
          }
          console.log('=== END FRONTEND DEBUG ===');
        } catch (error) {
          console.error('Error fetching instructor courses:', error);
          setError('Failed to load instructor courses');
        }
      }
      
      // Fetch user certificates (for students)
      if (user?.role === 'student') {
        try {
          const response = await certificateAPI.getUserCertificates();
          if (response.success) {
            setCertificates(response.data || []);
          }
        } catch (error) {
          console.error('Error fetching certificates:', error);
        }
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, [user, isInstructor]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchDashboardData();
    }
  }, [isAuthenticated, fetchDashboardData]);

  const calculateStats = (courses) => {
    const totalEnrolled = courses.length;
    const completed = courses.filter(c => c.completionStatus === 'completed' || c.progress >= 100).length;
    const inProgress = courses.filter(c => c.completionStatus === 'in_progress' || (c.progress > 0 && c.progress < 100)).length;
    const certificates = courses.filter(c => c.certificate?.issued).length;
    
    setStats({ totalEnrolled, completed, inProgress, certificates });
  };

  const handleDownloadCertificate = async (certificate) => {
    try {
      setDownloadingCert(certificate.certificateId);
      
      // Generate certificate canvas
      const canvas = generateCertificate(
        user.name,
        certificate.courseName,
        certificate.instructorName,
        new Date(certificate.issuedAt).toLocaleDateString(),
        certificate.certificateId
      );
      
      // Download certificate
      const fileName = `Certificate_${certificate.courseName.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().getFullYear()}.png`;
      downloadCertificate(canvas, fileName);
      
    } catch (error) {
      console.error('Error downloading certificate:', error);
    } finally {
      setDownloadingCert(null);
    }
  };

  const getProgressVariant = (progress) => {
    if (progress >= 100) return 'success';
    if (progress >= 50) return 'info';
    if (progress >= 25) return 'warning';
    return 'danger';
  };

  const CourseBanner = ({ category, title }) => {
    const colors = {
      'Programming': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'Data Science': 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      'Design': 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      'Business': 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      'Language': 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      'Other': 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)'
    };

    const bgColor = colors[category] || colors['Other'];

    return (
      <div 
        style={{
          background: bgColor,
          padding: '1rem',
          height: '120px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          textAlign: 'center',
          borderRadius: '8px 8px 0 0'
        }}
      >
        <h6 style={{ 
          margin: 0, 
          fontSize: '0.9rem', 
          fontWeight: 600, 
          color: 'white'
        }}>
          {title.length > 40 ? title.substring(0, 40) + '...' : title}
        </h6>
      </div>
    );
  };

  if (!isAuthenticated) {
    return (
      <Container className="py-5">
        <Alert variant="warning" className="text-center">
          <h4>Authentication Required</h4>
          <p>Please log in to access your dashboard.</p>
          <Link to="/login" className="btn btn-primary">Go to Login</Link>
        </Alert>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container className="py-5">
        <div className="text-center">
          <Spinner animation="border" variant="primary" />
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

        {error && (
          <Alert variant="danger" className="mb-4">
            <i className="bi bi-exclamation-triangle me-2"></i>
            {error}
            <Button 
              variant="outline-danger" 
              size="sm" 
              className="ms-2"
              onClick={fetchDashboardData}
            >
              Retry
            </Button>
          </Alert>
        )}

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
                  <Link to="/courses" className="btn btn-primary">
                    <i className="bi bi-plus-circle me-2"></i>
                    Browse Courses
                  </Link>
                </div>

                {enrolledCourses.length > 0 ? (
                  <Row>
                    {enrolledCourses.map((enrollment) => (
                      <Col lg={4} md={6} className="mb-4" key={enrollment._id}>
                        <Card className="h-100 shadow-sm border-0">
                          <CourseBanner 
                            category={enrollment.course?.category || 'Other'} 
                            title={enrollment.course?.title || 'Course Title'}
                          />
                          <Card.Body className="d-flex flex-column">
                            <div className="mb-auto">
                              <Badge bg="primary" className="mb-2">
                                {enrollment.course?.category || 'General'}
                              </Badge>
                              <Card.Title className="h6 mb-2">
                                {enrollment.course?.title || 'Course Title'}
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
                                <div className="d-flex justify-content-between">
                                  <small className="text-muted">Status</small>
                                  <Badge 
                                    bg={
                                      enrollment.completionStatus === 'completed' ? 'success' :
                                      enrollment.completionStatus === 'in_progress' ? 'primary' : 'secondary'
                                    }
                                    className="text-capitalize"
                                  >
                                    {enrollment.completionStatus === 'not_started' ? 'Not Started' :
                                     enrollment.completionStatus === 'in_progress' ? 'In Progress' : 'Completed'}
                                  </Badge>
                                </div>
                              </div>
                              <small className="text-muted d-block mb-2">
                                <i className="bi bi-calendar me-1"></i>
                                Enrolled: {new Date(enrollment.enrollmentDate || enrollment.enrolledAt).toLocaleDateString()}
                              </small>
                              {enrollment.lastAccessed && (
                                <small className="text-muted d-block mb-2">
                                  <i className="bi bi-clock me-1"></i>
                                  Last accessed: {new Date(enrollment.lastAccessed).toLocaleDateString()}
                                </small>
                              )}
                              {enrollment.certificate?.issued && (
                                <Badge bg="success" className="mb-2">
                                  <i className="bi bi-award me-1"></i>
                                  Certificate Earned
                                </Badge>
                              )}
                            </div>
                            <div className="mt-auto">
                              <Link 
                                to={`/learn/${enrollment.course?._id}`} 
                                className={`btn w-100 ${
                                  enrollment.completionStatus === 'completed' ? 'btn-success' : 'btn-primary'
                                }`}
                              >
                                {enrollment.completionStatus === 'completed' ? 'Review Course' :
                                 enrollment.completionStatus === 'in_progress' ? 'Continue Learning' : 'Start Learning'}
                              </Link>
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
                      <Link to="/courses" className="btn btn-primary">Browse Courses</Link>
                    </Card.Body>
                  </Card>
                )}
              </Col>
            </Row>

            {/* Certificates Section */}
            {certificates.length > 0 && (
              <Row className="mb-5">
                <Col>
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <h3 className="fw-bold">
                      <i className="bi bi-award me-2 text-warning"></i>
                      My Certificates
                    </h3>
                    <Badge bg="warning" text="dark" className="fs-6">
                      {certificates.length} Certificate{certificates.length !== 1 ? 's' : ''}
                    </Badge>
                  </div>

                  <Row>
                    {certificates.map((certificate) => (
                      <Col lg={4} md={6} className="mb-4" key={certificate.certificateId}>
                        <Card className="h-100 shadow-sm border-0 certificate-card">
                          <div className="bg-gradient bg-warning text-white p-3 text-center">
                            <i className="bi bi-award display-4 mb-2"></i>
                            <h6 className="mb-0 fw-bold">Certificate of Completion</h6>
                          </div>
                          <Card.Body className="d-flex flex-column">
                            <div className="mb-auto">
                              <Badge bg="success" className="mb-2">
                                {certificate.courseCategory}
                              </Badge>
                              <Card.Title className="h6 mb-3">
                                {certificate.courseName}
                              </Card.Title>
                              <div className="certificate-details">
                                <small className="text-muted d-block mb-1">
                                  <i className="bi bi-person me-1"></i>
                                  Instructor: {certificate.instructorName}
                                </small>
                                <small className="text-muted d-block mb-1">
                                  <i className="bi bi-calendar-check me-1"></i>
                                  Completed: {new Date(certificate.issuedAt).toLocaleDateString()}
                                </small>
                                <small className="text-muted d-block mb-3">
                                  <i className="bi bi-shield-check me-1"></i>
                                  ID: {certificate.certificateId.substring(0, 8)}...
                                </small>
                              </div>
                            </div>
                            <div className="d-flex gap-2">
                              <Button
                                variant="primary"
                                size="sm"
                                className="flex-fill"
                                onClick={() => handleDownloadCertificate(certificate)}
                                disabled={downloadingCert === certificate.certificateId}
                              >
                                {downloadingCert === certificate.certificateId ? (
                                  <>
                                    <Spinner size="sm" className="me-1" />
                                    Downloading...
                                  </>
                                ) : (
                                  <>
                                    <i className="bi bi-download me-1"></i>
                                    Download
                                  </>
                                )}
                              </Button>
                              <Link
                                to={`/course/${certificate.courseId}`}
                                className="btn btn-outline-primary btn-sm flex-fill"
                              >
                                <i className="bi bi-eye me-1"></i>
                                View Course
                              </Link>
                            </div>
                          </Card.Body>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                </Col>
              </Row>
            )}
          </>
        )}

        {/* Instructor/Admin Section */}
        {isInstructor() && (
          <Row className="mb-5">
            <Col>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="fw-bold">Instructor Dashboard</h4>
                <Link to="/create-course" className="btn btn-success">
                  <i className="bi bi-plus-circle me-2"></i>
                  Create New Course
                </Link>
              </div>

              {instructorCourses.length > 0 ? (
                <Row>
                  {instructorCourses.map((course) => (
                    <Col lg={4} md={6} className="mb-4" key={course._id}>
                      <Card className="h-100 shadow-sm border-0">
                        <CourseBanner 
                          category={course.category} 
                          title={course.title}
                        />
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
                            <Link 
                              to={`/course/${course._id}`} 
                              className="btn btn-outline-primary btn-sm flex-fill"
                            >
                              Edit Course
                            </Link>
                            <Link 
                              to="/analytics" 
                              className="btn btn-outline-info btn-sm flex-fill"
                            >
                              Analytics
                            </Link>
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
                    <Link to="/create-course" className="btn btn-success">Create Your First Course</Link>
                  </Card.Body>
                </Card>
              )}
            </Col>
          </Row>
        )}

        {/* Admin Panel Link */}
        {isAdmin() && (
          <Row className="mb-5">
            <Col>
              <Card className="border-0 shadow-sm bg-primary text-white">
                <Card.Body className="text-center p-4">
                  <i className="bi bi-gear display-4 mb-3"></i>
                  <h4>Admin Panel</h4>
                  <p className="mb-3">Manage users, courses, and platform settings</p>
                  <Link to="/admin" className="btn btn-warning btn-lg">
                    Go to Admin Panel
                  </Link>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        )}

        {/* Quick Actions */}
        <Row>
          <Col>
            <Card className="border-0 bg-light">
              <Card.Body className="text-center p-4">
                <h5 className="fw-bold mb-3">Quick Actions</h5>
                <div className="d-flex gap-3 justify-content-center flex-wrap">
                  <Link to="/courses" className="btn btn-outline-primary">
                    <i className="bi bi-search me-2"></i>
                    Browse Courses
                  </Link>
                  <Button variant="outline-info">
                    <i className="bi bi-person me-2"></i>
                    Update Profile
                  </Button>
                  <Button variant="outline-success">
                    <i className="bi bi-award me-2"></i>
                    View Certificates
                  </Button>
                  <Button variant="outline-warning">
                    <i className="bi bi-question-circle me-2"></i>
                    Get Help
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default DashboardPage;