import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const WelcomeContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 80px);
  background: #000;
  color: #fff;
`;

const Welcome = () => {
  const navigate = useNavigate();

  setTimeout(() => {
    navigate('/');
  }, 3000);

  return (
    <WelcomeContainer>
      <h2>Email Verified!</h2>
      <p>Redirecting to home page...</p>
    </WelcomeContainer>
  );
};

export default Welcome;