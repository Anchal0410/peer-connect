import React, { createContext, useState, useEffect } from "react";
import axios from "axios";

// Create auth API service
const authAPI = {
  login: (email, password) => {
    return axios.post("http://localhost:5000/api/auth/login", {
      email,
      password,
    });
  },
  register: (userData) => {
    return axios.post("http://localhost:5000/api/auth/register", userData);
  },
  getCurrentUser: () => {
    const token = localStorage.getItem("token");
    if (!token) return Promise.reject("No token found");

    return axios.get("http://localhost:5000/api/auth/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
};

// Create the auth context
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Check for existing auth on load
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");
      const userData = localStorage.getItem("userData");

      if (token && userData) {
        try {
          // Set auth headers for all future requests
          axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

          // Set user from localStorage initially
          const user = JSON.parse(userData);
          setCurrentUser(user);
          setIsAuthenticated(true);

          // Verify token with backend (optional, but recommended)
          const response = await authAPI.getCurrentUser();
          setCurrentUser(response.data);
        } catch (error) {
          console.error("Auth verification failed:", error);
          // Clear invalid auth data
          logout();
        }
      }

      setIsLoading(false);
    };

    checkAuth();
  }, []);

  // Login function
  const login = async (email, password) => {
    setAuthError(null);
    try {
      console.log("Login attempt with:", { email, password });

      const response = await authAPI.login(email, password);
      console.log("Login response:", response.data);

      const { token, user } = response.data;

      // Set auth header for all future requests
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      // Store in localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("userData", JSON.stringify(user));

      // Update state
      setCurrentUser(user);
      setIsAuthenticated(true);

      console.log("Auth state after login:", { user, isAuthenticated: true });

      return user;
    } catch (error) {
      console.error("Login error:", error);
      setAuthError(error.response?.data?.message || "Login failed");
      throw error;
    }
  };

  // Register function
  const register = async (userData) => {
    setAuthError(null);
    try {
      const response = await authAPI.register(userData);
      const { token, user } = response.data;

      // Set auth header for all future requests
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      // Store in localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("userData", JSON.stringify(user));

      // Update state
      setCurrentUser(user);
      setIsAuthenticated(true);

      return user;
    } catch (error) {
      console.error("Registration error:", error);
      setAuthError(error.response?.data?.message || "Registration failed");
      throw error;
    }
  };

  // Logout function
  const logout = () => {
    // Remove auth header
    delete axios.defaults.headers.common["Authorization"];

    // Clear localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("userData");

    // Reset state
    setCurrentUser(null);
    setIsAuthenticated(false);
    setAuthError(null);
  };

  // Auth context value
  const contextValue = {
    currentUser,
    setCurrentUser,
    isAuthenticated,
    setIsAuthenticated,
    isLoading,
    authError,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

export default AuthProvider;
