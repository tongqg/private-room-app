# Private Room Chat Application

## Overview
A web-based chat application that allows users to create private chat rooms and invite others through QR codes.

## Features
- Create private chat rooms
- Generate unique QR codes for room access
- Real-time chat functionality
- Room administration capabilities
- Simple user registration with display names

## Technical Architecture

### Frontend
- React.js for UI components
- WebSocket for real-time communication
- QR code generation library (qrcode.react)
- Styled-components for styling

### Backend
- Node.js with Express
- Socket.IO for WebSocket handling
- SQlite for data storage
- JWT for room authentication

## Data Models

### Room
```typescript
{
  id: string;
  name: string;
  adminId: string;
  createdAt: Date;
  active: boolean;
  accessCode: string;
}
```

### User
```typescript
{
  id: string;
  displayName: string;
  roomId: string;
  isAdmin: boolean;
  joinedAt: Date;
}
```

### Message
```typescript
{
  id: string;
  roomId: string;
  userId: string;
  content: string;
  timestamp: Date;
}
```

## API Endpoints

### Room Management
- POST /api/rooms - Create new room
- GET /api/rooms/:roomId - Get room details
- POST /api/rooms/:roomId/join - Join room with access code

### Chat Operations
- WebSocket events for:
  - message.new
  - user.join
  - user.leave
  - room.close

## User Flow
1. Admin creates a new room
2. System generates unique QR code and access URL
3. Others scan QR code to access room
4. Users enter display name to join
5. Real-time chat begins
6. Admin can moderate and close room

## Security Considerations
- Rate limiting for room creation
- Access code encryption
- Message sanitization
- Room expiry after inactivity

## Future Enhancements
- File sharing
- End-to-end encryption
- Room templates
- User authentication
- Message history
