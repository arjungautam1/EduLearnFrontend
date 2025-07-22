import React from 'react';
import { Navbar as BootstrapNavbar, Nav, Container, NavDropdown } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const { isAuthenticated, user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <BootstrapNavbar expand="lg" className="navbar">
      <Container>
        <LinkContainer to="/">
          <BootstrapNavbar.Brand>
            <strong>EduLearn</strong>
          </BootstrapNavbar.Brand>
        </LinkContainer>

        <BootstrapNavbar.Toggle aria-controls="basic-navbar-nav" />
        <BootstrapNavbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <LinkContainer to="/">
              <Nav.Link>Home</Nav.Link>
            </LinkContainer>
            <LinkContainer to="/courses">
              <Nav.Link>Courses</Nav.Link>
            </LinkContainer>
            {isAuthenticated && (
              <LinkContainer to="/dashboard">
                <Nav.Link>Dashboard</Nav.Link>
              </LinkContainer>
            )}
          </Nav>

          <Nav>
            {isAuthenticated ? (
              <NavDropdown title={user?.name || 'User'} id="user-dropdown">
                <LinkContainer to="/dashboard">
                  <NavDropdown.Item>
                    <i className="bi bi-speedometer2 me-2"></i>
                    Dashboard
                  </NavDropdown.Item>
                </LinkContainer>
                {isAdmin() && (
                  <LinkContainer to="/admin">
                    <NavDropdown.Item>
                      <i className="bi bi-gear me-2"></i>
                      Admin Panel
                    </NavDropdown.Item>
                  </LinkContainer>
                )}
                <NavDropdown.Divider />
                <NavDropdown.Item onClick={handleLogout}>
                  <i className="bi bi-box-arrow-right me-2"></i>
                  Logout
                </NavDropdown.Item>
              </NavDropdown>
            ) : (
              <>
                <LinkContainer to="/login">
                  <Nav.Link>Login</Nav.Link>
                </LinkContainer>
                <LinkContainer to="/register">
                  <Nav.Link>Register</Nav.Link>
                </LinkContainer>
              </>
            )}
          </Nav>
        </BootstrapNavbar.Collapse>
      </Container>
    </BootstrapNavbar>
  );
};

export default Navbar;