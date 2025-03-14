import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { roomAPI } from '../utils/api';
import { AuthContext } from '../contexts/AuthContext';

// Styled components
const Container = styled.div`
  max-width: 600px;
  margin: 0 auto;
  padding: 2rem;
  text-align: center;
`;

const Title = styled.h1`
  color: #2c3e50;
  margin-bottom: 2rem;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
`;

const Input = styled.input`
  padding: 0.75rem;
  font-size: 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
`;

const Button = styled.button`
  padding: 0.75rem;
  font-size: 1rem;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: #2980b9;
  }

  &:disabled {
    background-color: #95a5a6;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.p`
  color: #e74c3c;
`;

const Home = () => {
  const [roomName, setRoomName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    
    if (!roomName.trim() || !displayName.trim()) {
      setError('Room name and display name are required');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      // Call API to create room
      const data = await roomAPI.createRoom(roomName, displayName);
      
      // Update auth context with new room data
      login(data.token, data.user, data.room);
      
      // Navigate to room page
      navigate(`/room/${data.room.id}`);
    } catch (err) {
      console.error('Error creating room:', err);
      setError(err.response?.data?.error || 'Failed to create room. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container>
      <Title>Create a Private Chat Room</Title>
      
      <Form onSubmit={handleCreateRoom}>
        <Input
          type="text"
          placeholder="Room Name"
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
          disabled={isLoading}
        />
        
        <Input
          type="text"
          placeholder="Your Display Name"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          disabled={isLoading}
        />
        
        {error && <ErrorMessage>{error}</ErrorMessage>}
        
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Creating...' : 'Create Room'}
        </Button>
      </Form>
      
      <p>Already have an access code?</p>
      <Button onClick={() => navigate('/join')} disabled={isLoading}>
        Join Existing Room
      </Button>
    </Container>
  );
};

export default Home;