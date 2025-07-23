import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Button, Badge, Accordion, Alert, Modal } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { coursesAPI, enrollmentAPI } from '../services/api';
import CourseBanner from '../components/CourseBanner';
import RatingComponent from '../components/RatingComponent';
import RichTextEditor from '../components/RichTextEditor';

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user, isInstructor, isAdmin } = useAuth();
  
  const [course, setCourse] = useState(null);
  const [enrollment, setEnrollment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editForm, setEditForm] = useState({ title: '', description: '', price: '', duration: '', category: '', level: '' });
  const [editLoading, setEditLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [editModules, setEditModules] = useState([]);
  const [editObjectives, setEditObjectives] = useState([]);
  const [editRequirements, setEditRequirements] = useState([]);
  const [currentEditStep, setCurrentEditStep] = useState(1);

  const fetchCourseDetail = useCallback(async () => {
    try {
      setLoading(true);
      const response = await coursesAPI.getCourseById(id);
      if (response.success) {
        setCourse(response.data);
        
        // Check if user is enrolled (only for students, not instructors/admins)
        if (isAuthenticated && user && user.role === 'student') {
          try {
            const enrollmentResponse = await enrollmentAPI.getEnrollmentStatus(id);
            if (enrollmentResponse.success && enrollmentResponse.data) {
              setEnrollment(enrollmentResponse.data);
            }
          } catch (error) {
            // User not enrolled, that's okay for students
            console.log('Student not enrolled in course');
          }
        }
      }
    } catch (error) {
      console.error('Error fetching course:', error);
    } finally {
      setLoading(false);
    }
  }, [id, isAuthenticated, user]);

  useEffect(() => {
    fetchCourseDetail();
  }, [fetchCourseDetail]);


  useEffect(() => {
    if (course) {
      setEditForm({
        title: course.title || '',
        description: course.description || '',
        price: course.price || '',
        duration: course.duration || '',
        category: course.category || '',
        level: course.level || '',
      });
      setEditModules(course.modules || []);
      setEditObjectives(course.objectives || []);
      setEditRequirements(course.requirements || []);
    }
  }, [course]);

  const handleEnroll = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: `/course/${id}` } } });
      return;
    }

    try {
      setEnrolling(true);
      const response = await enrollmentAPI.enrollInCourse(id);
      if (response.success) {
        setEnrollment(response.data);
        setShowEnrollModal(false);
        // You might want to show a success toast here
      }
    } catch (error) {
      console.error('Error enrolling in course:', error);
    } finally {
      setEnrolling(false);
    }
  };

  const handleStartLearning = () => {
    navigate(`/learn/${id}`);
  };

  const canEdit = () => {
    if (isAdmin()) return true;
    if (!isInstructor() || !user || !course || !course.instructor) return false;
    
    const instructorId = typeof course.instructor === 'object' ? course.instructor._id : course.instructor;
    const userId = user._id || user.id || user.userId;
    
    return instructorId === userId;
  };

  const resetEditForm = () => {
    if (course) {
      setEditForm({
        title: course.title || '',
        description: course.description || '',
        price: course.price || '',
        duration: course.duration || '',
        category: course.category || '',
        level: course.level || '',
      });
      setEditModules(course.modules || []);
      setEditObjectives(course.objectives || []);
      setEditRequirements(course.requirements || []);
      setCurrentEditStep(1);
    }
  };

  const editSteps = [
    { id: 1, title: 'Basic Info', description: 'Course details and pricing' },
    { id: 2, title: 'Learning Goals', description: 'Objectives and requirements' },
    { id: 3, title: 'Course Content', description: 'Modules and lessons' }
  ];

  const nextEditStep = () => {
    setCurrentEditStep(prev => Math.min(prev + 1, 3));
  };

  const prevEditStep = () => {
    setCurrentEditStep(prev => Math.max(prev - 1, 1));
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    resetEditForm();
  };

  const handleRatingUpdate = () => {
    // Refresh course data when rating is updated
    fetchCourseDetail();
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditModuleChange = (index, field, value) => {
    setEditModules((prev) => prev.map((m, i) => i === index ? { ...m, [field]: value } : m));
  };
  const handleEditLessonChange = (moduleIdx, lessonIdx, field, value) => {
    setEditModules((prev) => prev.map((m, i) => i === moduleIdx ? {
      ...m,
      lessons: m.lessons.map((l, j) => j === lessonIdx ? { ...l, [field]: value } : l)
    } : m));
  };
  const addModule = () => setEditModules([...editModules, { title: '', description: '', lessons: [] }]);
  const removeModule = (idx) => setEditModules(editModules.filter((_, i) => i !== idx));
  const addLesson = (moduleIdx) => setEditModules(editModules.map((m, i) => i === moduleIdx ? { ...m, lessons: [...(m.lessons || []), { title: '', duration: '', content: '' }] } : m));
  const removeLesson = (moduleIdx, lessonIdx) => setEditModules(editModules.map((m, i) => i === moduleIdx ? { ...m, lessons: m.lessons.filter((_, j) => j !== lessonIdx) } : m));
  const handleObjectivesChange = (idx, value) => setEditObjectives(editObjectives.map((o, i) => i === idx ? value : o));
  const addObjective = () => setEditObjectives([...editObjectives, '']);
  const removeObjective = (idx) => setEditObjectives(editObjectives.filter((_, i) => i !== idx));
  const handleRequirementsChange = (idx, value) => setEditRequirements(editRequirements.map((r, i) => i === idx ? value : r));
  const addRequirement = () => setEditRequirements([...editRequirements, '']);
  const removeRequirement = (idx) => setEditRequirements(editRequirements.filter((_, i) => i !== idx));

  const handleEditSubmit = async () => {
    setEditLoading(true);
    try {
      const token = localStorage.getItem('token');
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://edulearnbackend.onrender.com';
      const response = await fetch(`${API_BASE_URL}/api/courses/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...editForm,
          modules: editModules,
          objectives: editObjectives,
          requirements: editRequirements
        }),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        handleCloseEditModal();
        fetchCourseDetail();
      } else {
        alert(data.message || 'Failed to update course');
      }
    } catch (error) {
      alert('Failed to update course');
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteCourse = async () => {
    setDeleteLoading(true);
    try {
      const token = localStorage.getItem('token');
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://edulearnbackend.onrender.com';
      const response = await fetch(`${API_BASE_URL}/api/courses/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (response.ok && data.success) {
        navigate('/dashboard');
      } else {
        alert(data.message || 'Failed to delete course');
      }
    } catch (error) {
      alert('Failed to delete course');
    } finally {
      setDeleteLoading(false);
      setShowDeleteModal(false);
    }
  };

  if (loading) {
    return (
      <Container className="py-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 text-muted">Loading course details...</p>
        </div>
      </Container>
    );
  }

  if (!course) {
    return (
      <Container className="py-5">
        <Alert variant="danger" className="text-center">
          <h4>Course Not Found</h4>
          <p>The course you're looking for doesn't exist or has been removed.</p>
          <Button variant="primary" onClick={() => navigate('/courses')}>
            Browse All Courses
          </Button>
        </Alert>
      </Container>
    );
  }

  return (
    <div className="course-detail-page py-5">
      <Container>
        <Row>
          {/* Course Content */}
          <Col lg={8}>
            {/* Course Header */}
            <div className="mb-4">
              <div className="d-flex align-items-center mb-3">
                <Badge bg="primary" className="me-2">{course.category}</Badge>
                <Badge bg="secondary">{course.level || course.difficulty}</Badge>
                {canEdit() && (
                  <>
                    <Button variant="outline-primary" size="sm" className="ms-3" onClick={() => setShowEditModal(true)}>
                      <i className="bi bi-pencil-square me-1"></i> Edit
                    </Button>
                    <Button variant="outline-danger" size="sm" className="ms-2" onClick={() => setShowDeleteModal(true)}>
                      <i className="bi bi-trash me-1"></i> Delete
                    </Button>
                  </>
                )}
              </div>
              
              <h1 className="fw-bold mb-3">{course.title}</h1>
              <p className="lead text-muted mb-4">{course.description}</p>
              
              <div className="course-meta d-flex flex-wrap gap-4 mb-4">
                <div>
                  <i className="bi bi-person text-primary me-2"></i>
                  <strong>Instructor:</strong> {typeof course.instructor === 'object' ? course.instructor.name : course.instructor}
                </div>
                <div>
                  <i className="bi bi-clock text-primary me-2"></i>
                  <strong>Duration:</strong> {course.duration}
                </div>
                <div>
                  <i className="bi bi-people text-primary me-2"></i>
                  <strong>Students:</strong> {course.studentsEnrolled || 0}
                </div>
                <div>
                  <i className="bi bi-star-fill text-warning me-2"></i>
                  <strong>Rating:</strong> {course.rating > 0 ? course.rating.toFixed(1) : 'No ratings'} ({course.totalRatings || 0} review{course.totalRatings !== 1 ? 's' : ''})
                </div>
              </div>
            </div>

            {/* Course Banner */}
            <div className="mb-5">
              <CourseBanner 
                category={course.category} 
                title={course.title}
                size="large"
              />
            </div>

            {/* What You'll Learn */}
            <Card className="mb-4 border-0 shadow-sm">
              <Card.Header className="bg-light">
                <h4 className="mb-0">
                  <i className="bi bi-check-circle text-success me-2"></i>
                  What You'll Learn
                </h4>
              </Card.Header>
              <Card.Body>
                <Row>
                  {course.objectives?.map((objective, index) => (
                    <Col md={6} className="mb-2" key={index}>
                      <div className="d-flex align-items-start">
                        <i className="bi bi-check text-success me-2 mt-1"></i>
                        <span>{objective}</span>
                      </div>
                    </Col>
                  )) || (
                    <Col>
                      <p className="text-muted">Course objectives will be updated soon.</p>
                    </Col>
                  )}
                </Row>
              </Card.Body>
            </Card>

            {/* Requirements */}
            <Card className="mb-4 border-0 shadow-sm">
              <Card.Header className="bg-light">
                <h4 className="mb-0">
                  <i className="bi bi-gear text-warning me-2"></i>
                  Requirements
                </h4>
              </Card.Header>
              <Card.Body>
                {course.requirements && course.requirements.length > 0 ? (
                  <ul className="mb-0">
                    {course.requirements.map((requirement, index) => (
                      <li key={index} className="mb-1">{requirement}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted mb-0">No specific requirements for this course.</p>
                )}
              </Card.Body>
            </Card>

            {/* Course Content/Curriculum - Show for instructors/admins OR enrolled students */}
            {(isInstructor() || isAdmin() || enrollment) && (
              <Card className="mb-4 border-0 shadow-sm">
                <Card.Header className="bg-light">
                  <h4 className="mb-0">
                    <i className="bi bi-list-ul text-primary me-2"></i>
                    Course Content
                  </h4>
                </Card.Header>
                <Card.Body>
                  {course.modules && course.modules.length > 0 ? (
                    <Accordion>
                      {course.modules.map((module, index) => (
                        <Accordion.Item eventKey={index.toString()} key={index}>
                          <Accordion.Header>
                            <div className="d-flex justify-content-between w-100 me-3">
                              <span className="fw-semibold">{module.title}</span>
                              <small className="text-muted">
                                {module.lessons?.length || 0} lessons
                              </small>
                            </div>
                          </Accordion.Header>
                          <Accordion.Body>
                            {module.lessons && module.lessons.length > 0 ? (
                              <div>
                                {module.lessons.map((lesson, lessonIndex) => (
                                  <Card key={lessonIndex} className="mb-2 border-light">
                                    <Card.Body className="p-3">
                                      <div className="d-flex justify-content-between align-items-center mb-2">
                                        <div className="d-flex align-items-center">
                                          <i className="bi bi-play-circle text-primary me-2"></i>
                                          <strong>{lesson.title}</strong>
                                        </div>
                                        <small className="text-muted">{lesson.duration}</small>
                                      </div>
                                      {lesson.content && (
                                        <div className="lesson-content">
                                          <p className="text-muted mb-0 ms-4">{lesson.content}</p>
                                        </div>
                                      )}
                                    </Card.Body>
                                  </Card>
                                ))}
                              </div>
                            ) : (
                              <p className="text-muted mb-0">Module content will be available soon.</p>
                            )}
                          </Accordion.Body>
                        </Accordion.Item>
                      ))}
                    </Accordion>
                  ) : (
                    <p className="text-muted">Course curriculum will be updated soon.</p>
                  )}
                </Card.Body>
              </Card>
            )}

            {/* Message for non-enrolled students about course content */}
            {!isInstructor() && !isAdmin() && !enrollment && (
              <Card className="mb-4 border-0 shadow-sm">
                <Card.Header className="bg-light">
                  <h4 className="mb-0">
                    <i className="bi bi-list-ul text-primary me-2"></i>
                    Course Content
                  </h4>
                </Card.Header>
                <Card.Body>
                  <Alert variant="info" className="text-center mb-0">
                    <i className="bi bi-lock me-2"></i>
                    Course content is available after enrollment
                  </Alert>
                </Card.Body>
              </Card>
            )}

            {/* Rating Component */}
            <RatingComponent courseId={id} onRatingUpdate={handleRatingUpdate} enrollment={enrollment} />
          </Col>

          {/* Sidebar */}
          <Col lg={4}>
            <Card className="sticky-top border-0 shadow">
              <Card.Body className="text-center p-4">
                <div className="mb-4">
                  <h2 className="text-primary fw-bold mb-2">
                    {course.price === 0 ? 'Free' : `$${course.price}`}
                  </h2>
                  {course.originalPrice && course.originalPrice > course.price && (
                    <p className="text-muted">
                      <s>${course.originalPrice}</s> 
                      <Badge bg="success" className="ms-2">
                        Save ${course.originalPrice - course.price}
                      </Badge>
                    </p>
                  )}
                </div>

                {/* Instructor/Admin view takes priority over enrollment */}
                {isInstructor() || isAdmin() ? (
                  <div className="mb-4">
                    <Alert variant="info" className="text-center">
                      <i className="bi bi-info-circle me-2"></i>
                      {canEdit() ? 'You are the instructor of this course' : 'Instructor/Admin view'}
                    </Alert>
                    {canEdit() && (
                      <Button 
                        variant="primary" 
                        size="lg" 
                        className="w-100 mb-2"
                        onClick={() => setShowEditModal(true)}
                      >
                        <i className="bi bi-pencil-square me-2"></i>
                        Edit Course
                      </Button>
                    )}
                    {enrollment && (
                      <Button 
                        variant="outline-primary" 
                        size="lg" 
                        className="w-100 mt-2"
                        onClick={handleStartLearning}
                      >
                        <i className="bi bi-eye me-2"></i>
                        Preview as Student
                      </Button>
                    )}
                  </div>
                ) : enrollment ? (
                  <div className="mb-4">
                    <Alert variant="success" className="mb-3">
                      <i className="bi bi-check-circle me-2"></i>
                      You're enrolled in this course!
                    </Alert>
                    <Button 
                      variant="primary" 
                      size="lg" 
                      className="w-100 mb-3"
                      onClick={handleStartLearning}
                    >
                      {enrollment.progress > 0 ? 'Continue Learning' : 'Start Learning'}
                    </Button>
                    {enrollment.progress > 0 && (
                      <div className="text-start">
                        <small className="text-muted">Your Progress: {enrollment.progress}%</small>
                        <div className="progress mt-1">
                          <div 
                            className="progress-bar" 
                            style={{ width: `${enrollment.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  // Only show enrollment options for students (not instructors or admins)
                  <div className="mb-4">
                    {isAuthenticated ? (
                      <Button 
                        variant="primary" 
                        size="lg" 
                        className="w-100"
                        onClick={() => setShowEnrollModal(true)}
                        disabled={enrolling}
                      >
                        {enrolling ? 'Enrolling...' : 'Enroll Now'}
                      </Button>
                    ) : (
                      <Button 
                        variant="primary" 
                        size="lg" 
                        className="w-100"
                        onClick={() => navigate('/login', { state: { from: { pathname: `/course/${id}` } } })}
                      >
                        Login to Enroll
                      </Button>
                    )}
                  </div>
                )}

                <div className="course-includes mb-4">
                  <h6 className="fw-bold mb-3">This course includes:</h6>
                  <div className="text-start">
                    <div className="mb-2">
                      <i className="bi bi-play-circle text-primary me-2"></i>
                      Video lectures
                    </div>
                    <div className="mb-2">
                      <i className="bi bi-file-earmark-text text-primary me-2"></i>
                      Reading materials
                    </div>
                    <div className="mb-2">
                      <i className="bi bi-trophy text-primary me-2"></i>
                      Certificate of completion
                    </div>
                    <div className="mb-2">
                      <i className="bi bi-phone text-primary me-2"></i>
                      Mobile access
                    </div>
                    <div className="mb-2">
                      <i className="bi bi-infinity text-primary me-2"></i>
                      Lifetime access
                    </div>
                  </div>
                </div>

                <div className="text-center">
                  <Button variant="outline-primary" className="w-100 mb-2">
                    <i className="bi bi-gift me-2"></i>
                    Gift this course
                  </Button>
                  <Button variant="outline-secondary" className="w-100">
                    <i className="bi bi-share me-2"></i>
                    Share course
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Enrollment Confirmation Modal */}
        <Modal show={showEnrollModal} onHide={() => setShowEnrollModal(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>Confirm Enrollment</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>Are you sure you want to enroll in <strong>{course.title}</strong>?</p>
            {course.price > 0 && (
              <Alert variant="info">
                <strong>Course Price:</strong> ${course.price}
              </Alert>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowEnrollModal(false)}>
              Cancel
            </Button>
            <Button 
              variant="primary" 
              onClick={handleEnroll}
              disabled={enrolling}
            >
              {enrolling ? 'Enrolling...' : 'Confirm Enrollment'}
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Edit Course Modal */}
        <Modal 
          show={showEditModal} 
          onHide={handleCloseEditModal}
          centered 
          size="xl"
        >
          <Modal.Header closeButton>
            <Modal.Title className="d-flex align-items-center">
              <div className="d-flex align-items-center justify-content-center bg-primary bg-opacity-10 rounded-2 me-3" style={{ width: '35px', height: '35px' }}>
                <i className="bi bi-pencil-square text-primary"></i>
              </div>
              <div>
                <h5 className="fw-bold text-dark mb-0">Edit Course</h5>
                <small className="text-muted">Update your course information</small>
              </div>
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="p-3">
            {/* Step Indicator */}
            <div className="mb-3">
              <div className="d-flex align-items-center justify-content-between">
                {editSteps.map((step, index) => (
                  <React.Fragment key={step.id}>
                    <small 
                      className={`fw-semibold ${
                        currentEditStep >= step.id ? 'text-primary' : 'text-muted'
                      }`} 
                      style={{ fontSize: '0.8rem' }}
                    >
                      {step.title}
                    </small>
                    {index < editSteps.length - 1 && (
                      <div 
                        className={`flex-grow-1 mx-2 ${
                          currentEditStep > step.id ? 'bg-primary' : 'bg-light'
                        }`}
                        style={{ height: '2px' }}
                      />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Step 1: Basic Information */}
              {currentEditStep === 1 && (
                <Row className="justify-content-center">
                  <Col lg={10}>
                    <Card className="border-0 shadow-sm">
                      <Card.Body className="p-3">
                        <div className="mb-3">
                          <label className="form-label fw-semibold text-dark mb-2">
                            <i className="bi bi-pencil-square me-2 text-primary"></i>
                            Course Title *
                          </label>
                          <input 
                            type="text" 
                            className="form-control" 
                            name="title" 
                            value={editForm.title} 
                            onChange={handleEditChange} 
                            required 
                            style={{ borderRadius: '8px', border: '1px solid #e9ecef' }}
                          />
                        </div>

                        <div className="mb-3">
                          <label className="form-label fw-semibold text-dark mb-3">
                            <i className="bi bi-file-text me-2 text-primary"></i>
                            Course Description *
                          </label>
                          <RichTextEditor
                            value={editForm.description}
                            onChange={(value) => handleEditChange({ target: { name: 'description', value } })}
                            placeholder="Describe what students will learn and achieve in this course. You can use formatting, lists, and more..."
                            minHeight={200}
                          />
                        </div>

                        <Row>
                          <Col md={6}>
                            <div className="mb-3">
                              <label className="form-label fw-semibold text-dark mb-2">
                                <i className="bi bi-grid me-2 text-primary"></i>
                                Category *
                              </label>
                              <select 
                                className="form-select" 
                                name="category" 
                                value={editForm.category} 
                                onChange={handleEditChange} 
                                required
                                style={{ borderRadius: '8px', border: '1px solid #e9ecef' }}
                              >
                                <option value="">Choose a category</option>
                                <option value="Programming">Programming</option>
                                <option value="Data Science">Data Science</option>
                                <option value="Design">Design</option>
                                <option value="Business">Business</option>
                                <option value="Language">Language</option>
                                <option value="Other">Other</option>
                              </select>
                            </div>
                          </Col>
                          <Col md={6}>
                            <div className="mb-3">
                              <label className="form-label fw-semibold text-dark mb-2">
                                <i className="bi bi-bar-chart me-2 text-primary"></i>
                                Difficulty Level
                              </label>
                              <select 
                                className="form-select" 
                                name="level" 
                                value={editForm.level} 
                                onChange={handleEditChange}
                                style={{ borderRadius: '8px', border: '1px solid #e9ecef' }}
                              >
                                <option value="beginner">Beginner</option>
                                <option value="intermediate">Intermediate</option>
                                <option value="advanced">Advanced</option>
                              </select>
                            </div>
                          </Col>
                        </Row>

                        <Row>
                          <Col md={6}>
                            <div className="mb-3">
                              <label className="form-label fw-semibold text-dark mb-2">
                                <i className="bi bi-currency-dollar me-2 text-primary"></i>
                                Price (USD)
                              </label>
                              <input 
                                type="number" 
                                className="form-control" 
                                name="price" 
                                value={editForm.price} 
                                onChange={handleEditChange} 
                                min="0" 
                                step="0.01"
                                style={{ borderRadius: '8px', border: '1px solid #e9ecef' }}
                              />
                            </div>
                          </Col>
                          <Col md={6}>
                            <div className="mb-3">
                              <label className="form-label fw-semibold text-dark mb-2">
                                <i className="bi bi-clock me-2 text-primary"></i>
                                Duration *
                              </label>
                              <input 
                                type="text" 
                                className="form-control" 
                                name="duration" 
                                value={editForm.duration} 
                                onChange={handleEditChange} 
                                required 
                                placeholder="e.g., 8 weeks, 20 hours"
                                style={{ borderRadius: '8px', border: '1px solid #e9ecef' }}
                              />
                            </div>
                          </Col>
                        </Row>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              )}

              {/* Step 2: Learning Goals */}
              {currentEditStep === 2 && (
                <Row className="justify-content-center">
                  <Col lg={10}>
                    <Card className="border-0 shadow-sm mb-3">
                      <Card.Body className="p-3">
                        <div className="d-flex align-items-center mb-2">
                          <div className="bg-success bg-opacity-10 rounded-circle p-2 me-3">
                            <i className="bi bi-check-circle text-success"></i>
                          </div>
                          <h5 className="fw-bold mb-0 text-success">Learning Objectives</h5>
                        </div>
                        <p className="text-muted mb-3 small">What will students be able to do after completing this course?</p>
                        
                        {editObjectives.map((objective, index) => (
                          <div key={index} className="mb-2">
                            <div className="d-flex align-items-center">
                              <div className="flex-grow-1 me-2">
                                <input 
                                  type="text" 
                                  className="form-control" 
                                  placeholder={`Learning objective ${index + 1}`}
                                  value={objective} 
                                  onChange={e => handleObjectivesChange(index, e.target.value)}
                                  style={{ borderRadius: '8px', border: '1px solid #e9ecef' }}
                                />
                              </div>
                              {editObjectives.length > 1 && (
                                <Button
                                  variant="outline-danger"
                                  size="sm"
                                  onClick={() => removeObjective(index)}
                                  className="rounded-circle"
                                  style={{ width: '32px', height: '32px' }}
                                >
                                  <i className="bi bi-trash" style={{ fontSize: '0.8rem' }}></i>
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                        
                        <Button
                          variant="outline-success"
                          onClick={addObjective}
                          className="rounded-pill"
                        >
                          <i className="bi bi-plus me-2"></i>
                          Add Learning Objective
                        </Button>
                      </Card.Body>
                    </Card>

                    <Card className="border-0 shadow-sm">
                      <Card.Body className="p-3">
                        <div className="d-flex align-items-center mb-2">
                          <div className="bg-warning bg-opacity-10 rounded-circle p-2 me-3">
                            <i className="bi bi-list-check text-warning"></i>
                          </div>
                          <h5 className="fw-bold mb-0 text-warning">Prerequisites & Requirements</h5>
                        </div>
                        <p className="text-muted mb-3 small">What should students know or have before taking this course?</p>
                        
                        {editRequirements.map((requirement, index) => (
                          <div key={index} className="mb-2">
                            <div className="d-flex align-items-center">
                              <div className="flex-grow-1 me-2">
                                <input 
                                  type="text" 
                                  className="form-control" 
                                  placeholder={`Requirement ${index + 1}`}
                                  value={requirement} 
                                  onChange={e => handleRequirementsChange(index, e.target.value)}
                                  style={{ borderRadius: '8px', border: '1px solid #e9ecef' }}
                                />
                              </div>
                              {editRequirements.length > 1 && (
                                <Button
                                  variant="outline-danger"
                                  size="sm"
                                  onClick={() => removeRequirement(index)}
                                  className="rounded-circle"
                                  style={{ width: '32px', height: '32px' }}
                                >
                                  <i className="bi bi-trash" style={{ fontSize: '0.8rem' }}></i>
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                        
                        <Button
                          variant="outline-warning"
                          onClick={addRequirement}
                          className="rounded-pill"
                        >
                          <i className="bi bi-plus me-2"></i>
                          Add Requirement
                        </Button>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              )}

              {/* Step 3: Course Content */}
              {currentEditStep === 3 && (
                <Row className="justify-content-center">
                  <Col lg={12}>
                    {editModules.map((module, moduleIndex) => (
                      <Card key={moduleIndex} className="mb-3 border-0 shadow-sm">
                        <Card.Header 
                          className="bg-gradient d-flex justify-content-between align-items-center py-2"
                          style={{ 
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            borderRadius: '12px 12px 0 0'
                          }}
                        >
                          <div className="d-flex align-items-center">
                            <Badge bg="light" text="dark" className="me-2 px-2 py-1" style={{ fontSize: '0.75rem' }}>
                              Module {moduleIndex + 1}
                            </Badge>
                            <h6 className="mb-0 fw-bold" style={{ fontSize: '0.9rem' }}>
                              {module.title || 'Untitled Module'}
                            </h6>
                          </div>
                          {editModules.length > 1 && (
                            <Button
                              variant="outline-light"
                              size="sm"
                              onClick={() => removeModule(moduleIndex)}
                              className="rounded-circle"
                              style={{ width: '28px', height: '28px' }}
                            >
                              <i className="bi bi-trash" style={{ fontSize: '0.7rem' }}></i>
                            </Button>
                          )}
                        </Card.Header>
                        
                        <Card.Body className="p-3">
                          <Row className="mb-3">
                            <Col md={6}>
                              <label className="form-label fw-semibold text-dark mb-2">Module Title</label>
                              <input 
                                type="text" 
                                className="form-control" 
                                placeholder="Enter module title" 
                                value={module.title} 
                                onChange={e => handleEditModuleChange(moduleIndex, 'title', e.target.value)}
                                style={{ borderRadius: '8px', border: '1px solid #e9ecef' }}
                              />
                            </Col>
                            <Col md={6}>
                              <label className="form-label fw-semibold text-dark mb-2">Module Description</label>
                              <input 
                                type="text" 
                                className="form-control" 
                                placeholder="Brief module description" 
                                value={module.description} 
                                onChange={e => handleEditModuleChange(moduleIndex, 'description', e.target.value)}
                                style={{ borderRadius: '8px', border: '1px solid #e9ecef' }}
                              />
                            </Col>
                          </Row>

                          <div className="d-flex align-items-center mb-3">
                            <div className="bg-primary bg-opacity-10 rounded-circle p-2 me-3">
                              <i className="bi bi-play-circle text-primary"></i>
                            </div>
                            <h6 className="fw-bold mb-0 text-primary">Lessons</h6>
                          </div>

                          {module.lessons && module.lessons.map((lesson, lessonIndex) => (
                            <Card key={lessonIndex} className="mb-4 border-light shadow-sm">
                              <Card.Body className="p-4">
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                  <div className="d-flex align-items-center">
                                    <Badge bg="primary" className="px-3 py-2 me-3" style={{ fontSize: '0.8rem' }}>
                                      <i className="bi bi-play-circle me-1"></i>
                                      Lesson {lessonIndex + 1}
                                    </Badge>
                                    <h6 className="mb-0 text-primary fw-bold">
                                      {lesson.title || 'Untitled Lesson'}
                                    </h6>
                                  </div>
                                  {module.lessons.length > 1 && (
                                    <Button
                                      variant="outline-danger"
                                      size="sm"
                                      onClick={() => removeLesson(moduleIndex, lessonIndex)}
                                      className="rounded-circle"
                                      style={{ width: '32px', height: '32px' }}
                                    >
                                      <i className="bi bi-trash" style={{ fontSize: '0.8rem' }}></i>
                                    </Button>
                                  )}
                                </div>
                                
                                <Row className="mb-4">
                                  <Col md={8}>
                                    <label className="form-label fw-semibold text-dark mb-2">
                                      <i className="bi bi-pencil me-2 text-primary"></i>
                                      Lesson Title *
                                    </label>
                                    <input 
                                      type="text" 
                                      className="form-control" 
                                      placeholder="Enter an engaging lesson title" 
                                      value={lesson.title} 
                                      onChange={e => handleEditLessonChange(moduleIndex, lessonIndex, 'title', e.target.value)}
                                      style={{ borderRadius: '8px', border: '1px solid #e9ecef' }}
                                    />
                                  </Col>
                                  <Col md={4}>
                                    <label className="form-label fw-semibold text-dark mb-2">
                                      <i className="bi bi-clock me-2 text-primary"></i>
                                      Duration
                                    </label>
                                    <input 
                                      type="text" 
                                      className="form-control" 
                                      placeholder="e.g., 15 minutes" 
                                      value={lesson.duration} 
                                      onChange={e => handleEditLessonChange(moduleIndex, lessonIndex, 'duration', e.target.value)}
                                      style={{ borderRadius: '8px', border: '1px solid #e9ecef' }}
                                    />
                                  </Col>
                                </Row>
                                
                                <div className="mb-3">
                                  <div className="d-flex align-items-center mb-3">
                                    <div className="bg-primary bg-opacity-10 rounded-circle p-2 me-3">
                                      <i className="bi bi-file-text text-primary"></i>
                                    </div>
                                    <div>
                                      <label className="form-label fw-bold text-dark mb-1 h5">
                                        Lesson Content *
                                      </label>
                                      <p className="text-muted mb-0 small">
                                        Edit the lesson content with rich formatting, lists, code examples, and more
                                      </p>
                                    </div>
                                  </div>
                                  
                                  <div className="content-editor-wrapper p-3 bg-light rounded-3">
                                    <RichTextEditor
                                      value={lesson.content}
                                      onChange={(value) => handleEditLessonChange(moduleIndex, lessonIndex, 'content', value)}
                                      placeholder="✍️ Edit your lesson content here...

📝 You can use:
• Headings (# ## ###)
• Bold text (**text**)
• Lists (- item or 1. item)
• Code blocks (```code```)
• Links [text](url)
• Images ![alt](url)
• Quotes (> text)

💡 Switch to Preview tab to see how it will look to students!"
                                      minHeight={500}
                                    />
                                  </div>
                                  
                                  <div className="mt-2">
                                    <small className="text-muted d-flex align-items-center">
                                      <i className="bi bi-lightbulb me-1"></i>
                                      <strong>Pro tip:</strong> Make sure your updated content is clear and engaging for students.
                                    </small>
                                  </div>
                                </div>
                              </Card.Body>
                            </Card>
                          ))}
                          
                          <Button
                            variant="outline-primary"
                            onClick={() => addLesson(moduleIndex)}
                            className="rounded-pill me-2"
                          >
                            <i className="bi bi-plus me-2"></i>
                            Add Lesson
                          </Button>
                        </Card.Body>
                      </Card>
                    ))}
                    
                    <div className="text-center">
                      <Button
                        variant="outline-info"
                        onClick={addModule}
                        className="rounded-pill px-4 py-2"
                        size="lg"
                      >
                        <i className="bi bi-plus-circle me-2"></i>
                        Add New Module
                      </Button>
                    </div>
                  </Col>
                </Row>
              )}

              {/* Navigation Buttons */}
              <div className="d-flex justify-content-between align-items-center mt-4 pt-3 border-top">
                <Button
                  variant="outline-secondary"
                  onClick={currentEditStep === 1 ? handleCloseEditModal : prevEditStep}
                  disabled={editLoading}
                  className="rounded-pill px-3"
                  size="sm"
                >
                  {currentEditStep === 1 ? (
                    <>
                      <i className="bi bi-x me-1"></i>
                      Cancel
                    </>
                  ) : (
                    <>
                      <i className="bi bi-arrow-left me-1"></i>
                      Previous
                    </>
                  )}
                </Button>

                {currentEditStep < 3 ? (
                  <Button
                    variant="primary"
                    onClick={nextEditStep}
                    disabled={editLoading}
                    className="rounded-pill px-3"
                    size="sm"
                  >
                    Next Step
                    <i className="bi bi-arrow-right ms-1"></i>
                  </Button>
                ) : (
                  <Button
                    variant="success"
                    onClick={handleEditSubmit}
                    disabled={editLoading}
                    className="rounded-pill px-3"
                    size="sm"
                  >
                    {editLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                        Saving...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-check-circle me-1"></i>
                        Save Changes
                      </>
                    )}
                  </Button>
                )}
              </div>
          </Modal.Body>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>Delete Course</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>Are you sure you want to delete <strong>{course.title}</strong>? This action cannot be undone.</p>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDeleteCourse} disabled={deleteLoading}>
              {deleteLoading ? 'Deleting...' : 'Delete'}
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </div>
  );
};

export default CourseDetail;