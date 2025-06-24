import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import supabase from '../../utils/supabaseClient';
import { ButtonR } from '../ButtonRElement';

const SignUpContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 80px); /* Adjust for navbar height */
  background: #000;
  gap: 1rem;
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

const Label = styled.label`
  color: #fff;
  font-size: 1rem;
  margin-bottom: 0.25rem;
  text-align: left;
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

const Select = styled.select`
  padding: 0.75rem;
  border: none;
  border-radius: 5px;
  background: #333;
  color: #fff;
  font-size: 1rem;
  outline: none;
  cursor: pointer;
  appearance: none; /* Remove default browser styling */
  background-image: url('data:image/svg+xml;utf8,<svg fill="white" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M7 10l5 5 5-5z"/></svg>'); /* Custom dropdown arrow */
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  background-size: 1rem;
`;

const Option = styled.option`
  background: #333;
  color: #fff;
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

const SuccessMessage = styled.p`
  color: #01bf71;
  font-size: 0.9rem;
  text-align: center;
`;

const SignUp = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        birthday: '',
        ast: '',
        password: '',
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [hover, setHover] = useState(false);
  
    const onHover = () => {
        setHover(!hover)
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const { firstName, lastName, email, birthday, ast, password } = formData;
        // Basic email validation - Client-side
        if (!firstName || !lastName || !email || !birthday || !ast || !password) {
        setError('Please fill in all fields');
        return;
        }
        if (!/\S+@\S+\.\S+/.test(email)) {
        setError('Please enter a valid email address');
        return;
        }
        // Basic birthday validation (YYYY-MM-DD format)
        const today = new Date();
        const birthDate = new Date(birthday);
        if (isNaN(birthDate.getTime()) || birthDate > today) {
        setError('Please enter a valid birthday');
        return;
        }
        if (password.length < 6) {
        setError('Password must be at least 6 characters long');
        return;
        }
        
        try {
            // Sign up with Supabase Auth
            const { error: authError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                data: {
                    first_name: firstName,
                    last_name: lastName,
                    birthday,
                    ast_level: ast,
                },
                emailRedirectTo: 'http://localhost:3000/welcome',
                },
            });

            if (authError) {
                setError(authError.message || 'Sign-up failed');
                return;
            }

            setSuccess('Sign-up successful! Check your email to confirm your account.');
            setError('');
            setTimeout(() => {
                navigate('/');
            }, 3000); // Redirect after 3 seconds
        } catch (err) {
            console.error('Sign-up error:', err);
            setError('Failed to connect to Supabase');
        }

    };

  return (
    <SignUpContainer>
      <FormWrapper>
        <FormTitle>Sign Up</FormTitle>
        {error && <ErrorMessage>{error}</ErrorMessage>}
        {success && <SuccessMessage>{success}</SuccessMessage>}
        <Form onSubmit={handleSubmit}>
          <Input
            type="text"
            name="firstName"
            placeholder="First Name"
            value={formData.firstName}
            onChange={handleChange}
          />
          <Input
            type="text"
            name="lastName"
            placeholder="Last Name"
            value={formData.lastName}
            onChange={handleChange}
          />
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

          <Label>Birthday</Label>
          <Input
            type="date"
            name="birthday"
            id="birthday"
            value={formData.birthday}
            onChange={handleChange}
          />

          <Label>AST Level</Label>
          <Select
            name="ast"
            id="ast"
            value={formData.ast}
            onChange={handleChange}
          >
            <Option value="">Select AST Level</Option>
            <Option value="None">None</Option>
            <Option value="AST 1">AST 1</Option>
            <Option value="AST 2">AST 2</Option>
          </Select>

          <Button type="submit">Sign Up</Button>
        </Form>
      </FormWrapper>
    <ButtonR 
        to="/" 
        onMouseEnter={onHover} 
        onMouseLeave={onHover}
        primary='true'
        dark='true'
    >
        Home
    </ButtonR>
    </SignUpContainer>
  );
};

export default SignUp;