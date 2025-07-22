import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Button, ProgressBar, ListGroup, Badge, Modal, Spinner } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { coursesAPI, enrollmentAPI, certificateAPI } from '../services/api';
import { generateCertificate, downloadCertificate } from '../utils/certificateGenerator';

const Learning = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  
  const [course, setCourse] = useState(null);
  const [enrollment, setEnrollment] = useState(null);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [completedLessons, setCompletedLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCertificate, setShowCertificate] = useState(false);
  const [certificateData, setCertificateData] = useState(null);
  const [generatingCertificate, setGeneratingCertificate] = useState(false);
  const [downloadingCertificate, setDownloadingCertificate] = useState(false);

  const fetchLearningData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch course details
      const courseResponse = await coursesAPI.getCourseById(courseId);
      if (courseResponse.success) {
        setCourse(courseResponse.data);
      }
      
      // Fetch enrollment data
      const enrollmentResponse = await enrollmentAPI.getEnrollmentStatus(courseId);
      if (enrollmentResponse.success) {
        setEnrollment(enrollmentResponse.data);
        const completedLessonIds = enrollmentResponse.data.completedResources?.map(r => r.resourceId) || [];
        setCompletedLessons(completedLessonIds);
        
        // Set current lesson (first incomplete lesson or first lesson)
        const firstIncompleteLesson = findFirstIncompleteLesson(
          courseResponse.data, 
          completedLessonIds
        );
        setCurrentLesson(firstIncompleteLesson);
      } else {
        // User not enrolled, redirect to course page
        navigate(`/course/${courseId}`);
      }
    } catch (error) {
      console.error('Error fetching learning data:', error);
      navigate(`/course/${courseId}`);
    } finally {
      setLoading(false);
    }
  }, [courseId, navigate]);

  useEffect(() => {
    fetchLearningData();
  }, [fetchLearningData]);

  const findFirstIncompleteLesson = (course, completedLessonIds) => {
    if (!course.modules || course.modules.length === 0) return null;
    
    for (let moduleIndex = 0; moduleIndex < course.modules.length; moduleIndex++) {
      const module = course.modules[moduleIndex];
      if (module.lessons && module.lessons.length > 0) {
        for (let lessonIndex = 0; lessonIndex < module.lessons.length; lessonIndex++) {
          const lesson = module.lessons[lessonIndex];
          if (!completedLessonIds.includes(lesson._id)) {
            return {
              ...lesson,
              moduleIndex,
              lessonIndex
            };
          }
        }
      }
    }
    
    // All lessons completed, return first lesson
    const firstModule = course.modules[0];
    if (firstModule.lessons && firstModule.lessons.length > 0) {
      return {
        ...firstModule.lessons[0],
        moduleIndex: 0,
        lessonIndex: 0
      };
    }
    
    return null;
  };

  const handleLessonSelect = (moduleIndex, lessonIndex) => {
    const module = course.modules[moduleIndex];
    const lesson = module.lessons[lessonIndex];
    setCurrentLesson({
      ...lesson,
      moduleIndex,
      lessonIndex
    });
  };

  const markLessonComplete = async () => {
    if (!currentLesson || !currentLesson._id) return;
    
    try {
      const response = await enrollmentAPI.markLessonComplete(courseId, currentLesson._id);
      if (response.success) {
        // Update completed lessons list
        const newCompletedLessons = [...completedLessons, currentLesson._id];
        setCompletedLessons(newCompletedLessons);
        
        // Calculate new progress
        const totalLessons = course.modules.reduce((total, module) => 
          total + (module.lessons ? module.lessons.length : 0), 0
        );
        const newProgress = Math.round((newCompletedLessons.length / totalLessons) * 100);
        
        // Update course progress on backend
        await enrollmentAPI.updateProgress(courseId, newProgress);
        setEnrollment({ ...enrollment, progress: newProgress });
        
        // Check if course is completed
        if (newProgress >= 100) {
          await handleCourseCompletion();
        } else {
          // Move to next lesson
          moveToNextLesson();
        }
      }
    } catch (error) {
      console.error('Error marking lesson complete:', error);
    }
  };

  const moveToNextLesson = () => {
    const nextLesson = findNextLesson();
    if (nextLesson) {
      setCurrentLesson(nextLesson);
    }
  };

  const findNextLesson = () => {
    if (!currentLesson || !course.modules) return null;
    
    const { moduleIndex, lessonIndex } = currentLesson;
    const currentModule = course.modules[moduleIndex];
    
    // Check if there's a next lesson in current module
    if (lessonIndex + 1 < currentModule.lessons.length) {
      const nextLesson = currentModule.lessons[lessonIndex + 1];
      return {
        ...nextLesson,
        moduleIndex,
        lessonIndex: lessonIndex + 1
      };
    }
    
    // Move to first lesson of next module
    if (moduleIndex + 1 < course.modules.length) {
      const nextModule = course.modules[moduleIndex + 1];
      if (nextModule.lessons && nextModule.lessons.length > 0) {
        const nextLesson = nextModule.lessons[0];
        return {
          ...nextLesson,
          moduleIndex: moduleIndex + 1,
          lessonIndex: 0
        };
      }
    }
    
    return null;
  };

  const isLessonCompleted = (moduleIndex, lessonIndex) => {
    if (!course.modules || !course.modules[moduleIndex] || !course.modules[moduleIndex].lessons) return false;
    const lesson = course.modules[moduleIndex].lessons[lessonIndex];
    return lesson && completedLessons.includes(lesson._id);
  };

  const getTotalLessons = () => {
    if (!course.modules) return 0;
    return course.modules.reduce((total, module) => 
      total + (module.lessons ? module.lessons.length : 0), 0
    );
  };

  const handleCourseCompletion = async () => {
    try {
      setGeneratingCertificate(true);
      
      // Generate certificate on backend
      const response = await certificateAPI.generateCertificate(courseId);
      if (response.success) {
        setCertificateData(response.data);
        setShowCertificate(true);
      }
    } catch (error) {
      console.error('Error generating certificate:', error);
      // Still show completion modal even if certificate generation fails
      setShowCertificate(true);
    } finally {
      setGeneratingCertificate(false);
    }
  };

  const handleDownloadCertificate = async () => {
    if (!certificateData || !course) return;
    
    try {
      setDownloadingCertificate(true);
      
      // Generate certificate canvas
      const canvas = generateCertificate(
        certificateData.studentName,
        certificateData.courseName,
        certificateData.instructorName,
        new Date(certificateData.completionDate).toLocaleDateString(),
        certificateData.certificateId
      );
      
      // Download certificate
      const fileName = `Certificate_${course.title.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().getFullYear()}.png`;
      downloadCertificate(canvas, fileName);
      
    } catch (error) {
      console.error('Error downloading certificate:', error);
    } finally {
      setDownloadingCertificate(false);
    }
  };

  if (loading) {
    return (
      <Container className="py-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 text-muted">Loading course content...</p>
        </div>
      </Container>
    );
  }

  if (!course || !enrollment) {
    return (
      <Container className="py-5">
        <div className="text-center">
          <h4>Access Denied</h4>
          <p className="text-muted">You don't have access to this course.</p>
          <Button variant="primary" onClick={() => navigate('/courses')}>
            Browse Courses
          </Button>
        </div>
      </Container>
    );
  }

  return (
    <div className="learning-page">
      {/* Header */}
      <div className="bg-primary text-white py-3">
        <Container>
          <Row className="align-items-center">
            <Col>
              <h5 className="mb-1">{course.title}</h5>
              <div className="d-flex align-items-center">
                <small className="me-3">
                  Progress: {enrollment.progress || 0}%
                </small>
                <ProgressBar 
                  now={enrollment.progress || 0} 
                  variant="warning"
                  className="flex-grow-1"
                  style={{ height: '8px' }}
                />
                <small className="ms-3">
                  {completedLessons.length} / {getTotalLessons()} lessons
                </small>
              </div>
            </Col>
            <Col xs="auto">
              <Button 
                variant="outline-light" 
                size="sm"
                onClick={() => navigate(`/course/${courseId}`)}
              >
                <i className="bi bi-arrow-left me-2"></i>
                Course Details
              </Button>
            </Col>
          </Row>
        </Container>
      </div>

      <Container fluid className="py-0">
        <Row className="g-0">
          {/* Course Content Sidebar */}
          <Col lg={3} className="bg-light border-end">
            <div className="p-3">
              <h6 className="fw-bold mb-3">Course Content</h6>
              
              {course.modules && course.modules.map((module, moduleIndex) => (
                <Card className="mb-3 border-0 shadow-sm" key={moduleIndex}>
                  <Card.Header className="bg-white py-2">
                    <h6 className="mb-0">{module.title}</h6>
                  </Card.Header>
                  <ListGroup variant="flush">
                    {module.lessons && module.lessons.map((lesson, lessonIndex) => {
                      const isCompleted = isLessonCompleted(moduleIndex, lessonIndex);
                      const isCurrent = currentLesson?._id === lesson._id;
                      
                      return (
                        <ListGroup.Item
                          key={lessonIndex}
                          action
                          active={isCurrent}
                          onClick={() => handleLessonSelect(moduleIndex, lessonIndex)}
                          className="d-flex justify-content-between align-items-center py-2"
                        >
                          <div className="d-flex align-items-center">
                            {isCompleted ? (
                              <i className="bi bi-check-circle-fill text-success me-2"></i>
                            ) : (
                              <i className="bi bi-play-circle text-primary me-2"></i>
                            )}
                            <span className={`${isCurrent ? 'fw-bold' : ''}`}>
                              {lesson.title}
                            </span>
                          </div>
                          <small className="text-muted">{lesson.duration}</small>
                        </ListGroup.Item>
                      );
                    })}
                  </ListGroup>
                </Card>
              ))}
            </div>
          </Col>

          {/* Main Learning Area */}
          <Col lg={9}>
            <div className="p-4">
              {currentLesson ? (
                <>
                  {/* Lesson Header */}
                  <div className="mb-4">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <h3 className="fw-bold">{currentLesson.title}</h3>
                      <Badge bg={isLessonCompleted(currentLesson.moduleIndex, currentLesson.lessonIndex) ? 'success' : 'secondary'}>
                        {isLessonCompleted(currentLesson.moduleIndex, currentLesson.lessonIndex) ? 'Completed' : 'In Progress'}
                      </Badge>
                    </div>
                    <p className="text-muted">{currentLesson.description}</p>
                  </div>

                  {/* Content Area */}
                  <Card className="mb-4 border-0 shadow-sm">
                    <Card.Body className="p-4">
                      {/* Video Section - only show if video URL exists */}
                      {currentLesson.videoUrl && (
                        <div className="mb-4">
                          <h5 className="fw-bold mb-3">
                            <i className="bi bi-play-circle me-2"></i>
                            Video Lesson
                          </h5>
                          <div className="ratio ratio-16x9 mb-3">
                            <video 
                              controls 
                              className="rounded"
                              style={{ backgroundColor: '#000' }}
                            >
                              <source src={currentLesson.videoUrl} type="video/mp4" />
                              Your browser does not support the video tag.
                            </video>
                          </div>
                          <div className="d-flex align-items-center text-muted mb-3">
                            <i className="bi bi-clock me-2"></i>
                            Duration: {currentLesson.duration}
                          </div>
                        </div>
                      )}
                      
                      {/* Text Content Section */}
                      <div>
                        <div className="d-flex justify-content-between align-items-center mb-3">
                          <h5 className="fw-bold mb-0">
                            <i className="bi bi-file-text me-2"></i>
                            Lesson Content
                          </h5>
                          {!currentLesson.videoUrl && currentLesson.duration && (
                            <div className="d-flex align-items-center text-muted">
                              <i className="bi bi-clock me-2"></i>
                              Duration: {currentLesson.duration}
                            </div>
                          )}
                        </div>
                        <div className="lesson-content">
                          {currentLesson.content ? (
                            <div 
                              className="text-content"
                              style={{ 
                                lineHeight: '1.6', 
                                fontSize: '1.1rem',
                                whiteSpace: 'pre-wrap'
                              }}
                            >
                              {currentLesson.content}
                            </div>
                          ) : (
                            <div className="text-center py-4">
                              <i className="bi bi-file-text display-4 text-muted mb-3"></i>
                              <h6 className="text-muted">No content available for this lesson</h6>
                              <p className="text-muted small">
                                The instructor hasn't added content for this lesson yet.
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Additional Resources Section */}
                      {currentLesson.resources && currentLesson.resources.length > 0 && (
                        <div className="mt-4 pt-4 border-top">
                          <h6 className="fw-bold mb-3">
                            <i className="bi bi-link-45deg me-2"></i>
                            Additional Resources
                          </h6>
                          <div className="list-group list-group-flush">
                            {currentLesson.resources.map((resource, index) => (
                              <a 
                                key={index}
                                href={resource.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
                              >
                                <div>
                                  <strong>{resource.title}</strong>
                                  {resource.description && (
                                    <div className="text-muted small">{resource.description}</div>
                                  )}
                                </div>
                                <i className="bi bi-box-arrow-up-right"></i>
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </Card.Body>
                  </Card>

                  {/* Lesson Controls */}
                  <div className="d-flex justify-content-between align-items-center">
                    <Button 
                      variant="outline-secondary"
                      onClick={() => {
                        const prevLesson = findPreviousLesson();
                        if (prevLesson) setCurrentLesson(prevLesson);
                      }}
                      disabled={!findPreviousLesson()}
                    >
                      <i className="bi bi-arrow-left me-2"></i>
                      Previous Lesson
                    </Button>

                    <div className="d-flex gap-2">
                      {!isLessonCompleted(currentLesson.moduleIndex, currentLesson.lessonIndex) && (
                        <Button variant="success" onClick={markLessonComplete}>
                          <i className="bi bi-check me-2"></i>
                          Mark as Complete
                        </Button>
                      )}
                      
                      <Button 
                        variant="primary"
                        onClick={moveToNextLesson}
                        disabled={!findNextLesson()}
                      >
                        Next Lesson
                        <i className="bi bi-arrow-right ms-2"></i>
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-5">
                  <i className="bi bi-book display-4 text-muted mb-3"></i>
                  <h4>No Content Available</h4>
                  <p className="text-muted">This course doesn't have any lessons yet.</p>
                </div>
              )}
            </div>
          </Col>
        </Row>
      </Container>

      {/* Certificate Modal */}
      <Modal 
        show={showCertificate} 
        onHide={() => setShowCertificate(false)} 
        centered 
        size="lg"
        backdrop="static"
        keyboard={false}
      >
        <Modal.Header className="bg-success text-white border-0">
          <Modal.Title className="d-flex align-items-center">
            <i className="bi bi-trophy-fill me-3 display-6"></i>
            🎉 Congratulations!
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center py-5">
          <div className="mb-4">
            <div className="position-relative d-inline-block">
              <i className="bi bi-award display-1 text-warning mb-4"></i>
              <div 
                className="position-absolute top-50 start-50 translate-middle"
                style={{ 
                  animation: 'pulse 2s infinite',
                  fontSize: '2rem' 
                }}
              >
                ✨
              </div>
            </div>
          </div>
          
          <h2 className="fw-bold text-success mb-3">Course Completed!</h2>
          <p className="lead mb-4">
            You have successfully completed
          </p>
          <h4 className="text-primary fw-bold mb-4">"{course?.title}"</h4>
          
          {generatingCertificate ? (
            <div className="mb-4">
              <Spinner animation="border" variant="primary" className="me-2" />
              <span className="text-muted">Generating your certificate...</span>
            </div>
          ) : certificateData ? (
            <div className="mb-4">
              <div className="alert alert-success border-0 shadow-sm">
                <i className="bi bi-check-circle-fill me-2"></i>
                Your certificate is ready!
              </div>
              <div className="certificate-details text-start bg-light p-3 rounded mb-3">
                <h6 className="fw-bold mb-2">Certificate Details:</h6>
                <div className="row">
                  <div className="col-sm-6">
                    <small className="text-muted">Student:</small>
                    <div className="fw-semibold">{certificateData.studentName}</div>
                  </div>
                  <div className="col-sm-6">
                    <small className="text-muted">Completion Date:</small>
                    <div className="fw-semibold">
                      {new Date(certificateData.completionDate).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="col-sm-6">
                    <small className="text-muted">Instructor:</small>
                    <div className="fw-semibold">{certificateData.instructorName}</div>
                  </div>
                  <div className="col-sm-6">
                    <small className="text-muted">Certificate ID:</small>
                    <div className="fw-semibold font-monospace small">
                      {certificateData.certificateId?.substring(0, 8)}...
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="mb-4">
              <p className="text-muted">
                Your achievement has been recorded and will be available in your dashboard.
              </p>
            </div>
          )}
          
          <div className="d-flex gap-2 justify-content-center flex-wrap">
            <Button 
              variant="success" 
              size="lg"
              onClick={() => navigate('/dashboard')}
              className="d-flex align-items-center"
            >
              <i className="bi bi-speedometer2 me-2"></i>
              View Dashboard
            </Button>
            
            {certificateData && (
              <Button 
                variant="primary" 
                size="lg"
                onClick={handleDownloadCertificate}
                disabled={downloadingCertificate}
                className="d-flex align-items-center"
              >
                {downloadingCertificate ? (
                  <>
                    <Spinner size="sm" className="me-2" />
                    Downloading...
                  </>
                ) : (
                  <>
                    <i className="bi bi-download me-2"></i>
                    Download Certificate
                  </>
                )}
              </Button>
            )}
            
            <Button 
              variant="outline-info" 
              size="lg"
              onClick={() => navigate('/courses')}
              className="d-flex align-items-center"
            >
              <i className="bi bi-book me-2"></i>
              Explore More Courses
            </Button>
          </div>
          
          <div className="mt-4 pt-3 border-top">
            <small className="text-muted">
              🎓 Well done! Keep learning and growing with EduLearn.
            </small>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );

  function findPreviousLesson() {
    if (!currentLesson || !course.modules) return null;
    
    const { moduleIndex, lessonIndex } = currentLesson;
    
    // Check if there's a previous lesson in current module
    if (lessonIndex > 0) {
      const prevLesson = course.modules[moduleIndex].lessons[lessonIndex - 1];
      return {
        ...prevLesson,
        moduleIndex,
        lessonIndex: lessonIndex - 1
      };
    }
    
    // Move to last lesson of previous module
    if (moduleIndex > 0) {
      const prevModule = course.modules[moduleIndex - 1];
      if (prevModule.lessons && prevModule.lessons.length > 0) {
        const lastLessonIndex = prevModule.lessons.length - 1;
        const prevLesson = prevModule.lessons[lastLessonIndex];
        return {
          ...prevLesson,
          moduleIndex: moduleIndex - 1,
          lessonIndex: lastLessonIndex
        };
      }
    }
    
    return null;
  }
};

export default Learning;