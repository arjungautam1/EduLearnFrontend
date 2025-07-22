import React, { useState, useEffect, useCallback } from 'react';
import { Card, Button, Form, Modal, Row, Col, Badge, ProgressBar } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import { ratingAPI } from '../services/api';

const RatingComponent = ({ courseId, onRatingUpdate, enrollment = null }) => {
  const { isAuthenticated, isInstructor, isAdmin } = useAuth();
  const [ratings, setRatings] = useState([]);
  const [ratingStats, setRatingStats] = useState(null);
  const [userRating, setUserRating] = useState(null);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newReview, setNewReview] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Check if user can rate this course
  const canRate = useCallback(() => {
    if (!isAuthenticated) return false;
    if (isInstructor() || isAdmin()) return false; // Instructors/admins can't rate courses
    return enrollment !== null; // Only enrolled students can rate
  }, [isAuthenticated, isInstructor, isAdmin, enrollment]);

  const fetchRatings = useCallback(async () => {
    try {
      const response = await ratingAPI.getCourseRatings(courseId);
      if (response.success) {
        setRatings(response.data.ratings);
        setRatingStats(response.data.stats);
      }
    } catch (error) {
      console.error('Error fetching ratings:', error);
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  const fetchUserRating = useCallback(async () => {
    try {
      const response = await ratingAPI.getUserRating(courseId);
      if (response.success && response.data) {
        setUserRating(response.data);
        setNewRating(response.data.rating);
        setNewReview(response.data.review || '');
      }
    } catch (error) {
      // User hasn't rated this course yet
      console.log('User hasn\'t rated this course');
    }
  }, [courseId]);

  useEffect(() => {
    fetchRatings();
    if (isAuthenticated && canRate()) {
      fetchUserRating();
    }
  }, [courseId, isAuthenticated, canRate, fetchRatings, fetchUserRating]);

  const handleSubmitRating = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await ratingAPI.addRating(courseId, {
        rating: newRating,
        review: newReview
      });

      if (response.success) {
        setUserRating(response.data);
        setShowRatingModal(false);
        fetchRatings();
        if (onRatingUpdate) {
          onRatingUpdate();
        }
      }
    } catch (error) {
      console.error('Error submitting rating:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (rating, size = 'md', interactive = false, onStarClick = null) => {
    const stars = [];
    const starSize = size === 'sm' ? '16px' : size === 'lg' ? '24px' : '20px';
    
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span
          key={i}
          className={`text-${i <= rating ? 'warning' : 'muted'} ${interactive ? 'cursor-pointer' : ''}`}
          style={{ fontSize: starSize, marginRight: '2px' }}
          onClick={() => interactive && onStarClick && onStarClick(i)}
        >
          ★
        </span>
      );
    }
    return stars;
  };

  const getRatingPercentage = (starCount) => {
    if (!ratingStats || ratingStats.totalRatings === 0) return 0;
    
    // Map star count to correct backend field names
    const fieldMap = {
      5: 'fiveStars',
      4: 'fourStars', 
      3: 'threeStars',
      2: 'twoStars',
      1: 'oneStar'
    };
    
    const count = ratingStats[fieldMap[starCount]] || 0;
    return (count / ratingStats.totalRatings) * 100;
  };

  const renderRatingActions = () => {
    if (!isAuthenticated) {
      return (
        <div className="mb-4 p-3 bg-light rounded text-center">
          <p className="text-muted mb-2">
            <i className="bi bi-info-circle me-1"></i>
            Please log in to rate this course
          </p>
        </div>
      );
    }

    if (isInstructor() || isAdmin()) {
      return (
        <div className="mb-4 p-3 bg-light rounded text-center">
          <p className="text-muted mb-0">
            <i className="bi bi-shield-check me-1"></i>
            {isInstructor() ? 'As an instructor, you can view student ratings here' : 'Admin view - student ratings displayed below'}
          </p>
        </div>
      );
    }

    if (!enrollment) {
      return (
        <div className="mb-4 p-3 bg-light rounded text-center">
          <p className="text-muted mb-2">
            <i className="bi bi-lock me-1"></i>
            Enroll in this course to share your rating and review
          </p>
        </div>
      );
    }

    // Student is enrolled - show rating interface
    if (userRating) {
      return (
        <div className="mb-4 p-3 bg-light rounded">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <strong>Your Rating:</strong>
              <div className="mt-1">
                {renderStars(userRating.rating)}
                <span className="ms-2 text-muted">
                  Rated on {new Date(userRating.createdAt).toLocaleDateString()}
                </span>
              </div>
              {userRating.review && (
                <div className="mt-2">
                  <em>"{userRating.review}"</em>
                </div>
              )}
            </div>
            <Button
              variant="outline-primary"
              size="sm"
              onClick={() => setShowRatingModal(true)}
            >
              Update Rating
            </Button>
          </div>
        </div>
      );
    } else {
      return (
        <div className="mb-4 p-3 bg-light rounded text-center">
          <p className="mb-2">Share your experience with other students</p>
          <Button
            variant="primary"
            onClick={() => setShowRatingModal(true)}
          >
            Rate This Course
          </Button>
        </div>
      );
    }
  };

  if (loading) {
    return (
      <Card className="border-0 shadow-sm">
        <Card.Body className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading ratings...</span>
          </div>
        </Card.Body>
      </Card>
    );
  }

  return (
    <>
      <Card className="border-0 shadow-sm mb-4">
        <Card.Header className="bg-light">
          <h5 className="mb-0">
            <i className="bi bi-star-fill text-warning me-2"></i>
            Student Reviews & Ratings
          </h5>
        </Card.Header>
        <Card.Body>
          {/* Rating Overview */}
          {ratingStats && ratingStats.totalRatings > 0 ? (
            <Row className="mb-4">
              <Col md={6}>
                <div className="text-center">
                  <div className="display-4 fw-bold text-primary mb-2">
                    {ratingStats.averageRating.toFixed(1)}
                  </div>
                  <div className="mb-2">
                    {renderStars(Math.round(ratingStats.averageRating), 'lg')}
                  </div>
                  <p className="text-muted mb-0">
                    {ratingStats.totalRatings} review{ratingStats.totalRatings !== 1 ? 's' : ''}
                  </p>
                </div>
              </Col>
              <Col md={6}>
                <div className="rating-breakdown">
                  {[5, 4, 3, 2, 1].map(star => (
                    <div key={star} className="d-flex align-items-center mb-1">
                      <span className="me-2">{star} ★</span>
                      <ProgressBar
                        now={getRatingPercentage(star)}
                        className="flex-grow-1 me-2"
                        style={{ height: '12px' }}
                        variant={star >= 4 ? 'success' : star >= 3 ? 'warning' : 'danger'}
                      />
                      <small className="text-muted" style={{ minWidth: '40px' }}>
                        {Math.round(getRatingPercentage(star))}%
                      </small>
                    </div>
                  ))}
                </div>
              </Col>
            </Row>
          ) : (
            <div className="text-center py-4">
              <i className="bi bi-star display-4 text-muted mb-3"></i>
              <h6 className="text-muted">No reviews yet</h6>
              {isInstructor() || isAdmin() ? (
                <p className="text-muted">Students will be able to rate this course after enrollment.</p>
              ) : (
                <p className="text-muted">Be the first to review this course!</p>
              )}
            </div>
          )}

          {/* User's Rating Action */}
          {renderRatingActions()}

          {/* Recent Reviews */}
          {ratings.length > 0 && (
            <div>
              <h6 className="fw-bold mb-3">Recent Reviews</h6>
              {ratings.slice(0, 5).map((rating) => (
                <div key={rating._id} className="border-bottom pb-3 mb-3">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div>
                      <strong>{rating.userId.name}</strong>
                      {rating.isVerified && (
                        <Badge bg="success" className="ms-2" title="Completed the course">
                          <i className="bi bi-patch-check"></i> Verified
                        </Badge>
                      )}
                    </div>
                    <small className="text-muted">
                      {new Date(rating.createdAt).toLocaleDateString()}
                    </small>
                  </div>
                  <div className="mb-2">
                    {renderStars(rating.rating)}
                  </div>
                  {rating.review && (
                    <p className="mb-0">{rating.review}</p>
                  )}
                </div>
              ))}
              
              {ratings.length > 5 && (
                <div className="text-center">
                  <Button variant="outline-primary" size="sm">
                    View All Reviews ({ratings.length})
                  </Button>
                </div>
              )}
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Rating Modal - Only show if user can rate */}
      {canRate() && (
        <Modal show={showRatingModal} onHide={() => setShowRatingModal(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>
              {userRating ? 'Update Your Rating' : 'Rate This Course'}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={handleSubmitRating}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-bold">Your Rating</Form.Label>
                <div className="mb-2">
                  {renderStars(newRating, 'lg', true, setNewRating)}
                </div>
                <div className="text-muted">
                  {newRating === 1 && "Poor"}
                  {newRating === 2 && "Fair"}
                  {newRating === 3 && "Good"}
                  {newRating === 4 && "Very Good"}
                  {newRating === 5 && "Excellent"}
                </div>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="fw-bold">Review (Optional)</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  value={newReview}
                  onChange={(e) => setNewReview(e.target.value)}
                  placeholder="Share your thoughts about this course..."
                  maxLength={1000}
                />
                <Form.Text className="text-muted">
                  {newReview.length}/1000 characters
                </Form.Text>
              </Form.Group>

              <div className="d-flex gap-2">
                <Button
                  variant="secondary"
                  onClick={() => setShowRatingModal(false)}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  type="submit"
                  disabled={submitting}
                  className="flex-grow-1"
                >
                  {submitting ? 'Submitting...' : userRating ? 'Update Rating' : 'Submit Rating'}
                </Button>
              </div>
            </Form>
          </Modal.Body>
        </Modal>
      )}
    </>
  );
};

export default RatingComponent;