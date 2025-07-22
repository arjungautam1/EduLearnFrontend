import React, { createContext, useContext, useState } from 'react';

// Auth Context
const AuthContext = createContext();

// Auth Provider
export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  // Mock functions for testing
  const login = async (credentials) => {
    setLoading(true);
    // Mock login - always succeed for testing
    setTimeout(() => {
      setUser({ name: 'Test User', email: credentials.email, role: 'student' });
      setIsAuthenticated(true);
      setLoading(false);
    }, 1000);
    return { success: true };
  };

  const register = async (userData) => {
    setLoading(true);
    // Mock register - always succeed for testing
    setTimeout(() => {
      setUser({ name: userData.name, email: userData.email, role: userData.role });
      setIsAuthenticated(true);
      setLoading(false);
    }, 1000);
    return { success: true };
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
  };

  const isAdmin = () => user?.role === 'admin';
  const isInstructor = () => user?.role === 'instructor' || user?.role === 'admin';

  const value = {
    isAuthenticated,
    user,
    loading,
    login,
    register,
    logout,
    isAdmin,
    isInstructor,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};