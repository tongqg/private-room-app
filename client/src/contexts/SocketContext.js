import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { AuthContext } from './AuthContext';

export const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const { isAuthenticated, token, user, room } = useContext(AuthContext);

  useEffect(() => {
    // Only connect socket if authenticated
    if (isAuthenticated && token && room) {
      // Create socket connection with auth token
      const newSocket = io('/', {
        auth: { token }
      });

      // Socket event handlers
      newSocket.on('connect', () => {
        console.log('Socket connected');
        setConnected(true);
      });

      newSocket.on('disconnect', () => {
        console.log('Socket disconnected');
        setConnected(false);
      });

      newSocket.on('message.new', (message) => {
        setMessages(prevMessages => [...prevMessages, message]);
      });

      newSocket.on('user.joined', async ({ userId }) => {
        // Fetch updated user list when someone joins
        try {
          const response = await fetch(`/api/rooms/${room.id}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          const data = await response.json();
          setUsers(data.users);
        } catch (error) {
          console.error('Error fetching updated user list:', error);
        }
      });

      newSocket.on('user.left', ({ userId }) => {
        // Remove user from list when they leave
        setUsers(prevUsers => prevUsers.filter(u => u.id !== userId));
      });

      newSocket.on('room.closed', () => {
        // Handle room closure
        alert('This room has been closed by the admin.');
        window.location.href = '/'; // Redirect to home
      });

      newSocket.on('error', (error) => {
        console.error('Socket error:', error);
        alert(`Error: ${error.message}`);
      });

      // Save socket instance
      setSocket(newSocket);

      // Cleanup on unmount
      return () => {
        newSocket.disconnect();
      };
    }
  }, [isAuthenticated, token, room]);

  // Load initial messages and users when entering a room
  useEffect(() => {
    if (isAuthenticated && token && room && connected) {
      const loadRoomData = async () => {
        try {
          // Fetch room details including users
          const roomResponse = await fetch(`/api/rooms/${room.id}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          const roomData = await roomResponse.json();
          setUsers(roomData.users);

          // Fetch messages (assuming we have an endpoint for this)
          const messagesResponse = await fetch(`/api/rooms/${room.id}/messages`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          const messagesData = await messagesResponse.json();
          setMessages(messagesData.messages || []);
        } catch (error) {
          console.error('Error loading room data:', error);
        }
      };

      loadRoomData();
    }
  }, [isAuthenticated, token, room, connected]);

  // Send message function
  const sendMessage = (content) => {
    if (socket && connected && content.trim()) {
      socket.emit('message.send', { content });
    }
  };

  // Close room function (admin only)
  const closeRoom = () => {
    if (socket && connected && user.isAdmin) {
      socket.emit('room.close');
    }
  };

  return (
    <SocketContext.Provider value={{
      connected,
      messages,
      users,
      sendMessage,
      closeRoom
    }}>
      {children}
    </SocketContext.Provider>
  );
};