import React from 'react';
import { Navbar, Nav, Container, NavDropdown } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const NavbarComponent = () => {
  const { isAuthenticated, user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <Navbar expand="lg" className="navbar shadow-sm">
      <Container>
        <Link to="/" className="navbar-brand">
          <strong>EduLearn</strong>
        </Link>

        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Link to="/" className="nav-link">Home</Link>
            <Link to="/courses" className="nav-link">Courses</Link>
            {isAuthenticated && (
              <Link to="/dashboard" className="nav-link">Dashboard</Link>
            )}
          </Nav>

          <Nav>
            {isAuthenticated ? (
              <NavDropdown title={user?.name || 'User'} id="user-dropdown">
                <Link to="/dashboard" className="dropdown-item">
                  <i className="bi bi-speedometer2 me-2"></i>
                  Dashboard
                </Link>
                {isAdmin() && (
                  <Link to="/admin" className="dropdown-item">
                    <i className="bi bi-gear me-2"></i>
                    Admin Panel
                  </Link>
                )}
                <hr className="dropdown-divider" />
                <button className="dropdown-item" onClick={handleLogout}>
                  <i className="bi bi-box-arrow-right me-2"></i>
                  Logout
                </button>
              </NavDropdown>
            ) : (
              <div className="d-flex gap-2">
                <Link to="/login" className="btn btn-outline-primary">
                  Login
                </Link>
                <Link to="/register" className="btn btn-primary">
                  Register
                </Link>
              </div>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavbarComponent;