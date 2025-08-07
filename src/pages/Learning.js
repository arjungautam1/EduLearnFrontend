import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Button, Badge, Modal } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { coursesAPI, enrollmentAPI, certificateAPI } from '../services/api';
import { generateCertificate, downloadCertificate } from '../utils/certificateGenerator';
import MarkdownRenderer from '../components/MarkdownRenderer';
import './Learning.css';

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
  const [animatedProgress, setAnimatedProgress] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showCompletionCelebration, setShowCompletionCelebration] = useState(false);

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
        
        // Animate progress bar
        setTimeout(() => {
          setAnimatedProgress(enrollmentResponse.data.progress || 0);
        }, 500);
        
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
    setIsTransitioning(true);
    
    // Small delay for smooth transition animation
    setTimeout(() => {
      const module = course.modules[moduleIndex];
      const lesson = module.lessons[lessonIndex];
      setCurrentLesson({
        ...lesson,
        moduleIndex,
        lessonIndex
      });
      setIsTransitioning(false);
    }, 200);
  };

  const markLessonComplete = async () => {
    if (!currentLesson || !currentLesson._id) return;
    
    try {
      // Show completion celebration
      setShowCompletionCelebration(true);
      
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
        
        // Animate progress bar with delay
        setTimeout(() => {
          setAnimatedProgress(newProgress);
        }, 300);
        
        // Hide celebration after delay
        setTimeout(() => {
          setShowCompletionCelebration(false);
          
          // Check if course is completed
          if (newProgress >= 100) {
            handleCourseCompletion();
          } else {
            // Move to next lesson
            moveToNextLesson();
          }
        }, 1500);
      }
    } catch (error) {
      console.error('Error marking lesson complete:', error);
      setShowCompletionCelebration(false);
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
      <div className="learning-loading">
        <Container className="py-5">
          <div className="text-center">
            <div className="learning-spinner"></div>
            <h4 className="mt-4 text-white">Loading your course...</h4>
            <p className="text-white opacity-75">Please wait while we prepare your learning experience</p>
            <div className="loading-dots">
              <div className="loading-dot"></div>
              <div className="loading-dot"></div>
              <div className="loading-dot"></div>
            </div>
          </div>
        </Container>
      </div>
    );
  }

  if (!course || !enrollment) {
    return (
      <Container className="py-5">
        <div className="access-denied">
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
    <div className="learning-page">
      {/* Completion Celebration */}
      {showCompletionCelebration && (
        <div className="completion-celebration">
          <div className="celebration-content">
            <div className="celebration-emoji">🎉</div>
            <h3>Lesson Completed!</h3>
            <p>Great job! Moving to the next lesson...</p>
          </div>
        </div>
      )}

      {/* Modern Header */}
      <div className="modern-learning-header">
        <Container>
          <div className="course-header-content">
            <div className="header-layout">
              {/* Course Info - Left */}
              <div className="course-info-left">
                <div className="course-title-badge">{course.category || 'Course'}</div>
                <h1 className="course-main-title">{course.title}</h1>
              </div>

              {/* Progress - Center */}
              <div className="progress-center">
                <div className="progress-section">
                  <div className="progress-info">
                    <span className="progress-label">Progress</span>
                    <span className="progress-percentage">{animatedProgress}%</span>
                  </div>
                  <div className="modern-progress-wrapper">
                    <div 
                      className="modern-progress-bar"
                      style={{ width: `${animatedProgress}%` }}
                    ></div>
                  </div>
                  <div className="lesson-count">
                    <i className="bi bi-check-circle-fill"></i>
                    {completedLessons.length} of {getTotalLessons()} lessons
                  </div>
                </div>
              </div>

              {/* Course Details - Right */}
              <div className="course-details-right">
                <a 
                  href={`#/course/${courseId}`}
                  className="back-btn"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate(`/course/${courseId}`);
                  }}
                >
                  <i className="bi bi-arrow-left"></i>
                  Details
                </a>
              </div>
            </div>
          </div>
        </Container>
      </div>

      <Container fluid className="learning-container">
        <Row className="g-0 h-100">
          {/* Modern Sidebar */}
          <Col lg={3} className="sidebar-col p-0">
            <div className="modern-sidebar">
              <div className="sidebar-header">
                <h3 className="sidebar-title">
                  <i className="bi bi-journal-bookmark"></i>
                  Course Content
                </h3>
              </div>
              
              <div className="modules-container">
                {course.modules && course.modules.map((module, moduleIndex) => {
                  const moduleProgress = getModuleProgress(moduleIndex);
                  
                  return (
                    <div className="modern-module fade-in" key={moduleIndex}>
                      <div className="module-header">
                        <h4 className="module-title">{module.title}</h4>
                        <div className="module-progress-wrapper">
                          <div 
                            className="module-progress-bar"
                            style={{ width: `${moduleProgress}%` }}
                          ></div>
                        </div>
                        <span className="module-progress-text">{moduleProgress}% Complete</span>
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
          <Col lg={9} className="content-col p-0">
            <div className="modern-content">
              {/* Content Transition Wrapper */}
              <div className={`content-wrapper ${isTransitioning ? 'transitioning' : ''}`}>
                {currentLesson ? (
                <>
                  {/* Lesson Header */}
                  <div className="lesson-header slide-in-right">
                    <div className="lesson-header-top">
                      <div>
                        <h1 className="lesson-main-title">{currentLesson.title}</h1>
                        <p className="lesson-description">{currentLesson.description}</p>
                      </div>
                      <div className="lesson-header-right">
                        {currentLesson.duration && (
                          <div className="lesson-duration-badge">
                            <i className="bi bi-clock"></i>
                            {currentLesson.duration}
                          </div>
                        )}
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
                    
                  </div>

                  {/* Content Card */}
                  <div className="content-card fade-in">
                    {/* Video Section */}
                    {currentLesson.videoUrl && (
                      <div className="content-section">
                        <div className="section-header">
                          <i className="bi bi-camera-video section-icon"></i>
                          <h3 className="section-title">Video Lesson</h3>
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
                      
                    {/* Text Content Section */}
                    <div className="content-section">
                      <div className="section-header">
                        <i className="bi bi-file-text section-icon"></i>
                        <h3 className="section-title">Lesson Content</h3>
                      </div>
                      
                      <div className="lesson-text-content">
                        {currentLesson.content ? (
                          <div className="content-text">
                            <MarkdownRenderer content={currentLesson.content} />
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
                      
                    {/* Additional Resources Section */}
                    {currentLesson.resources && currentLesson.resources.length > 0 && (
                      <div className="content-section">
                        <div className="section-header">
                          <i className="bi bi-link-45deg section-icon"></i>
                          <h3 className="section-title">Additional Resources</h3>
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
                      className="nav-button prev-button compact"
                      onClick={() => {
                        const prevLesson = findPreviousLesson();
                        if (prevLesson) setCurrentLesson(prevLesson);
                      }}
                      disabled={!findPreviousLesson()}
                      size="sm"
                    >
                      <i className="bi bi-arrow-left"></i>
                      Previous
                    </Button>

                    <div className="center-buttons">
                      {!isLessonCompleted(currentLesson.moduleIndex, currentLesson.lessonIndex) && (
                        <Button 
                          className="complete-button compact"
                          onClick={markLessonComplete}
                          size="sm"
                        >
                          <i className="bi bi-check-circle"></i>
                          Mark as Complete
                        </Button>
                      )}
                    </div>

                    <Button 
                      className="nav-button next-button compact"
                      onClick={moveToNextLesson}
                      disabled={!findNextLesson()}
                      size="sm"
                    >
                      Next
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
            </div>
          </Col>
        </Row>
      </Container>

      {/* Modern Certificate Modal */}
      <Modal 
        show={showCertificate} 
        onHide={() => setShowCertificate(false)} 
        centered 
        size="md"
        backdrop="static"
        keyboard={false}
        className="modern-certificate-modal compact"
      >
        <Modal.Header className="certificate-modal-header compact">
          <Modal.Title className="certificate-modal-title compact">
            <div className="celebration-icon">🎉</div>
            <div>
              <h4>Congratulations!</h4>
              <p className="mb-0">Course completed</p>
            </div>
          </Modal.Title>
          <Button 
            className="modern-close-btn"
            onClick={() => setShowCertificate(false)}
            size="sm"
            variant="link"
          >
            <i className="bi bi-x-lg"></i>
          </Button>
        </Modal.Header>
        <Modal.Body className="certificate-modal-body compact">
          <div className="completion-animation compact">
            <div className="trophy-icon">🏆</div>
          </div>
          
          <h5 className="course-completion-title">"{course?.title}"</h5>
          
          {generatingCertificate ? (
            <div className="certificate-generating compact">
              <div className="generating-spinner"></div>
              <p className="mb-0">Generating certificate...</p>
            </div>
          ) : certificateData ? (
            <div className="certificate-ready compact">
              <div className="certificate-details compact">
                <div className="details-grid compact">
                  <div className="detail-item">
                    <span className="label">Student:</span>
                    <span className="value">{certificateData.studentName}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Date:</span>
                    <span className="value">
                      {new Date(certificateData.completionDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="download-certificate-section">
                <Button 
                  className="download-certificate-btn"
                  onClick={handleDownloadCertificate}
                  disabled={downloadingCertificate}
                  size="lg"
                >
                  {downloadingCertificate ? (
                    <>
                      <div className="btn-spinner"></div>
                      Downloading Certificate...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-download"></i>
                      Download Certificate
                    </>
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <div className="certificate-info compact">
              <p className="mb-0">Achievement recorded in your dashboard.</p>
            </div>
          )}
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