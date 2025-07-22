import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import { coursesAPI } from '../services/api';
import CourseBanner from '../components/CourseBanner';

const Home = () => {
  const { isAuthenticated } = useAuth();
  const [featuredCourses, setFeaturedCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  const categories = [
    { name: 'Programming', icon: 'bi-code-slash', description: 'Learn to code in various programming languages and frameworks.' },
    { name: 'Data Science', icon: 'bi-graph-up', description: 'Master data analysis, machine learning, and AI technologies.' },
    { name: 'Design', icon: 'bi-palette', description: 'Create stunning visuals and user experiences.' },
    { name: 'Business', icon: 'bi-briefcase', description: 'Develop essential business and entrepreneurship skills.' },
    { name: 'Language', icon: 'bi-translate', description: 'Learn new languages and improve communication skills.' },
    { name: 'Other', icon: 'bi-book', description: 'Explore diverse topics and expand your knowledge.' }
  ];

  useEffect(() => {
    fetchFeaturedCourses();
  }, []);

  const fetchFeaturedCourses = async () => {
    try {
      const response = await coursesAPI.getCourses();
      if (response.success) {
        setFeaturedCourses(response.data.slice(0, 6));
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section bg-primary text-white py-5">
        <Container>
          <Row className="align-items-center min-vh-50">
            <Col lg={6}>
              <h1 className="display-4 fw-bold mb-4">
                Transform Your Future with 
                <span className="text-warning"> EduLearn</span>
              </h1>
              <p className="lead mb-4">
                Discover world-class courses from expert instructors. Learn at your own pace 
                and unlock new opportunities in your career.
              </p>
              <div className="d-flex gap-3 flex-wrap">
                <LinkContainer to="/courses">
                  <Button variant="warning" size="lg" className="px-4">
                    <i className="bi bi-play-circle me-2"></i>
                    Explore Courses
                  </Button>
                </LinkContainer>
                {!isAuthenticated && (
                  <LinkContainer to="/register">
                    <Button variant="outline-light" size="lg" className="px-4">
                      Get Started Free
                    </Button>
                  </LinkContainer>
                )}
              </div>
            </Col>
            <Col lg={6} className="text-center">
              <div className="hero-image-placeholder bg-light bg-opacity-10 rounded-3 p-5">
                <i className="bi bi-mortarboard display-1 text-warning"></i>
                <h3 className="mt-3">Start Learning Today</h3>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Stats Section */}
      <section className="stats-section py-5 bg-light">
        <Container>
          <Row className="text-center">
            <Col md={3} sm={6} className="mb-4">
              <div className="stat-item">
                <h2 className="display-5 fw-bold text-primary">1000+</h2>
                <p className="text-muted">Courses Available</p>
              </div>
            </Col>
            <Col md={3} sm={6} className="mb-4">
              <div className="stat-item">
                <h2 className="display-5 fw-bold text-primary">50K+</h2>
                <p className="text-muted">Students Enrolled</p>
              </div>
            </Col>
            <Col md={3} sm={6} className="mb-4">
              <div className="stat-item">
                <h2 className="display-5 fw-bold text-primary">200+</h2>
                <p className="text-muted">Expert Instructors</p>
              </div>
            </Col>
            <Col md={3} sm={6} className="mb-4">
              <div className="stat-item">
                <h2 className="display-5 fw-bold text-primary">95%</h2>
                <p className="text-muted">Success Rate</p>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Popular Categories */}
      <section className="categories-section py-5">
        <Container>
          <Row className="mb-5">
            <Col>
              <h2 className="text-center fw-bold mb-3">Popular Categories</h2>
              <p className="text-center text-muted lead">
                Explore our most popular course categories
              </p>
            </Col>
          </Row>
          <Row>
            {categories.map((category, index) => (
              <Col lg={4} md={6} className="mb-4" key={index}>
                <Card className="h-100 shadow-sm border-0 category-card">
                  <Card.Body className="text-center p-4">
                    <div className="category-icon mb-3">
                      <i className={`bi ${category.icon} display-4 text-primary`}></i>
                    </div>
                    <Card.Title className="h4 mb-3">{category.name}</Card.Title>
                    <Card.Text className="text-muted">
                      {category.description}
                    </Card.Text>
                    <LinkContainer to={`/courses?category=${category.name}`}>
                      <Button variant="outline-primary">
                        Explore Courses
                      </Button>
                    </LinkContainer>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* Featured Courses */}
      <section className="featured-courses py-5 bg-light">
        <Container>
          <Row className="mb-5">
            <Col>
              <h2 className="text-center fw-bold mb-3">Featured Courses</h2>
              <p className="text-center text-muted lead">
                Handpicked courses from our top instructors
              </p>
            </Col>
          </Row>
          {loading ? (
            <Row>
              <Col className="text-center">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </Col>
            </Row>
          ) : (
            <Row>
              {featuredCourses.map((course) => (
                <Col lg={4} md={6} className="mb-4" key={course._id}>
                  <Card className="h-100 shadow-sm border-0 course-card">
                    <div className="course-image-container">
                      <CourseBanner 
                        category={course.category} 
                        title={course.title}
                        size="default"
                      />
                    </div>
                    <Card.Body className="d-flex flex-column">
                      <div className="mb-auto">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <Badge bg="primary" className="mb-2">{course.category}</Badge>
                          <small className="text-muted">{course.duration}</small>
                        </div>
                        <Card.Title className="h5 mb-2">{course.title}</Card.Title>
                        <Card.Text className="text-muted small">
                          {course.description?.substring(0, 100)}...
                        </Card.Text>
                        <div className="course-meta mb-3">
                          <small className="text-muted">
                            <i className="bi bi-person me-1"></i>
                            By {typeof course.instructor === 'object' ? course.instructor.name : course.instructor}
                          </small>
                          <div className="mt-1">
                            <small>
                              <span style={{ color: '#ff9500' }}>{'★'.repeat(Math.round(course.rating || 0))}</span>
                              <span style={{ color: '#d3d3d3' }}>{'☆'.repeat(5 - Math.round(course.rating || 0))}</span>
                              <span className="ms-1" style={{ color: '#6c757d' }}>
                                ({course.rating ? course.rating.toFixed(1) : '0.0'}) · {course.totalRatings || 0} reviews
                              </span>
                            </small>
                          </div>
                        </div>
                      </div>
                      <div className="d-flex justify-content-between align-items-center mt-auto">
                        <h5 className="text-primary mb-0">${course.price}</h5>
                        <LinkContainer to={`/course/${course._id}`}>
                          <Button variant="primary" size="sm">
                            View Details
                          </Button>
                        </LinkContainer>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
          <Row>
            <Col className="text-center mt-4">
              <LinkContainer to="/courses">
                <Button variant="primary" size="lg">
                  View All Courses
                </Button>
              </LinkContainer>
            </Col>
          </Row>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="cta-section py-5 bg-primary text-white">
        <Container>
          <Row className="text-center">
            <Col>
              <h2 className="fw-bold mb-3">Ready to Start Learning?</h2>
              <p className="lead mb-4">
                Join thousands of students who are already learning with EduLearn
              </p>
              {!isAuthenticated ? (
                <div className="d-flex gap-3 justify-content-center flex-wrap">
                  <LinkContainer to="/register">
                    <Button variant="warning" size="lg" className="px-5">
                      Sign Up Now
                    </Button>
                  </LinkContainer>
                  <LinkContainer to="/courses">
                    <Button variant="outline-light" size="lg" className="px-5">
                      Browse Courses
                    </Button>
                  </LinkContainer>
                </div>
              ) : (
                <LinkContainer to="/courses">
                  <Button variant="warning" size="lg" className="px-5">
                    Continue Learning
                  </Button>
                </LinkContainer>
              )}
            </Col>
          </Row>
        </Container>
      </section>
    </div>
  );
};

export default Home;