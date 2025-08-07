import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Button, Form, Badge, Pagination, Spinner, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const CoursesPage = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    priceRange: '',
    difficulty: ''
  });

  const categories = ['Programming', 'Data Science', 'Design', 'Business', 'Language', 'Other'];
  const priceRanges = [
    { label: 'Free', value: '0-0' },
    { label: '$1 - $50', value: '1-50' },
    { label: '$51 - $100', value: '51-100' },
    { label: '$101 - $200', value: '101-200' },
    { label: '$200+', value: '200-999999' }
  ];
  const difficultyLevels = ['Beginner', 'Intermediate', 'Advanced'];

  const fetchCourses = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      // Convert filters to API format
      const apiParams = {
        page: currentPage,
        limit: 12,
        search: filters.search,
        category: filters.category,
        level: filters.difficulty
      };

      // Convert priceRange to minPrice and maxPrice
      if (filters.priceRange) {
        const [minPrice, maxPrice] = filters.priceRange.split('-').map(Number);
        apiParams.minPrice = minPrice;
        if (maxPrice !== 999999) { // Don't set maxPrice for "200+" range
          apiParams.maxPrice = maxPrice;
        }
      }

      // Remove empty values
      Object.keys(apiParams).forEach((key) => {
        if (!apiParams[key] && apiParams[key] !== 0) {
          delete apiParams[key];
        }
      });
      
      const queryParams = new URLSearchParams(apiParams);
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';
      
      const response = await fetch(`${API_BASE_URL}/api/courses?${queryParams}`);
      const data = await response.json();
      
      if (response.ok && data.success) {
        setCourses(data.data || []);
        setTotalPages(data.pagination?.totalPages || 1);
      } else {
        throw new Error(data.message || 'Failed to fetch courses');
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      setError('Failed to load courses. Please try again later.');
      setCourses([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, filters]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({ ...prev, [filterName]: value }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      category: '',
      priceRange: '',
      difficulty: ''
    });
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Course banner component
  const CourseBanner = ({ category, title }) => {
    const colors = {
      'Programming': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'Data Science': 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      'Design': 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      'Business': 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      'Language': 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      'Other': 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)'
    };

    const icons = {
      'Programming': 'bi-code-slash',
      'Data Science': 'bi-graph-up',
      'Design': 'bi-palette',
      'Business': 'bi-briefcase',
      'Language': 'bi-translate',
      'Other': 'bi-book'
    };

    const bgColor = colors[category] || colors['Other'];
    const icon = icons[category] || icons['Other'];

    return (
      <div 
        className="course-banner"
        style={{
          background: bgColor,
          padding: '1rem',
          height: '180px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          textAlign: 'center'
        }}
      >
        <i className={`bi ${icon}`} style={{ fontSize: '2rem', marginBottom: '0.5rem', opacity: 0.9 }}></i>
        <h6 style={{ 
          margin: 0, 
          fontSize: '0.9rem', 
          fontWeight: 600, 
          textShadow: '0 1px 2px rgba(0,0,0,0.2)',
          color: 'white'
        }}>
          {title.length > 50 ? title.substring(0, 50) + '...' : title}
        </h6>
        <small style={{ 
          opacity: 0.8, 
          marginTop: '0.25rem',
          color: 'rgba(255,255,255,0.9)'
        }}>
          {category}
        </small>
      </div>
    );
  };

  return (
    <div className="courses-page py-5">
      <Container>
        {/* Page Header */}
        <Row className="mb-5">
          <Col>
            <h1 className="text-center fw-bold mb-3">All Courses</h1>
            <p className="text-center text-muted lead">
              Discover our comprehensive collection of courses designed to help you achieve your goals
            </p>
          </Col>
        </Row>

        <Row>
          {/* Filters Sidebar */}
          <Col lg={3} className="mb-4">
            <Card className="border-0 shadow-sm">
              <Card.Header style={{
                background: 'linear-gradient(135deg, #007bff 0%, #0056b3 100%)',
                border: 'none',
                color: 'white'
              }}>
                <h5 className="mb-0" style={{ 
                  color: 'white',
                  textShadow: '1px 1px 2px rgba(0,0,0,0.3)',
                  fontWeight: 'bold'
                }}>
                  <i className="bi bi-funnel me-2" style={{ color: 'white' }}></i>
                  Filters
                </h5>
              </Card.Header>
              <Card.Body>
                {/* Search */}
                <div className="mb-4">
                  <Form.Label className="fw-semibold">Search</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Search courses..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                  />
                </div>

                {/* Category Filter */}
                <div className="mb-4">
                  <Form.Label className="fw-semibold">Category</Form.Label>
                  <Form.Select
                    value={filters.category}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                  >
                    <option value="">All Categories</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </Form.Select>
                </div>

                {/* Price Range Filter */}
                <div className="mb-4">
                  <Form.Label className="fw-semibold">Price Range</Form.Label>
                  <Form.Select
                    value={filters.priceRange}
                    onChange={(e) => handleFilterChange('priceRange', e.target.value)}
                  >
                    <option value="">All Prices</option>
                    {priceRanges.map(range => (
                      <option key={range.value} value={range.value}>{range.label}</option>
                    ))}
                  </Form.Select>
                </div>

                {/* Difficulty Filter */}
                <div className="mb-4">
                  <Form.Label className="fw-semibold">Difficulty</Form.Label>
                  <Form.Select
                    value={filters.difficulty}
                    onChange={(e) => handleFilterChange('difficulty', e.target.value)}
                  >
                    <option value="">All Levels</option>
                    {difficultyLevels.map(level => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </Form.Select>
                </div>

                {/* Clear Filters */}
                <Button 
                  variant="outline-secondary" 
                  className="w-100"
                  onClick={clearFilters}
                >
                  Clear All Filters
                </Button>
              </Card.Body>
            </Card>
          </Col>

          {/* Courses Grid */}
          <Col lg={9}>
            {/* Results Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div>
                <h5 className="mb-0">
                  {loading ? 'Loading...' : `Showing ${courses.length} courses`}
                </h5>
                {(filters.search || filters.category || filters.priceRange || filters.difficulty) && (
                  <small className="text-muted">Filtered results</small>
                )}
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <Alert variant="danger" className="mb-4">
                <i className="bi bi-exclamation-triangle me-2"></i>
                {error}
                <Button 
                  variant="outline-danger" 
                  size="sm" 
                  className="ms-2"
                  onClick={fetchCourses}
                >
                  Retry
                </Button>
              </Alert>
            )}

            {/* Loading Spinner */}
            {loading ? (
              <div className="text-center py-5">
                <Spinner animation="border" variant="primary" />
                <p className="mt-3 text-muted">Loading courses...</p>
              </div>
            ) : (
              <>
                {/* Courses Grid */}
                {courses.length > 0 ? (
                  <Row>
                    {courses.map((course) => (
                      <Col lg={4} md={6} className="mb-4" key={course._id}>
                        <Card className="h-100 shadow-sm border-0 course-card">
                          <div className="course-image-container">
                            <CourseBanner 
                              category={course.category} 
                              title={course.title}
                            />
                          </div>
                          <Card.Body className="d-flex flex-column">
                            <div className="mb-auto">
                              <div className="d-flex justify-content-between align-items-start mb-2">
                                <Badge bg="primary" className="mb-2">{course.category}</Badge>
                                {course.difficulty && (
                                  <Badge bg="secondary" className="mb-2">{course.difficulty}</Badge>
                                )}
                              </div>
                              <Card.Title className="h6 mb-2">{course.title}</Card.Title>
                              <Card.Text className="text-muted small">
                                {course.description?.substring(0, 80)}...
                              </Card.Text>
                              <div className="course-meta mb-3">
                                <small className="text-muted d-block">
                                  <i className="bi bi-person me-1"></i>
                                  By {course.instructor ? 
                                    (typeof course.instructor === 'object' ? course.instructor.name : course.instructor) 
                                    : 'Unknown Instructor'
                                  }
                                </small>
                                <small className="text-muted d-block">
                                  <i className="bi bi-clock me-1"></i>
                                  {course.duration}
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
                              <h6 className="text-primary mb-0">
                                {course.price === 0 ? 'Free' : `$${course.price}`}
                              </h6>
                              <Link to={`/course/${course._id}`} className="btn btn-primary btn-sm">
                                View Course
                              </Link>
                            </div>
                          </Card.Body>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                ) : !loading && (
                  <div className="text-center py-5">
                    <i className="bi bi-search display-4 text-muted"></i>
                    <h4 className="mt-3 text-muted">No courses found</h4>
                    <p className="text-muted">Try adjusting your filters or search terms</p>
                    <Button variant="primary" onClick={clearFilters}>
                      Clear Filters
                    </Button>
                  </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="d-flex justify-content-center mt-5">
                    <Pagination>
                      <Pagination.First 
                        onClick={() => handlePageChange(1)}
                        disabled={currentPage === 1}
                      />
                      <Pagination.Prev 
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                      />
                      
                      {[...Array(totalPages)].map((_, index) => {
                        const page = index + 1;
                        if (
                          page === 1 ||
                          page === totalPages ||
                          (page >= currentPage - 1 && page <= currentPage + 1)
                        ) {
                          return (
                            <Pagination.Item
                              key={page}
                              active={page === currentPage}
                              onClick={() => handlePageChange(page)}
                            >
                              {page}
                            </Pagination.Item>
                          );
                        } else if (
                          page === currentPage - 2 ||
                          page === currentPage + 2
                        ) {
                          return <Pagination.Ellipsis key={page} />;
                        }
                        return null;
                      })}
                      
                      <Pagination.Next 
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                      />
                      <Pagination.Last 
                        onClick={() => handlePageChange(totalPages)}
                        disabled={currentPage === totalPages}
                      />
                    </Pagination>
                  </div>
                )}
              </>
            )}
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default CoursesPage;