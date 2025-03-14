import React, { useState, useContext, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { QRCodeSVG } from 'qrcode.react';
import { AuthContext } from '../contexts/AuthContext';
import { SocketContext } from '../contexts/SocketContext';

// Styled components
const Container = styled.div`
  display: grid;
  grid-template-columns: 1fr 4fr;
  grid-template-rows: auto 1fr auto;
  grid-template-areas:
    "header header"
    "sidebar chat"
    "sidebar input";
  height: 100vh;
  max-height: 100vh;
`;

const Header = styled.header`
  grid-area: header;
  background-color: #3498db;
  color: white;
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const RoomName = styled.h1`
  margin: 0;
  font-size: 1.5rem;
`;

const Sidebar = styled.div`
  grid-area: sidebar;
  background-color: #ecf0f1;
  padding: 1rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
`;

const UsersSection = styled.div`
  flex: 1;
  margin-bottom: 1rem;
`;

const ShareSection = styled.div`
  border-top: 1px solid #ddd;
  padding-top: 1rem;
`;

const QRContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 1rem;
`;

const UsersList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const UserItem = styled.li`
  padding: 0.5rem;
  border-radius: 4px;
  margin-bottom: 0.25rem;
  display: flex;
  align-items: center;
  
  ${props => props.isAdmin && `
    font-weight: bold;
    background-color: rgba(52, 152, 219, 0.1);
  `}
`;

const ChatArea = styled.div`
  grid-area: chat;
  padding: 1rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const Message = styled.div`
  padding: 0.75rem;
  border-radius: 8px;
  max-width: 80%;
  word-break: break-word;
  
  ${props => props.isMine ? `
    align-self: flex-end;
    background-color: #3498db;
    color: white;
  ` : `
    align-self: flex-start;
    background-color: #ecf0f1;
  `}
`;

const MessageHeader = styled.div`
  font-weight: bold;
  font-size: 0.85rem;
  margin-bottom: 0.25rem;
`;

const MessageTime = styled.span`
  font-size: 0.7rem;
  opacity: 0.7;
  margin-left: 0.5rem;
`;

const InputArea = styled.form`
  grid-area: input;
  padding: 1rem;
  display: flex;
  gap: 0.5rem;
  border-top: 1px solid #ddd;
`;

const Input = styled.input`
  flex: 1;
  padding: 0.75rem;
  font-size: 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
`;

const Button = styled.button`
  padding: 0.75rem 1.5rem;
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

const AdminButton = styled(Button)`
  background-color: #e74c3c;
  
  &:hover {
    background-color: #c0392b;
  }
`;

const ChatRoom = () => {
  const [messageInput, setMessageInput] = useState('');
  const { roomId } = useParams();
  const navigate = useNavigate();
  const chatAreaRef = useRef(null);
  
  const { user, room, logout } = useContext(AuthContext);
  const { messages, users, connected, sendMessage, closeRoom } = useContext(SocketContext);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (chatAreaRef.current) {
      chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight;
    }
  }, [messages]);

  // Generate room join URL for QR code
  const joinUrl = `${window.location.origin}/join?code=${room?.accessCode}`;

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (messageInput.trim() && connected) {
      sendMessage(messageInput.trim());
      setMessageInput('');
    }
  };

  const handleCloseRoom = () => {
    if (window.confirm('Are you sure you want to close this room? This cannot be undone.')) {
      closeRoom();
      logout();
      navigate('/');
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!user || !room) {
    return <div>Loading...</div>;
  }

  return (
    <Container>
      <Header>
        <RoomName>{room.name}</RoomName>
        <Button onClick={logout}>Leave Room</Button>
      </Header>
      
      <Sidebar>
        <UsersSection>
          <h3>Users ({users.length})</h3>
          <UsersList>
            {users.map(u => (
              <UserItem key={u.id} isAdmin={u.isAdmin}>
                {u.displayName} {u.isAdmin && '(Admin)'}
                {u.id === user.id && ' (You)'}
              </UserItem>
            ))}
          </UsersList>
        </UsersSection>
        
        <ShareSection>
          <h3>Invite Others</h3>
          <p>Share this access code: <strong>{room.accessCode}</strong></p>
          <QRContainer>
            <QRCodeSVG value={joinUrl} size={128} />
            <small>Scan to join</small>
          </QRContainer>
          
          {user.isAdmin && (
            <AdminButton onClick={handleCloseRoom} style={{ marginTop: '1rem' }}>
              Close Room
            </AdminButton>
          )}
        </ShareSection>
      </Sidebar>
      
      <ChatArea ref={chatAreaRef}>
        {messages.map(message => (
          <Message key={message.id} isMine={message.userId === user.id}>
            <MessageHeader>
              {message.userId === user.id ? 'You' : message.displayName}
              <MessageTime>{formatTime(message.timestamp)}</MessageTime>
            </MessageHeader>
            {message.content}
          </Message>
        ))}
        {messages.length === 0 && (
          <p style={{ textAlign: 'center', opacity: 0.7 }}>
            No messages yet. Start the conversation!
          </p>
        )}
      </ChatArea>
      
      <InputArea onSubmit={handleSendMessage}>
        <Input
          type="text"
          placeholder="Type your message..."
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
          disabled={!connected}
        />
        <Button type="submit" disabled={!connected || !messageInput.trim()}>
          Send
        </Button>
      </InputArea>
    </Container>
  );
};

export default ChatRoom;