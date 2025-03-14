import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    token: null,
    user: null,
    room: null,
    loading: true
  });

  useEffect(() => {
    // Check for stored auth data on component mount
    const loadAuthData = () => {
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');
      const room = localStorage.getItem('room');

      if (token && user && room) {
        setAuthState({
          isAuthenticated: true,
          token,
          user: JSON.parse(user),
          room: JSON.parse(room),
          loading: false
        });
      } else {
        setAuthState({
          isAuthenticated: false,
          token: null,
          user: null,
          room: null,
          loading: false
        });
      }
    };

    loadAuthData();
  }, []);

  const login = (token, user, room) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('room', JSON.stringify(room));
    
    setAuthState({
      isAuthenticated: true,
      token,
      user,
      room,
      loading: false
    });
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('room');
    
    setAuthState({
      isAuthenticated: false,
      token: null,
      user: null,
      room: null,
      loading: false
    });
  };

  return (
    <AuthContext.Provider value={{ ...authState, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};