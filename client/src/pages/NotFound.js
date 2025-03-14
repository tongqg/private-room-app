import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

const Container = styled.div`
  max-width: 600px;
  margin: 0 auto;
  padding: 2rem;
  text-align: center;
`;

const Title = styled.h1`
  color: #e74c3c;
  margin-bottom: 1rem;
`;

const StyledLink = styled(Link)`
  display: inline-block;
  margin-top: 2rem;
  padding: 0.75rem 1.5rem;
  background-color: #3498db;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  transition: background-color 0.3s;

  &:hover {
    background-color: #2980b9;
  }
`;

const NotFound = () => {
  return (
    <Container>
      <Title>Page Not Found</Title>
      <p>The page you are looking for doesn't exist or has been moved.</p>
      <StyledLink to="/">Return to Home</StyledLink>
    </Container>
  );
};

export default NotFound;