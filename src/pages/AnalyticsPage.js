import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Button, Badge, Alert, Spinner } from 'react-bootstrap';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { useAuth } from '../contexts/AuthContext';
import { analyticsAPI } from '../services/api';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const AnalyticsPage = () => {
  const { isInstructor, isAdmin } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      let response;
      
      if (isAdmin()) {
        response = await analyticsAPI.getAdminAnalytics();
      } else if (isInstructor()) {
        response = await analyticsAPI.getInstructorAnalytics();
      }

      if (response && response.success) {
        setAnalytics(response.data);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  }, [isAdmin, isInstructor]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const getMonthName = (month) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                   'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[month - 1];
  };

  const getEnrollmentChartData = () => {
    if (!analytics?.enrollmentsByMonth || analytics.enrollmentsByMonth.length === 0) {
      return null;
    }

    const labels = analytics.enrollmentsByMonth.map(item => 
      `${getMonthName(item._id.month)} ${item._id.year}`
    );
    const data = analytics.enrollmentsByMonth.map(item => item.count);

    return {
      labels,
      datasets: [
        {
          label: 'Enrollments',
          data,
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          tension: 0.1,
        },
      ],
    };
  };

  const getRevenueByCategory = () => {
    if (!analytics?.revenueByCategory || Object.keys(analytics.revenueByCategory).length === 0) {
      return null;
    }

    const labels = Object.keys(analytics.revenueByCategory);
    const data = Object.values(analytics.revenueByCategory);
    const colors = [
      'rgba(255, 99, 132, 0.8)',
      'rgba(54, 162, 235, 0.8)',
      'rgba(255, 205, 86, 0.8)',
      'rgba(75, 192, 192, 0.8)',
      'rgba(153, 102, 255, 0.8)',
      'rgba(255, 159, 64, 0.8)',
    ];

    return {
      labels,
      datasets: [
        {
          data,
          backgroundColor: colors.slice(0, labels.length),
          borderColor: colors.slice(0, labels.length).map(color => color.replace('0.8', '1')),
          borderWidth: 1,
        },
      ],
    };
  };

  if (loading) {
    return (
      <Container className="py-5">
        <div className="text-center">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3 text-muted">Loading analytics...</p>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger" className="text-center">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error}
          <div className="mt-3">
            <Button variant="outline-danger" onClick={fetchAnalytics}>
              Try Again
            </Button>
          </div>
        </Alert>
      </Container>
    );
  }

  if (!isInstructor() && !isAdmin()) {
    return (
      <Container className="py-5">
        <Alert variant="warning" className="text-center">
          <i className="bi bi-shield-exclamation me-2"></i>
          Access denied. Analytics are only available for instructors and administrators.
        </Alert>
      </Container>
    );
  }

  return (
    <div className="analytics-page py-5">
      <Container>
        {/* Header */}
        <Row className="mb-4">
          <Col>
            <h1 className="fw-bold">
              <i className="bi bi-graph-up me-3"></i>
              Analytics Dashboard
            </h1>
            <p className="text-muted lead">
              {isAdmin() ? 'Platform overview and insights' : 'Your course performance and student engagement'}
            </p>
          </Col>
        </Row>

        {analytics && (
          <>
            {/* Overview Cards */}
            <Row className="mb-5">
              <Col md={3} sm={6} className="mb-4">
                <Card className="text-center border-0 shadow-sm h-100">
                  <Card.Body>
                    <i className="bi bi-book-half display-4 text-primary mb-3"></i>
                    <h3 className="fw-bold">{analytics.overview.totalCourses}</h3>
                    <p className="text-muted mb-0">
                      {isAdmin() ? 'Total Courses' : 'Your Courses'}
                    </p>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={3} sm={6} className="mb-4">
                <Card className="text-center border-0 shadow-sm h-100">
                  <Card.Body>
                    <i className="bi bi-people display-4 text-success mb-3"></i>
                    <h3 className="fw-bold">{analytics.overview.totalStudentsEnrolled}</h3>
                    <p className="text-muted mb-0">Students Enrolled</p>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={3} sm={6} className="mb-4">
                <Card className="text-center border-0 shadow-sm h-100">
                  <Card.Body>
                    <i className="bi bi-currency-dollar display-4 text-warning mb-3"></i>
                    <h3 className="fw-bold">${analytics.overview.totalRevenue.toLocaleString()}</h3>
                    <p className="text-muted mb-0">Total Revenue</p>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={3} sm={6} className="mb-4">
                <Card className="text-center border-0 shadow-sm h-100">
                  <Card.Body>
                    <i className="bi bi-star-fill display-4 text-info mb-3"></i>
                    <h3 className="fw-bold">{analytics.overview.averageRating?.toFixed(1) || '0.0'}</h3>
                    <p className="text-muted mb-0">Average Rating</p>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            <Row className="mb-5">
              {/* Enrollment Trend */}
              <Col lg={8} className="mb-4">
                <Card className="border-0 shadow-sm h-100">
                  <Card.Header className="bg-light">
                    <h5 className="mb-0">
                      <i className="bi bi-graph-up me-2"></i>
                      Enrollment Trend
                    </h5>
                  </Card.Header>
                  <Card.Body>
                    {getEnrollmentChartData() ? (
                      <Line 
                        data={getEnrollmentChartData()} 
                        options={{
                          responsive: true,
                          plugins: {
                            legend: {
                              position: 'top',
                            },
                            title: {
                              display: true,
                              text: 'Monthly Enrollments Over Time',
                            },
                          },
                        }}
                      />
                    ) : (
                      <div className="text-center py-5">
                        <i className="bi bi-graph-up display-4 text-muted mb-3"></i>
                        <p className="text-muted">No enrollment data available</p>
                      </div>
                    )}
                  </Card.Body>
                </Card>
              </Col>

              {/* Revenue by Category */}
              <Col lg={4} className="mb-4">
                <Card className="border-0 shadow-sm h-100">
                  <Card.Header className="bg-light">
                    <h5 className="mb-0">
                      <i className="bi bi-pie-chart me-2"></i>
                      Revenue by Category
                    </h5>
                  </Card.Header>
                  <Card.Body>
                    {getRevenueByCategory() ? (
                      <Doughnut 
                        data={getRevenueByCategory()}
                        options={{
                          responsive: true,
                          plugins: {
                            legend: {
                              position: 'bottom',
                            },
                          },
                        }}
                      />
                    ) : (
                      <div className="text-center py-5">
                        <i className="bi bi-pie-chart display-4 text-muted mb-3"></i>
                        <p className="text-muted">No revenue data available</p>
                      </div>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            {/* Course Performance Table */}
            {analytics.completionStats && analytics.completionStats.length > 0 && (
              <Row className="mb-5">
                <Col>
                  <Card className="border-0 shadow-sm">
                    <Card.Header className="bg-light">
                      <h5 className="mb-0">
                        <i className="bi bi-bar-chart me-2"></i>
                        Course Performance
                      </h5>
                    </Card.Header>
                    <Card.Body className="p-0">
                      <div className="table-responsive">
                        <table className="table table-hover mb-0">
                          <thead className="table-light">
                            <tr>
                              <th>Course</th>
                              <th>Enrollments</th>
                              <th>Completed</th>
                              <th>Completion Rate</th>
                              <th>Avg. Progress</th>
                            </tr>
                          </thead>
                          <tbody>
                            {analytics.completionStats.map((course, index) => (
                              <tr key={index}>
                                <td>
                                  <strong>{course.courseTitle}</strong>
                                </td>
                                <td>{course.totalEnrollments}</td>
                                <td>{course.completedEnrollments}</td>
                                <td>
                                  <Badge 
                                    bg={course.completionRate >= 80 ? 'success' : 
                                        course.completionRate >= 60 ? 'warning' : 'danger'}
                                  >
                                    {course.completionRate.toFixed(1)}%
                                  </Badge>
                                </td>
                                <td>{course.averageProgress}%</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            )}

            {/* Top Courses */}
            {analytics.topCourses && analytics.topCourses.length > 0 && (
              <Row className="mb-5">
                <Col>
                  <Card className="border-0 shadow-sm">
                    <Card.Header className="bg-light">
                      <h5 className="mb-0">
                        <i className="bi bi-trophy me-2"></i>
                        Top Performing Courses
                      </h5>
                    </Card.Header>
                    <Card.Body>
                      <Row>
                        {analytics.topCourses.map((course, index) => (
                          <Col lg={4} md={6} className="mb-3" key={course.id}>
                            <Card className="border-0 bg-light h-100">
                              <Card.Body>
                                <div className="d-flex justify-content-between align-items-start mb-2">
                                  <Badge bg="primary">#{index + 1}</Badge>
                                  <div className="text-end">
                                    <div className="fw-bold text-success">
                                      ${course.revenue.toLocaleString()}
                                    </div>
                                    <small className="text-muted">Revenue</small>
                                  </div>
                                </div>
                                <h6 className="fw-bold mb-2">{course.title}</h6>
                                <div className="d-flex justify-content-between text-sm">
                                  <span>{course.studentsEnrolled} students</span>
                                  <span>⭐ {course.rating.toFixed(1)}</span>
                                </div>
                              </Card.Body>
                            </Card>
                          </Col>
                        ))}
                      </Row>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            )}
          </>
        )}
      </Container>
    </div>
  );
};

export default AnalyticsPage;