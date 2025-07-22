import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Table, Button, Badge, Tab, Tabs, Form, Modal, Alert } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import { adminAPI } from '../services/api';

const AdminPanel = () => {
  const { isAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCourses: 0,
    totalEnrollments: 0,
    revenue: 0
  });
  const [loading, setLoading] = useState(true);
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userAction, setUserAction] = useState('');

  const fetchAdminData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch all data in parallel
      const [usersResponse, coursesResponse, statsResponse] = await Promise.all([
        adminAPI.getAllUsers(),
        adminAPI.getAllCourses(),
        adminAPI.getStats()
      ]);

      if (usersResponse.success) setUsers(usersResponse.data);
      if (coursesResponse.success) setCourses(coursesResponse.data);
      if (statsResponse.success) setStats(statsResponse.data);
      
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAdmin()) {
      fetchAdminData();
    }
  }, [isAdmin, fetchAdminData]);

  const handleUserAction = async (user, action) => {
    setSelectedUser(user);
    setUserAction(action);
    setShowUserModal(true);
  };

  const confirmUserAction = async () => {
    try {
      let response;
      
      switch (userAction) {
        case 'activate':
          response = await adminAPI.updateUserStatus(selectedUser._id, { active: true });
          break;
        case 'deactivate':
          response = await adminAPI.updateUserStatus(selectedUser._id, { active: false });
          break;
        case 'promote':
          response = await adminAPI.updateUserRole(selectedUser._id, { role: 'instructor' });
          break;
        case 'demote':
          response = await adminAPI.updateUserRole(selectedUser._id, { role: 'student' });
          break;
        case 'delete':
          response = await adminAPI.deleteUser(selectedUser._id);
          break;
        default:
          return;
      }

      if (response.success) {
        await fetchAdminData(); // Refresh data
        setShowUserModal(false);
      }
    } catch (error) {
      console.error('Error performing user action:', error);
    }
  };

  const getUserRoleBadge = (role) => {
    const variants = {
      admin: 'danger',
      instructor: 'warning',
      student: 'primary'
    };
    return <Badge bg={variants[role] || 'secondary'}>{role}</Badge>;
  };

  const getCourseStatusBadge = (status) => {
    const variants = {
      published: 'success',
      draft: 'warning',
      archived: 'secondary'
    };
    return <Badge bg={variants[status] || 'secondary'}>{status}</Badge>;
  };

  if (!isAdmin()) {
    return (
      <Container className="py-5">
        <Alert variant="danger" className="text-center">
          <h4>Access Denied</h4>
          <p>You don't have permission to access the admin panel.</p>
        </Alert>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container className="py-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 text-muted">Loading admin panel...</p>
        </div>
      </Container>
    );
  }

  return (
    <div className="admin-panel py-5">
      <Container>
        {/* Header */}
        <Row className="mb-4">
          <Col>
            <h1 className="fw-bold">
              <i className="bi bi-gear me-2"></i>
              Admin Panel
            </h1>
            <p className="text-muted lead">Manage users, courses, and platform settings</p>
          </Col>
        </Row>

        {/* Stats Cards */}
        <Row className="mb-5">
          <Col md={3} sm={6} className="mb-4">
            <Card className="text-center border-0 shadow-sm h-100">
              <Card.Body>
                <i className="bi bi-people display-4 text-primary mb-3"></i>
                <h3 className="fw-bold">{stats.totalUsers || users.length}</h3>
                <p className="text-muted mb-0">Total Users</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3} sm={6} className="mb-4">
            <Card className="text-center border-0 shadow-sm h-100">
              <Card.Body>
                <i className="bi bi-book display-4 text-success mb-3"></i>
                <h3 className="fw-bold">{stats.totalCourses || courses.length}</h3>
                <p className="text-muted mb-0">Total Courses</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3} sm={6} className="mb-4">
            <Card className="text-center border-0 shadow-sm h-100">
              <Card.Body>
                <i className="bi bi-person-check display-4 text-info mb-3"></i>
                <h3 className="fw-bold">{stats.totalEnrollments || 0}</h3>
                <p className="text-muted mb-0">Total Enrollments</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3} sm={6} className="mb-4">
            <Card className="text-center border-0 shadow-sm h-100">
              <Card.Body>
                <i className="bi bi-currency-dollar display-4 text-warning mb-3"></i>
                <h3 className="fw-bold">${stats.revenue || 0}</h3>
                <p className="text-muted mb-0">Total Revenue</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Management Tabs */}
        <Tabs defaultActiveKey="users" className="mb-4">
          {/* Users Management */}
          <Tab eventKey="users" title={`Users (${users.length})`}>
            <Card className="border-0 shadow-sm">
              <Card.Header className="bg-white">
                <div className="d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">User Management</h5>
                  <Form.Control
                    type="search"
                    placeholder="Search users..."
                    style={{ maxWidth: '300px' }}
                  />
                </div>
              </Card.Header>
              <Card.Body className="p-0">
                <Table responsive hover className="mb-0">
                  <thead className="bg-light">
                    <tr>
                      <th>User</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Join Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user._id}>
                        <td>
                          <div className="d-flex align-items-center">
                            <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-2" 
                                 style={{ width: '32px', height: '32px' }}>
                              {user.name.charAt(0).toUpperCase()}
                            </div>
                            <span className="fw-semibold">{user.name}</span>
                          </div>
                        </td>
                        <td>{user.email}</td>
                        <td>{getUserRoleBadge(user.role)}</td>
                        <td>
                          <Badge bg={user.isActive ? 'success' : 'danger'}>
                            {user.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </td>
                        <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                        <td>
                          <div className="d-flex gap-1">
                            {user.isActive ? (
                              <Button 
                                variant="outline-danger" 
                                size="sm"
                                onClick={() => handleUserAction(user, 'deactivate')}
                              >
                                Deactivate
                              </Button>
                            ) : (
                              <Button 
                                variant="outline-success" 
                                size="sm"
                                onClick={() => handleUserAction(user, 'activate')}
                              >
                                Activate
                              </Button>
                            )}
                            
                            {user.role === 'student' && (
                              <Button 
                                variant="outline-warning" 
                                size="sm"
                                onClick={() => handleUserAction(user, 'promote')}
                              >
                                Promote
                              </Button>
                            )}
                            
                            {user.role === 'instructor' && (
                              <Button 
                                variant="outline-secondary" 
                                size="sm"
                                onClick={() => handleUserAction(user, 'demote')}
                              >
                                Demote
                              </Button>
                            )}
                            
                            <Button 
                              variant="outline-danger" 
                              size="sm"
                              onClick={() => handleUserAction(user, 'delete')}
                            >
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </Tab>

          {/* Courses Management */}
          <Tab eventKey="courses" title={`Courses (${courses.length})`}>
            <Card className="border-0 shadow-sm">
              <Card.Header className="bg-white">
                <div className="d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">Course Management</h5>
                  <Button variant="success">
                    <i className="bi bi-plus-circle me-2"></i>
                    Add New Course
                  </Button>
                </div>
              </Card.Header>
              <Card.Body className="p-0">
                <Table responsive hover className="mb-0">
                  <thead className="bg-light">
                    <tr>
                      <th>Course</th>
                      <th>Instructor</th>
                      <th>Category</th>
                      <th>Price</th>
                      <th>Students</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {courses.map((course) => (
                      <tr key={course._id}>
                        <td>
                          <div>
                            <div className="fw-semibold">{course.title}</div>
                            <small className="text-muted">{course.duration}</small>
                          </div>
                        </td>
                        <td>{typeof course.instructor === 'object' ? course.instructor.name : course.instructor}</td>
                        <td>
                          <Badge bg="primary">{course.category}</Badge>
                        </td>
                        <td>${course.price}</td>
                        <td>{course.studentsEnrolled || 0}</td>
                        <td>{getCourseStatusBadge(course.status || 'published')}</td>
                        <td>
                          <div className="d-flex gap-1">
                            <Button variant="outline-primary" size="sm">
                              Edit
                            </Button>
                            <Button variant="outline-info" size="sm">
                              Analytics
                            </Button>
                            <Button variant="outline-danger" size="sm">
                              Archive
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </Tab>

          {/* Analytics */}
          <Tab eventKey="analytics" title="Analytics">
            <Row>
              <Col md={6} className="mb-4">
                <Card className="border-0 shadow-sm">
                  <Card.Header>
                    <h6 className="mb-0">User Registration Trends</h6>
                  </Card.Header>
                  <Card.Body className="text-center py-5">
                    <i className="bi bi-graph-up display-4 text-muted mb-3"></i>
                    <p className="text-muted">Analytics charts would be implemented here</p>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={6} className="mb-4">
                <Card className="border-0 shadow-sm">
                  <Card.Header>
                    <h6 className="mb-0">Course Enrollment Stats</h6>
                  </Card.Header>
                  <Card.Body className="text-center py-5">
                    <i className="bi bi-pie-chart display-4 text-muted mb-3"></i>
                    <p className="text-muted">Course analytics would be displayed here</p>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={6} className="mb-4">
                <Card className="border-0 shadow-sm">
                  <Card.Header>
                    <h6 className="mb-0">Revenue Overview</h6>
                  </Card.Header>
                  <Card.Body className="text-center py-5">
                    <i className="bi bi-bar-chart display-4 text-muted mb-3"></i>
                    <p className="text-muted">Revenue charts would be shown here</p>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={6} className="mb-4">
                <Card className="border-0 shadow-sm">
                  <Card.Header>
                    <h6 className="mb-0">Platform Activity</h6>
                  </Card.Header>
                  <Card.Body className="text-center py-5">
                    <i className="bi bi-activity display-4 text-muted mb-3"></i>
                    <p className="text-muted">Activity metrics would be displayed here</p>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Tab>

          {/* Settings */}
          <Tab eventKey="settings" title="Settings">
            <Row>
              <Col md={6} className="mb-4">
                <Card className="border-0 shadow-sm">
                  <Card.Header>
                    <h6 className="mb-0">Platform Settings</h6>
                  </Card.Header>
                  <Card.Body>
                    <Form>
                      <div className="mb-3">
                        <Form.Label>Platform Name</Form.Label>
                        <Form.Control type="text" defaultValue="EduLearn" />
                      </div>
                      <div className="mb-3">
                        <Form.Label>Default Course Price</Form.Label>
                        <Form.Control type="number" defaultValue="99" />
                      </div>
                      <div className="mb-3">
                        <Form.Check 
                          type="checkbox" 
                          label="Allow free course creation"
                          defaultChecked 
                        />
                      </div>
                      <div className="mb-3">
                        <Form.Check 
                          type="checkbox" 
                          label="Require course approval"
                          defaultChecked 
                        />
                      </div>
                      <Button variant="primary">Save Settings</Button>
                    </Form>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={6} className="mb-4">
                <Card className="border-0 shadow-sm">
                  <Card.Header>
                    <h6 className="mb-0">Email Settings</h6>
                  </Card.Header>
                  <Card.Body>
                    <Form>
                      <div className="mb-3">
                        <Form.Label>SMTP Host</Form.Label>
                        <Form.Control type="text" placeholder="smtp.gmail.com" />
                      </div>
                      <div className="mb-3">
                        <Form.Label>SMTP Port</Form.Label>
                        <Form.Control type="number" defaultValue="587" />
                      </div>
                      <div className="mb-3">
                        <Form.Check 
                          type="checkbox" 
                          label="Send welcome emails"
                          defaultChecked 
                        />
                      </div>
                      <div className="mb-3">
                        <Form.Check 
                          type="checkbox" 
                          label="Send course completion emails"
                          defaultChecked 
                        />
                      </div>
                      <Button variant="primary">Save Email Settings</Button>
                    </Form>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Tab>
        </Tabs>

        {/* User Action Confirmation Modal */}
        <Modal show={showUserModal} onHide={() => setShowUserModal(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>Confirm Action</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {selectedUser && (
              <p>
                Are you sure you want to <strong>{userAction}</strong> the user{' '}
                <strong>{selectedUser.name}</strong> ({selectedUser.email})?
              </p>
            )}
            {userAction === 'delete' && (
              <Alert variant="warning">
                <i className="bi bi-exclamation-triangle me-2"></i>
                This action cannot be undone!
              </Alert>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowUserModal(false)}>
              Cancel
            </Button>
            <Button 
              variant={userAction === 'delete' ? 'danger' : 'primary'}
              onClick={confirmUserAction}
            >
              {userAction === 'delete' ? 'Delete User' : 'Confirm'}
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </div>
  );
};

export default AdminPanel;