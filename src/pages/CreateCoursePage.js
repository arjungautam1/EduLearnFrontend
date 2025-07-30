import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import RichTextEditor from '../components/RichTextEditor';

const CreateCoursePage = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Basic Information
    title: '',
    description: '',
    category: '',
    level: 'beginner',
    price: '',
    duration: '',
    thumbnailUrl: '',
    
    // Learning Objectives & Requirements
    objectives: [''],
    requirements: [''],
    
    // Course Content
    modules: [
      {
        title: '',
        description: '',
        lessons: [
          {
            title: '',
            duration: '',
            content: ''
          }
        ]
      }
    ]
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const navigate = useNavigate();

  const categories = ['Programming', 'Data Science', 'Design', 'Business', 'Language', 'Other'];
  const difficultyLevels = [
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' }
  ];

  const steps = [
    { 
      id: 1, 
      title: 'Basic Info', 
      icon: 'bi-book',
      description: 'Course details and pricing'
    },
    { 
      id: 2, 
      title: 'Learning Goals', 
      icon: 'bi-trophy',
      description: 'Objectives and requirements'
    },
    { 
      id: 3, 
      title: 'Course Content', 
      icon: 'bi-layers',
      description: 'Modules and lessons'
    }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
  };

  const handleArrayChange = (arrayName, index, value) => {
    setFormData(prev => ({
      ...prev,
      [arrayName]: prev[arrayName].map((item, i) => i === index ? value : item)
    }));
  };

  const addArrayItem = (arrayName) => {
    setFormData(prev => ({
      ...prev,
      [arrayName]: [...prev[arrayName], '']
    }));
  };

  const removeArrayItem = (arrayName, index) => {
    setFormData(prev => ({
      ...prev,
      [arrayName]: prev[arrayName].filter((_, i) => i !== index)
    }));
  };

  const handleModuleChange = (moduleIndex, field, value) => {
    setFormData(prev => ({
      ...prev,
      modules: prev.modules.map((module, i) => 
        i === moduleIndex ? { ...module, [field]: value } : module
      )
    }));
  };

  const handleLessonChange = (moduleIndex, lessonIndex, field, value) => {
    setFormData(prev => ({
      ...prev,
      modules: prev.modules.map((module, i) => 
        i === moduleIndex 
          ? {
              ...module,
              lessons: module.lessons.map((lesson, j) => 
                j === lessonIndex ? { ...lesson, [field]: value } : lesson
              )
            }
          : module
      )
    }));
  };

  const addModule = () => {
    setFormData(prev => ({
      ...prev,
      modules: [
        ...prev.modules,
        {
          title: '',
          description: '',
          lessons: [{ title: '', duration: '', content: '' }]
        }
      ]
    }));
  };

  const removeModule = (index) => {
    setFormData(prev => ({
      ...prev,
      modules: prev.modules.filter((_, i) => i !== index)
    }));
  };

  const addLesson = (moduleIndex) => {
    setFormData(prev => ({
      ...prev,
      modules: prev.modules.map((module, i) => 
        i === moduleIndex 
          ? {
              ...module,
              lessons: [...module.lessons, { title: '', duration: '', content: '' }]
            }
          : module
      )
    }));
  };

  const removeLesson = (moduleIndex, lessonIndex) => {
    setFormData(prev => ({
      ...prev,
      modules: prev.modules.map((module, i) => 
        i === moduleIndex 
          ? {
              ...module,
              lessons: module.lessons.filter((_, j) => j !== lessonIndex)
            }
          : module
      )
    }));
  };

  const validateStep = (step) => {
    switch (step) {
      case 1:
        if (!formData.title || formData.title.length < 5) {
          return 'Course title must be at least 5 characters long';
        }
        if (!formData.description || formData.description.length < 20) {
          return 'Course description must be at least 20 characters long';
        }
        if (!formData.category) {
          return 'Please select a category';
        }
        if (!formData.duration) {
          return 'Please enter course duration';
        }
        if (formData.price && (isNaN(formData.price) || formData.price < 0)) {
          return 'Please enter a valid price';
        }
        return null;
      
      case 2:
        const validObjectives = formData.objectives.filter(obj => obj.trim() !== '');
        if (validObjectives.length === 0) {
          return 'Please add at least one learning objective';
        }
        return null;
      
      case 3:
        const hasValidModule = formData.modules.some(module => 
          module.title && module.lessons.some(lesson => lesson.title)
        );
        if (!hasValidModule) {
          return 'Please add at least one module with one lesson';
        }
        return null;
        
      default:
        return null;
    }
  };

  const nextStep = () => {
    const validationError = validateStep(currentStep);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError('');
    setCurrentStep(prev => Math.min(prev + 1, 3));
  };

  const prevStep = () => {
    setError('');
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    const finalValidation = validateStep(3);
    if (finalValidation) {
      setError(finalValidation);
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication required');
        setLoading(false);
        return;
      }

      const cleanedObjectives = formData.objectives.filter(obj => obj.trim() !== '');
      const cleanedRequirements = formData.requirements.filter(req => req.trim() !== '');
      const cleanedModules = formData.modules
        .filter(module => module.title.trim() !== '')
        .map(module => ({
          ...module,
          lessons: module.lessons.filter(lesson => lesson.title.trim() !== '')
        }))
        .filter(module => module.lessons.length > 0);

      const cleanedData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        duration: formData.duration.trim(),
        price: formData.price ? parseFloat(formData.price) : 0,
        category: formData.category,
        level: formData.level,
        thumbnailUrl: formData.thumbnailUrl.trim(),
        objectives: cleanedObjectives,
        requirements: cleanedRequirements,
        modules: cleanedModules
      };

      const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://edulearn-9aygc.ondigitalocean.app';
      const response = await fetch(`${API_BASE_URL}/api/courses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(cleanedData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess('Course created successfully!');
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      } else {
        throw new Error(data.message || 'Failed to create course');
      }
    } catch (error) {
      console.error('Error creating course:', error);
      setError(error.message || 'Failed to create course. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStepIndicator = () => (
    <div className="mb-2">
      <div className="d-flex align-items-center justify-content-between">
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            <small 
              className={`fw-semibold ${
                currentStep >= step.id ? 'text-primary' : 'text-muted'
              }`} 
              style={{ fontSize: '0.8rem' }}
            >
              {step.title}
            </small>
            {index < steps.length - 1 && (
              <div 
                className={`flex-grow-1 mx-2 ${
                  currentStep > step.id ? 'bg-primary' : 'bg-light'
                }`}
                style={{ height: '2px' }}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );

  const renderBasicInformation = () => (
    <div>

      <Row className="justify-content-center">
        <Col lg={10}>
          <Card className="border-0 shadow-sm">
            <Card.Body className="p-3">
              <div className="mb-3">
                <Form.Label className="fw-semibold text-dark mb-2">
                  <i className="bi bi-pencil-square me-2 text-primary"></i>
                  Course Title *
                </Form.Label>
                <Form.Control
                  type="text"
                  name="title"
                  placeholder="Enter an engaging course title"
                  value={formData.title}
                  onChange={handleChange}
                  style={{ borderRadius: '8px', border: '1px solid #e9ecef' }}
                />
              </div>

              <div className="mb-3">
                <Form.Label className="fw-semibold text-dark mb-3">
                  <i className="bi bi-file-text me-2 text-primary"></i>
                  Course Description *
                </Form.Label>
                <RichTextEditor
                  value={formData.description}
                  onChange={(value) => handleChange({ target: { name: 'description', value } })}
                  placeholder="Describe what students will learn and achieve in this course. You can use formatting, lists, and more..."
                  minHeight={200}
                />
              </div>

              <Row>
                <Col md={6}>
                  <div className="mb-3">
                    <Form.Label className="fw-semibold text-dark mb-2">
                      <i className="bi bi-grid me-2 text-primary"></i>
                      Category *
                    </Form.Label>
                    <Form.Select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      style={{ borderRadius: '8px', border: '1px solid #e9ecef' }}
                    >
                      <option value="">Choose a category</option>
                      {categories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </Form.Select>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="mb-3">
                    <Form.Label className="fw-semibold text-dark mb-2">
                      <i className="bi bi-bar-chart me-2 text-primary"></i>
                      Difficulty Level
                    </Form.Label>
                    <Form.Select
                      name="level"
                      value={formData.level}
                      onChange={handleChange}
                      style={{ borderRadius: '8px', border: '1px solid #e9ecef' }}
                    >
                      {difficultyLevels.map(level => (
                        <option key={level.value} value={level.value}>{level.label}</option>
                      ))}
                    </Form.Select>
                  </div>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <div className="mb-3">
                    <Form.Label className="fw-semibold text-dark mb-2">
                      <i className="bi bi-currency-dollar me-2 text-primary"></i>
                      Price (USD)
                    </Form.Label>
                    <Form.Control
                      type="number"
                      name="price"
                      placeholder="Enter 0 for free course"
                      value={formData.price}
                      onChange={handleChange}
                      min="0"
                      step="0.01"
                      style={{ borderRadius: '8px', border: '1px solid #e9ecef' }}
                    />
                  </div>
                </Col>
                <Col md={6}>
                  <div className="mb-3">
                    <Form.Label className="fw-semibold text-dark mb-2">
                      <i className="bi bi-clock me-2 text-primary"></i>
                      Duration *
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="duration"
                      placeholder="e.g., 8 weeks, 20 hours"
                      value={formData.duration}
                      onChange={handleChange}
                      style={{ borderRadius: '8px', border: '1px solid #e9ecef' }}
                    />
                  </div>
                </Col>
              </Row>

              <div className="mb-3">
                <Form.Label className="fw-semibold text-dark mb-2">
                  <i className="bi bi-image me-2 text-primary"></i>
                  Course Thumbnail URL
                  <small className="text-muted ms-2">(Optional)</small>
                </Form.Label>
                <Form.Control
                  type="url"
                  name="thumbnailUrl"
                  placeholder="https://example.com/course-image.jpg"
                  value={formData.thumbnailUrl}
                  onChange={handleChange}
                  style={{ borderRadius: '8px', border: '1px solid #e9ecef' }}
                />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );

  const renderLearningGoals = () => (
    <div>

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
              
              {formData.objectives.map((objective, index) => (
                <div key={index} className="mb-2">
                  <div className="d-flex align-items-center">
                    <div className="flex-grow-1 me-2">
                      <Form.Control
                        type="text"
                        placeholder={`Learning objective ${index + 1}`}
                        value={objective}
                        onChange={(e) => handleArrayChange('objectives', index, e.target.value)}
                        style={{ borderRadius: '8px', border: '1px solid #e9ecef' }}
                      />
                    </div>
                    {formData.objectives.length > 1 && (
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => removeArrayItem('objectives', index)}
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
                onClick={() => addArrayItem('objectives')}
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
              
              {formData.requirements.map((requirement, index) => (
                <div key={index} className="mb-2">
                  <div className="d-flex align-items-center">
                    <div className="flex-grow-1 me-2">
                      <Form.Control
                        type="text"
                        placeholder={`Requirement ${index + 1}`}
                        value={requirement}
                        onChange={(e) => handleArrayChange('requirements', index, e.target.value)}
                        style={{ borderRadius: '8px', border: '1px solid #e9ecef' }}
                      />
                    </div>
                    {formData.requirements.length > 1 && (
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => removeArrayItem('requirements', index)}
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
                onClick={() => addArrayItem('requirements')}
                className="rounded-pill"
              >
                <i className="bi bi-plus me-2"></i>
                Add Requirement
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );

  const renderCourseContent = () => (
    <div>

      <Row className="justify-content-center">
        <Col lg={12}>
          {formData.modules.map((module, moduleIndex) => (
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
                {formData.modules.length > 1 && (
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
                    <Form.Label className="fw-semibold text-dark mb-2">Module Title</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter module title"
                      value={module.title}
                      onChange={(e) => handleModuleChange(moduleIndex, 'title', e.target.value)}
                      style={{ borderRadius: '8px', border: '1px solid #e9ecef' }}
                    />
                  </Col>
                  <Col md={6}>
                    <Form.Label className="fw-semibold text-dark mb-2">Module Description</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Brief module description"
                      value={module.description}
                      onChange={(e) => handleModuleChange(moduleIndex, 'description', e.target.value)}
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

                {module.lessons.map((lesson, lessonIndex) => (
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
                          <Form.Label className="fw-semibold text-dark mb-2">
                            <i className="bi bi-pencil me-2 text-primary"></i>
                            Lesson Title *
                          </Form.Label>
                          <Form.Control
                            type="text"
                            placeholder="Enter an engaging lesson title"
                            value={lesson.title}
                            onChange={(e) => handleLessonChange(moduleIndex, lessonIndex, 'title', e.target.value)}
                            style={{ borderRadius: '8px', border: '1px solid #e9ecef' }}
                          />
                        </Col>
                        <Col md={4}>
                          <Form.Label className="fw-semibold text-dark mb-2">
                            <i className="bi bi-clock me-2 text-primary"></i>
                            Duration
                          </Form.Label>
                          <Form.Control
                            type="text"
                            placeholder="e.g., 15 minutes"
                            value={lesson.duration}
                            onChange={(e) => handleLessonChange(moduleIndex, lessonIndex, 'duration', e.target.value)}
                            style={{ borderRadius: '8px', border: '1px solid #e9ecef' }}
                          />
                        </Col>
                      </Row>
                      
                      <div className="mb-4">
                        <div className="d-flex align-items-center mb-3">
                          <div className="bg-primary bg-opacity-10 rounded-circle p-2 me-3">
                            <i className="bi bi-file-text text-primary"></i>
                          </div>
                          <div>
                            <Form.Label className="fw-bold text-dark mb-1 h5">
                              Lesson Content *
                            </Form.Label>
                            <p className="text-muted mb-0 small">
                              Create engaging content with rich formatting, lists, code examples, and more
                            </p>
                          </div>
                        </div>
                        
                        <div className="content-editor-wrapper p-3 bg-light rounded-3">
                          <RichTextEditor
                            value={lesson.content}
                            onChange={(value) => handleLessonChange(moduleIndex, lessonIndex, 'content', value)}
                            placeholder="✍️ Start writing your lesson content here...

📝 You can use:
• Headings (# ## ###)
• Bold text (**text**)
• Lists (- item or 1. item)
• Code blocks (```code```)
• Links [text](url)
• Images ![alt](url)
• Quotes (> text)

💡 Switch to Preview tab to see how it will look to students!"
                            minHeight={600}
                          />
                        </div>
                        
                        <div className="mt-2">
                          <small className="text-muted d-flex align-items-center">
                            <i className="bi bi-lightbulb me-1"></i>
                            <strong>Pro tip:</strong> Write detailed, step-by-step content. Students learn best with clear explanations and examples.
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
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return renderBasicInformation();
      case 2:
        return renderLearningGoals();
      case 3:
        return renderCourseContent();
      default:
        return renderBasicInformation();
    }
  };

  return (
    <div className="create-course-page py-4" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      <Container>
        <Row className="justify-content-center">
          <Col lg={12}>
            <div className="d-flex align-items-center justify-content-center mb-3">
              <div className="d-flex align-items-center justify-content-center bg-primary bg-opacity-10 rounded-2 me-3" style={{ width: '40px', height: '40px' }}>
                <i className="bi bi-plus-circle text-primary" style={{ fontSize: '1.2rem' }}></i>
              </div>
              <div>
                <h2 className="fw-bold text-dark mb-0" style={{ fontSize: '1.4rem' }}>Create Your Course</h2>
                <small className="text-muted">Share your expertise with students around the world</small>
              </div>
            </div>

            <Card className="border-0 shadow" style={{ borderRadius: '16px' }}>
              <Card.Body className="p-4">
                {renderStepIndicator()}

                {error && (
                  <Alert variant="danger" className="mb-4 rounded-pill text-center">
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    {error}
                  </Alert>
                )}

                {success && (
                  <Alert variant="success" className="mb-4 rounded-pill text-center">
                    <i className="bi bi-check-circle me-2"></i>
                    {success}
                  </Alert>
                )}

                {renderCurrentStep()}

                <div className="d-flex justify-content-between align-items-center mt-4 pt-3 border-top">
                  <Button
                    variant="outline-secondary"
                    onClick={currentStep === 1 ? () => navigate('/dashboard') : prevStep}
                    disabled={loading}
                    className="rounded-pill px-3"
                    size="sm"
                  >
                    {currentStep === 1 ? (
                      <>
                        <i className="bi bi-arrow-left me-1"></i>
                        Cancel
                      </>
                    ) : (
                      <>
                        <i className="bi bi-arrow-left me-1"></i>
                        Previous
                      </>
                    )}
                  </Button>

                  {currentStep < 3 ? (
                    <Button
                      variant="primary"
                      onClick={nextStep}
                      disabled={loading}
                      className="rounded-pill px-3"
                      size="sm"
                    >
                      Next Step
                      <i className="bi bi-arrow-right ms-1"></i>
                    </Button>
                  ) : (
                    <Button
                      variant="success"
                      onClick={handleSubmit}
                      disabled={loading}
                      className="rounded-pill px-3"
                      size="sm"
                    >
                      {loading ? (
                        <>
                          <Spinner
                            as="span"
                            animation="border"
                            size="sm"
                            role="status"
                            className="me-1"
                          />
                          Creating...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-check-circle me-1"></i>
                          Create Course
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default CreateCoursePage;