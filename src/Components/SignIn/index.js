import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const SignInContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 80px); /* Adjust for navbar height */
  background: #000;
`;

const FormWrapper = styled.div`
  background: #1a1a1a;
  padding: 2rem;
  border-radius: 10px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  margin: 0 1rem; /* Add margin for mobile */
`;

const FormTitle = styled.h2`
  color: #fff;
  font-size: 2rem;
  font-weight: bold;
  text-align: center;
  margin-bottom: 1.5rem;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Input = styled.input`
  padding: 0.75rem;
  border: none;
  border-radius: 5px;
  background: #333;
  color: #fff;
  font-size: 1rem;
  outline: none;

  &::placeholder {
    color: #aaa;
  }
`;

const Button = styled.button`
  border-radius: 50px;
  background: #01bf71;
  padding: 0.75rem;
  color: #010606;
  font-size: 1rem;
  font-weight: bold;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease-in-out;

  &:hover {
    background: #fff;
    color: #010606;
  }
`;

const ErrorMessage = styled.p`
  color: #ff4444;
  font-size: 0.9rem;
  text-align: center;
`;

const SignIn = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }
    // Simulate API call for sign-in
    console.log('Sign In:', formData);
    setError('');
    navigate('/'); // Redirect to home after successful sign-in
  };

  return (
    <SignInContainer>
      <FormWrapper>
        <FormTitle>Sign In</FormTitle>
        {error && <ErrorMessage>{error}</ErrorMessage>}
        <Form onSubmit={handleSubmit}>
          <Input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
          />
          <Input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
          />
          <Button type="submit">Sign In</Button>
        </Form>
      </FormWrapper>
    </SignInContainer>
  );
};

export default SignIn;