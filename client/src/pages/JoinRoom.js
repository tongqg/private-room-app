import React, { useState, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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

const JoinRoom = () => {
  const [accessCode, setAccessCode] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  // Extract access code from query params if available (from QR code scan)
  React.useEffect(() => {
    const params = new URLSearchParams(location.search);
    const code = params.get('code');
    if (code) {
      setAccessCode(code);
    }
  }, [location]);

  const handleJoinRoom = async (e) => {
    e.preventDefault();
    
    if (!accessCode.trim() || !displayName.trim()) {
      setError('Access code and display name are required');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      // Call API to join room
      const data = await roomAPI.joinRoom(accessCode, displayName);
      
      // Update auth context with new room data
      login(data.token, data.user, data.room);
      
      // Navigate to room page
      navigate(`/room/${data.room.id}`);
    } catch (err) {
      console.error('Error joining room:', err);
      setError(err.response?.data?.error || 'Failed to join room. Please check your access code.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container>
      <Title>Join Private Chat Room</Title>
      
      <Form onSubmit={handleJoinRoom}>
        <Input
          type="text"
          placeholder="Access Code"
          value={accessCode}
          onChange={(e) => setAccessCode(e.target.value)}
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
          {isLoading ? 'Joining...' : 'Join Room'}
        </Button>
      </Form>
      
      <p>Need to create a new room?</p>
      <Button onClick={() => navigate('/')} disabled={isLoading}>
        Create Room
      </Button>
    </Container>
  );
};

export default JoinRoom;