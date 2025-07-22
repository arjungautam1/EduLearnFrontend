import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Button, ProgressBar, ListGroup, Badge, Modal, Spinner } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { coursesAPI, enrollmentAPI, certificateAPI } from '../services/api';
import { generateCertificate, downloadCertificate } from '../utils/certificateGenerator';
import './ModernLearning.css';

const ModernLearning = () => {
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
  const [animatedProgress, setAnimatedProgress] = useState(0);

  const fetchLearningData = useCallback(async () => {
    try {
      setLoading(true);
      
      const courseResponse = await coursesAPI.getCourseById(courseId);
      if (courseResponse.success) {
        setCourse(courseResponse.data);
      }
      
      const enrollmentResponse = await enrollmentAPI.getEnrollmentStatus(courseId);
      if (enrollmentResponse.success) {
        setEnrollment(enrollmentResponse.data);
        const completedLessonIds = enrollmentResponse.data.completedResources?.map(r => r.resourceId) || [];
        setCompletedLessons(completedLessonIds);
        
        // Animate progress bar
        setTimeout(() => {
          setAnimatedProgress(enrollmentResponse.data.progress || 0);
        }, 500);
        
        const firstIncompleteLesson = findFirstIncompleteLesson(
          courseResponse.data, 
          completedLessonIds
        );
        setCurrentLesson(firstIncompleteLesson);
      } else {
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
        const newCompletedLessons = [...completedLessons, currentLesson._id];
        setCompletedLessons(newCompletedLessons);
        
        const totalLessons = course.modules.reduce((total, module) => 
          total + (module.lessons ? module.lessons.length : 0), 0
        );
        const newProgress = Math.round((newCompletedLessons.length / totalLessons) * 100);
        
        await enrollmentAPI.updateProgress(courseId, newProgress);
        setEnrollment({ ...enrollment, progress: newProgress });
        setAnimatedProgress(newProgress);
        
        if (newProgress >= 100) {
          await handleCourseCompletion();
        } else {
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
    
    if (lessonIndex + 1 < currentModule.lessons.length) {
      const nextLesson = currentModule.lessons[lessonIndex + 1];
      return {
        ...nextLesson,
        moduleIndex,
        lessonIndex: lessonIndex + 1
      };
    }
    
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

  const findPreviousLesson = () => {
    if (!currentLesson || !course.modules) return null;
    
    const { moduleIndex, lessonIndex } = currentLesson;
    
    if (lessonIndex > 0) {
      const prevLesson = course.modules[moduleIndex].lessons[lessonIndex - 1];
      return {
        ...prevLesson,
        moduleIndex,
        lessonIndex: lessonIndex - 1
      };
    }
    
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

  const getModuleProgress = (moduleIndex) => {
    if (!course.modules || !course.modules[moduleIndex]) return 0;
    const module = course.modules[moduleIndex];
    if (!module.lessons || module.lessons.length === 0) return 0;
    
    const completedCount = module.lessons.filter((lesson, lessonIndex) => 
      isLessonCompleted(moduleIndex, lessonIndex)
    ).length;
    
    return Math.round((completedCount / module.lessons.length) * 100);
  };

  const handleCourseCompletion = async () => {
    try {
      setGeneratingCertificate(true);
      const response = await certificateAPI.generateCertificate(courseId);
      if (response.success) {
        setCertificateData(response.data);
        setShowCertificate(true);
      }
    } catch (error) {
      console.error('Error generating certificate:', error);
      setShowCertificate(true);
    } finally {
      setGeneratingCertificate(false);
    }
  };

  const handleDownloadCertificate = async () => {
    if (!certificateData || !course) return;
    
    try {
      setDownloadingCertificate(true);
      
      const canvas = generateCertificate(
        certificateData.studentName,
        certificateData.courseName,
        certificateData.instructorName,
        new Date(certificateData.completionDate).toLocaleDateString(),
        certificateData.certificateId
      );
      
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
      <div className="modern-learning-loading">
        <Container className="py-5">
          <div className="text-center">
            <div className="loading-spinner"></div>
            <h4 className="mt-4 text-gradient">Loading your course...</h4>
            <p className="text-muted">Please wait while we prepare your learning experience</p>
          </div>
        </Container>
      </div>
    );
  }

  if (!course || !enrollment) {
    return (
      <Container className="py-5">
        <div className="text-center">
          <div className="access-denied-icon">🚫</div>
          <h4 className="mt-3">Access Denied</h4>
          <p className="text-muted">You don't have access to this course.</p>
          <Button 
            variant="primary" 
            onClick={() => navigate('/courses')}
            className="modern-btn-primary"
          >
            Browse Courses
          </Button>
        </div>
      </Container>
    );
  }

  return (
    <div className="modern-learning-page">
      {/* Modern Header */}
      <div className="modern-header">
        <Container>
          <div className="header-content">
            <Row className="align-items-center">
              <Col>
                <div className="course-info">
                  <div className="course-category-tag">
                    {course.category}
                  </div>
                  <h1 className="course-title">{course.title}</h1>
                  <div className="progress-section">
                    <div className="progress-info">
                      <span className="progress-text">Your Progress</span>
                      <span className="progress-percentage">{animatedProgress}%</span>
                    </div>
                    <div className="modern-progress-container">
                      <div 
                        className="modern-progress-bar"
                        style={{ width: `${animatedProgress}%` }}
                      ></div>
                    </div>
                    <div className="lesson-counter">
                      <i className="bi bi-check-circle-fill"></i>
                      {completedLessons.length} of {getTotalLessons()} lessons completed
                    </div>
                  </div>
                </div>
              </Col>
              <Col xs="auto">
                <Button 
                  className="back-button"
                  onClick={() => navigate(`/course/${courseId}`)}
                >
                  <i className="bi bi-arrow-left"></i>
                  Course Details
                </Button>
              </Col>
            </Row>
          </div>
        </Container>
      </div>

      <Container fluid className="learning-container">
        <Row className="g-0">
          {/* Modern Sidebar */}
          <Col lg={3} className="sidebar-col">
            <div className="modern-sidebar">
              <div className="sidebar-header">
                <h3>
                  <i className="bi bi-journal-bookmark"></i>
                  Course Content
                </h3>
              </div>
              
              <div className="modules-container">
                {course.modules && course.modules.map((module, moduleIndex) => {
                  const moduleProgress = getModuleProgress(moduleIndex);
                  
                  return (
                    <div className="modern-module" key={moduleIndex}>
                      <div className="module-header">
                        <div className="module-info">
                          <h4 className="module-title">{module.title}</h4>
                          <div className="module-progress">
                            <div 
                              className="module-progress-bar"
                              style={{ width: `${moduleProgress}%` }}
                            ></div>
                          </div>
                          <span className="module-progress-text">{moduleProgress}% Complete</span>
                        </div>
                      </div>
                      
                      <div className="lessons-list">
                        {module.lessons && module.lessons.map((lesson, lessonIndex) => {
                          const isCompleted = isLessonCompleted(moduleIndex, lessonIndex);
                          const isCurrent = currentLesson?._id === lesson._id;
                          
                          return (
                            <div
                              key={lessonIndex}
                              className={`modern-lesson-item ${isCurrent ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
                              onClick={() => handleLessonSelect(moduleIndex, lessonIndex)}
                            >
                              <div className="lesson-icon">
                                {isCompleted ? (
                                  <i className="bi bi-check-circle-fill"></i>
                                ) : isCurrent ? (
                                  <i className="bi bi-play-circle-fill"></i>
                                ) : (
                                  <i className="bi bi-circle"></i>
                                )}
                              </div>
                              <div className="lesson-content">
                                <h5 className="lesson-title">{lesson.title}</h5>
                                <span className="lesson-duration">{lesson.duration}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </Col>

          {/* Modern Main Content */}
          <Col lg={9} className="content-col">
            <div className="modern-content">
              {currentLesson ? (
                <>
                  {/* Lesson Header */}
                  <div className="lesson-header">
                    <div className="lesson-header-content">
                      <div className="lesson-title-section">
                        <h1 className="lesson-title">{currentLesson.title}</h1>
                        <p className="lesson-description">{currentLesson.description}</p>
                      </div>
                      <div className="lesson-status">
                        <Badge 
                          className={`status-badge ${isLessonCompleted(currentLesson.moduleIndex, currentLesson.lessonIndex) ? 'completed' : 'in-progress'}`}
                        >
                          {isLessonCompleted(currentLesson.moduleIndex, currentLesson.lessonIndex) ? (
                            <>
                              <i className="bi bi-check-circle-fill"></i>
                              Completed
                            </>
                          ) : (
                            <>
                              <i className="bi bi-play-circle"></i>
                              In Progress
                            </>
                          )}
                        </Badge>
                      </div>
                    </div>
                    
                    {currentLesson.duration && (
                      <div className="lesson-meta">
                        <div className="meta-item">
                          <i className="bi bi-clock"></i>
                          <span>Duration: {currentLesson.duration}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Content Card */}
                  <div className="content-card">
                    {/* Video Section */}
                    {currentLesson.videoUrl && (
                      <div className="video-section">
                        <div className="video-header">
                          <h3>
                            <i className="bi bi-camera-video"></i>
                            Video Lesson
                          </h3>
                        </div>
                        <div className="video-container">
                          <video 
                            controls 
                            className="lesson-video"
                          >
                            <source src={currentLesson.videoUrl} type="video/mp4" />
                            Your browser does not support the video tag.
                          </video>
                        </div>
                      </div>
                    )}
                    
                    {/* Text Content */}
                    <div className="text-content-section">
                      <div className="content-header">
                        <h3>
                          <i className="bi bi-file-text"></i>
                          Lesson Content
                        </h3>
                      </div>
                      
                      <div className="lesson-text-content">
                        {currentLesson.content ? (
                          <div className="content-text">
                            {currentLesson.content}
                          </div>
                        ) : (
                          <div className="no-content">
                            <div className="no-content-icon">📄</div>
                            <h4>No content available</h4>
                            <p>The instructor hasn't added content for this lesson yet.</p>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Additional Resources */}
                    {currentLesson.resources && currentLesson.resources.length > 0 && (
                      <div className="resources-section">
                        <div className="resources-header">
                          <h3>
                            <i className="bi bi-link-45deg"></i>
                            Additional Resources
                          </h3>
                        </div>
                        <div className="resources-grid">
                          {currentLesson.resources.map((resource, index) => (
                            <a 
                              key={index}
                              href={resource.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="resource-card"
                            >
                              <div className="resource-content">
                                <h4>{resource.title}</h4>
                                {resource.description && (
                                  <p>{resource.description}</p>
                                )}
                              </div>
                              <i className="bi bi-box-arrow-up-right"></i>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Navigation Controls */}
                  <div className="lesson-navigation">
                    <Button 
                      className="nav-button prev-button"
                      onClick={() => {
                        const prevLesson = findPreviousLesson();
                        if (prevLesson) setCurrentLesson(prevLesson);
                      }}
                      disabled={!findPreviousLesson()}
                    >
                      <i className="bi bi-arrow-left"></i>
                      Previous Lesson
                    </Button>

                    <div className="center-buttons">
                      {!isLessonCompleted(currentLesson.moduleIndex, currentLesson.lessonIndex) && (
                        <Button 
                          className="complete-button"
                          onClick={markLessonComplete}
                        >
                          <i className="bi bi-check-circle"></i>
                          Mark as Complete
                        </Button>
                      )}
                    </div>

                    <Button 
                      className="nav-button next-button"
                      onClick={moveToNextLesson}
                      disabled={!findNextLesson()}
                    >
                      Next Lesson
                      <i className="bi bi-arrow-right"></i>
                    </Button>
                  </div>
                </>
              ) : (
                <div className="no-lesson-content">
                  <div className="no-lesson-icon">📚</div>
                  <h2>No Content Available</h2>
                  <p>This course doesn't have any lessons yet.</p>
                  <Button 
                    className="modern-btn-primary"
                    onClick={() => navigate('/courses')}
                  >
                    Explore Other Courses
                  </Button>
                </div>
              )}
            </div>
          </Col>
        </Row>
      </Container>

      {/* Modern Certificate Modal */}
      <Modal 
        show={showCertificate} 
        onHide={() => setShowCertificate(false)} 
        centered 
        size="lg"
        backdrop="static"
        keyboard={false}
        className="modern-certificate-modal"
      >
        <Modal.Header className="certificate-modal-header">
          <Modal.Title className="certificate-modal-title">
            <div className="celebration-icon">🎉</div>
            <div>
              <h2>Congratulations!</h2>
              <p>You've completed the course</p>
            </div>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="certificate-modal-body">
          <div className="completion-animation">
            <div className="trophy-icon">🏆</div>
            <div className="sparkles">✨</div>
          </div>
          
          <h3 className="course-completion-title">Course Completed Successfully!</h3>
          <h4 className="completed-course-name">"{course?.title}"</h4>
          
          {generatingCertificate ? (
            <div className="certificate-generating">
              <div className="generating-spinner"></div>
              <p>Generating your certificate...</p>
            </div>
          ) : certificateData ? (
            <div className="certificate-ready">
              <div className="certificate-success">
                <i className="bi bi-check-circle-fill"></i>
                Your certificate is ready!
              </div>
              <div className="certificate-details">
                <h5>Certificate Details</h5>
                <div className="details-grid">
                  <div className="detail-item">
                    <span className="label">Student:</span>
                    <span className="value">{certificateData.studentName}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Completion Date:</span>
                    <span className="value">
                      {new Date(certificateData.completionDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Instructor:</span>
                    <span className="value">{certificateData.instructorName}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Certificate ID:</span>
                    <span className="value certificate-id">
                      {certificateData.certificateId?.substring(0, 8)}...
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="certificate-info">
              <p>Your achievement has been recorded and will be available in your dashboard.</p>
            </div>
          )}
          
          <div className="modal-actions">
            <Button 
              className="modal-action-btn primary"
              onClick={() => navigate('/dashboard')}
            >
              <i className="bi bi-speedometer2"></i>
              View Dashboard
            </Button>
            
            {certificateData && (
              <Button 
                className="modal-action-btn secondary"
                onClick={handleDownloadCertificate}
                disabled={downloadingCertificate}
              >
                {downloadingCertificate ? (
                  <>
                    <div className="btn-spinner"></div>
                    Downloading...
                  </>
                ) : (
                  <>
                    <i className="bi bi-download"></i>
                    Download Certificate
                  </>
                )}
              </Button>
            )}
            
            <Button 
              className="modal-action-btn tertiary"
              onClick={() => navigate('/courses')}
            >
              <i className="bi bi-book"></i>
              Explore More Courses
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default ModernLearning;