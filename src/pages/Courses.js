import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Button, Form, Badge, Pagination, Spinner } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { useSearchParams } from 'react-router-dom';
import { coursesAPI } from '../services/api';
import CourseBanner from '../components/CourseBanner';

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    priceRange: searchParams.get('priceRange') || '',
    difficulty: searchParams.get('difficulty') || ''
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
      
      // Convert filters to API format
      const queryParams = {
        page: currentPage,
        limit: 12,
        search: filters.search,
        category: filters.category,
        level: filters.difficulty
      };

      // Convert priceRange to minPrice and maxPrice
      if (filters.priceRange) {
        const [minPrice, maxPrice] = filters.priceRange.split('-').map(Number);
        queryParams.minPrice = minPrice;
        if (maxPrice !== 999999) { // Don't set maxPrice for "200+" range
          queryParams.maxPrice = maxPrice;
        }
      }

      // Remove empty values
      Object.keys(queryParams).forEach(key => {
        if (!queryParams[key] && queryParams[key] !== 0) {
          delete queryParams[key];
        }
      });
      
      const response = await coursesAPI.getCourses(queryParams);
      if (response.success) {
        setCourses(response.data);
        setTotalPages(response.pagination?.totalPages || 1);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, filters]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const handleFilterChange = (filterName, value) => {
    const newFilters = { ...filters, [filterName]: value };
    setFilters(newFilters);
    setCurrentPage(1);
    
    // Update URL params
    const newSearchParams = new URLSearchParams();
    Object.entries(newFilters).forEach(([key, val]) => {
      if (val) newSearchParams.set(key, val);
    });
    setSearchParams(newSearchParams);
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      category: '',
      priceRange: '',
      difficulty: ''
    });
    setSearchParams({});
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
                  <small className="text-muted">
                    Filtered results
                  </small>
                )}
              </div>
            </div>

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
                              size="default"
                            />
                          </div>
                          <Card.Body className="d-flex flex-column">
                            <div className="mb-auto">
                              <div className="d-flex justify-content-between align-items-start mb-2">
                                <Badge bg="primary" className="mb-2">{course.category}</Badge>
                                <Badge bg="secondary" className="mb-2">{course.difficulty}</Badge>
                              </div>
                              <Card.Title className="h6 mb-2">{course.title}</Card.Title>
                              <Card.Text className="text-muted small">
                                {course.description?.substring(0, 80)}...
                              </Card.Text>
                              <div className="course-meta mb-3">
                                <small className="text-muted d-block">
                                  <i className="bi bi-person me-1"></i>
                                  By {typeof course.instructor === 'object' ? course.instructor.name : course.instructor}
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
                              <LinkContainer to={`/course/${course._id}`}>
                                <Button variant="primary" size="sm">
                                  View Course
                                </Button>
                              </LinkContainer>
                            </div>
                          </Card.Body>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                ) : (
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

export default Courses;