import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const SimpleHome = () => {
  const navigate = useNavigate();

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section bg-primary text-white py-5">
        <Container>
          <Row className="align-items-center" style={{ minHeight: '400px' }}>
            <Col lg={6}>
              <h1 className="display-4 fw-bold mb-4">
                Transform Your Future with 
                <span className="text-warning"> EduLearn</span>
              </h1>
              <p className="lead mb-4">
                Discover world-class courses from expert instructors. Learn at your own pace 
                and unlock new opportunities in your career.
              </p>
              <div className="d-flex gap-3">
                <button
                  type="button"
                  className="btn btn-warning btn-lg"
                  style={{ minWidth: 180, position: 'relative', zIndex: 2 }}
                  onClick={() => navigate('/courses')}
                >
                  Explore Courses
                </button>
                <Button 
                  variant="outline-light" 
                  size="lg"
                  onClick={() => navigate('/register')}
                  style={{ position: 'relative', zIndex: 2 }}
                >
                  Get Started Free
                </Button>
              </div>
            </Col>
            <Col lg={6} className="text-center">
              <div className="bg-light bg-opacity-10 rounded-3 p-5" style={{ pointerEvents: 'none' }}>
                <i className="bi bi-mortarboard display-1 text-warning"></i>
                <h3 className="mt-3">Start Learning Today</h3>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Features Section */}
      <section className="py-5">
        <Container>
          <Row>
            <Col className="text-center mb-5">
              <h2 className="fw-bold">Why Choose EduLearn?</h2>
              <p className="text-muted lead">Everything you need for your learning journey</p>
            </Col>
          </Row>
          <Row>
            <Col md={4} className="mb-4">
              <Card className="text-center h-100 border-0 shadow-sm">
                <Card.Body className="p-4">
                  <i className="bi bi-play-circle display-4 text-primary mb-3"></i>
                  <h5>Interactive Learning</h5>
                  <p className="text-muted">Engage with dynamic content and hands-on exercises</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4} className="mb-4">
              <Card className="text-center h-100 border-0 shadow-sm">
                <Card.Body className="p-4">
                  <i className="bi bi-people display-4 text-success mb-3"></i>
                  <h5>Expert Instructors</h5>
                  <p className="text-muted">Learn from industry professionals and subject matter experts</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4} className="mb-4">
              <Card className="text-center h-100 border-0 shadow-sm">
                <Card.Body className="p-4">
                  <i className="bi bi-award display-4 text-warning mb-3"></i>
                  <h5>Certificates</h5>
                  <p className="text-muted">Earn recognized certificates upon course completion</p>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>
    </div>
  );
};

export default SimpleHome;