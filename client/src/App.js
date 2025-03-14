import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';

// Pages
import Home from './pages/Home';
import ChatRoom from './pages/ChatRoom';
import JoinRoom from './pages/JoinRoom';
import NotFound from './pages/NotFound';

// Auth route guard component
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/" />;
};

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/join" element={<JoinRoom />} />
            <Route 
              path="/room/:roomId" 
              element={
                <PrivateRoute>
                  <ChatRoom />
                </PrivateRoute>
              } 
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;