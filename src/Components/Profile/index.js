import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import supabase from '../../utils/supabaseClient';
import { ButtonR } from '../ButtonRElement';

const ProfileContainer = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    min-height: calc(100vh - 80px);
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
    margin: 0 1rem;
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
    appearance: none;
    background-image: url('data:image/svg+xml;utf8,<svg fill="white" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M7 10l5 5 5-5z"/></svg>');
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

const Profile = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        birthday: '',
        ast: '',
        password: '',
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [hover, setHover] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);


    useEffect(() => {
        const fetchUserData = async () => {
            const { data: { user }, error: authError } = await supabase.auth.getUser();
            if (authError || !user) {
                setError('You must be logged in to edit your profile');
                //setTimeout(() => navigate('/signin'), 2000);
                return;
            }
            
            setIsAuthenticated(true);

            const { data, error } = await supabase
                .from('profiles')
                .select('first_name, last_name, birthday, ast_level')
                .eq('id', user.id)
                .single();

            if (error) {
                console.error('Profile fetch error:', error);
                setError('Failed to load profile data');
                return;
            }

            setFormData({
                firstName: data.first_name || '',
                lastName: data.last_name || '',
                birthday: data.birthday || '',
                ast: data.ast_level || '',
                password: '',
            });
        };

        fetchUserData();
    }, [navigate]);

    const onHover = () => {
        setHover(!hover);
    };

    const handleSignOut = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error('Sign-out error:', error.message);
        } else {
            setIsAuthenticated(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const { firstName, lastName, birthday, ast, password } = formData;

        // Client-side validation
        if (!firstName || !lastName || !birthday || !ast) {
            setError('Please fill in all required fields');
            return;
        }
        const today = new Date();
        const birthDate = new Date(birthday);
        if (isNaN(birthDate.getTime()) || birthDate > today) {
            setError('Please enter a valid birthday');
            return;
        }
        if (password && password.length < 6) {
            setError('Password must be at least 6 characters long');
            return;
        }

        try {
            const { data: { user }, error: authError } = await supabase.auth.getUser();
            if (authError || !user) {
                setError('You must be logged in to update your profile');
                return;
            }

            // Update profile data
            const { error: profileError } = await supabase
                .from('profiles')
                .upsert([
                    {
                        id: user.id,
                        first_name: firstName,
                        last_name: lastName,
                        birthday,
                        ast_level: ast,
                    },
                ]);

            if (profileError) {
                console.error('Profile update error:', profileError);
                setError('Failed to update profile');
                return;
            }

            // Update password if provided
            if (password) {
                const { error: passwordError } = await supabase.auth.updateUser({
                    password,
                });

                if (passwordError) {
                    console.error('Password update error:', passwordError);
                    setError('Failed to update password');
                    return;
                }
            }

            setSuccess('Profile updated successfully!');
            setError('');
            setTimeout(() => {
                navigate('/');
            }, 2000);
        } catch (err) {
            console.error('Update error:', err);
            setError('Failed to connect to Supabase');
        }
    };

    return (
        <ProfileContainer>
            <FormWrapper>
                <FormTitle>Edit Profile</FormTitle>
                {error && <ErrorMessage>{error}</ErrorMessage>}
                {success && <SuccessMessage>{success}</SuccessMessage>}
                {isAuthenticated && 
                <Form onSubmit={handleSubmit}>
                    <Label>First Name</Label>
                    <Input
                        type="text"
                        name="firstName"
                        placeholder="First Name"
                        value={formData.firstName}
                        onChange={handleChange}
                    />
                    <Label>Last Name</Label>
                    <Input
                        type="text"
                        name="lastName"
                        placeholder="Last Name"
                        value={formData.lastName}
                        onChange={handleChange}
                    />
                    <Label>Birthday</Label>
                    <Input
                        type="date"
                        name="birthday"
                        value={formData.birthday}
                        onChange={handleChange}
                    />
                    <Label>AST Level</Label>
                    <Select
                        name="ast"
                        value={formData.ast}
                        onChange={handleChange}
                    >
                        <Option value="">Select AST Level</Option>
                        <Option value="None">None</Option>
                        <Option value="AST 1">AST 1</Option>
                        <Option value="AST 2">AST 2</Option>
                    </Select>
                    <Label>Password (leave blank to keep current)</Label>
                    <Input
                        type="password"
                        name="password"
                        placeholder="New Password"
                        value={formData.password}
                        onChange={handleChange}
                    />
                    <Button type="submit">Save Changes</Button>
                </Form>
                }

            </FormWrapper>
            <ButtonR
                to="/"
                onMouseEnter={onHover}
                onMouseLeave={onHover}
                primary="true"
                dark="true"
            >
                Home
            </ButtonR>

            {isAuthenticated && 
            <ButtonR
                to="/"
                onMouseEnter={onHover}
                onMouseLeave={onHover}
                onClick={handleSignOut}
                primary="true"
                dark="true"
            >
                Sign Out
            </ButtonR>
            }

            <ButtonR
                to="/signup"
                onMouseEnter={onHover}
                onMouseLeave={onHover}
                primary="true"
                dark="true"
            >
                Sign-up
            </ButtonR>
        </ProfileContainer>
    );
};

export default Profile;