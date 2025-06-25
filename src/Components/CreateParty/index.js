import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate, useLocation } from 'react-router-dom';
import supabase from '../../utils/supabaseClient';
import { ButtonR } from '../ButtonRElement';

const PageContainer = styled.div`
    min-height: 100vh;
    background: #1a1a1a;
    display: flex;
    justify-content: center;
    align-items: flex-start;
    padding: 2rem;
`;

const CreatePartyContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    background: #1a1a1a;
    padding: 2rem;
    margin: 1rem auto;
    max-width: 600px;
    width: 100%;
    border-radius: 10px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
`;

const Form = styled.form`
    display: flex;
    flex-direction: column;
    gap: 1rem;
    width: 100%;
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

const Textarea = styled.textarea`
    padding: 0.75rem;
    border: none;
    border-radius: 5px;
    background: #333;
    color: #fff;
    font-size: 1rem;
    outline: none;
    resize: vertical;
    min-height: 100px;

    &::placeholder {
        color: #aaa;
    }
`;

const Label = styled.label`
    color: #fff;
    font-size: 1rem;
    font-weight: bold;
    margin-bottom: 0.25rem;
`;

const ErrorMessage = styled.p`
    color: #ff4444;
    font-size: 0.9rem;
    text-align: center;
    margin-top: 0.5rem;
    opacity: ${props => (props.isFading ? 0 : 1)};
    transition: opacity 1s ease-out;
`;

const SuccessMessage = styled.p`
    color: #01bf71;
    font-size: 0.9rem;
    text-align: center;
    margin-top: 0.5rem;
    opacity: ${props => (props.isFading ? 0 : 1)};
    transition: opacity 1s ease-out;
`;

const Button = styled.button`
    border-radius: 50px;
    background: ${({ primary }) => (primary ? '#01bf71' : '#010606')};
    padding: 0.75rem;
    color: ${({ dark }) => (dark ? '#010606' : '#fff')};
    font-size: 1rem;
    font-weight: bold;
    border: none;
    cursor: pointer;
    transition: all 0.2s ease-in-out;

    &:hover {
        background: ${({ primary }) => (primary ? '#fff' : '#01bf71')};
        color: #010606;
    }
`;

const CreateParty = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const selectedMarker = location.state?.selectedMarker || null;
    const [partyName, setPartyName] = useState('');
    const [tripDate, setTripDate] = useState('');
    const [tripDuration, setTripDuration] = useState('');
    const [description, setDescription] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isErrorFading, setIsErrorFading] = useState(false);
    const [isSuccessFading, setIsSuccessFading] = useState(false);

    useEffect(() => {
        if (!error) {
            setIsErrorFading(false);
            return;
        }
        const timer = setTimeout(() => {
            setIsErrorFading(true);
            setTimeout(() => setError(''), 1000);
        }, 5000);
        return () => clearTimeout(timer);
    }, [error]);

    useEffect(() => {
        if (!success) {
            setIsSuccessFading(false);
            return;
        }
        const timer = setTimeout(() => {
            setIsSuccessFading(true);
            setTimeout(() => {
                setSuccess('');
                navigate('/');
            }, 1000);
        }, 3000);
        return () => clearTimeout(timer);
    }, [success, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log('handleSubmit triggered', { partyName, tripDate, tripDuration, description, selectedMarker });

        if (!selectedMarker?.location_id) {
            console.log('Validation failed: No valid location selected');
            setError('No valid location selected. Please select a location from the map.');
            return;
        }

        if (!partyName) {
            console.log('Validation failed: Party name is required');
            setError('Party name is required');
            return;
        }

        if (!tripDate) {
            console.log('Validation failed: Trip date is required');
            setError('Trip date is required');
            return;
        }

        if (!tripDuration || tripDuration <= 0) {
            console.log('Validation failed: Trip duration must be a positive number');
            setError('Trip duration must be a positive number');
            return;
        }

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            console.log('Validation failed: Not authenticated', authError);
            setError('You must be logged in to create a party');
            return;
        }

        const { data: existingParty } = await supabase
            .from('parties')
            .select('id')
            .eq('location_id', selectedMarker.location_id)
            .eq('name', partyName)
            .single();

        if (existingParty) {
            console.log('Validation failed: Party name exists');
            setError('A party with this name already exists for this location');
            return;
        }

        console.log('Inserting party:', { name: partyName, leader_id: user.id, location_id: selectedMarker.location_id, trip_date: tripDate, trip_duration: parseInt(tripDuration), description });
        const { data, error } = await supabase
            .from('parties')
            .insert([{
                name: partyName,
                leader_id: user.id,
                location_id: selectedMarker.location_id,
                trip_date: tripDate,
                trip_duration: parseInt(tripDuration),
                description,
            }])
            .select()
            .single();

        if (error) {
            console.error('Create party error:', error);
            setError(`Failed to create party: ${error.message}`);
            return;
        }

        console.log('Party created, inserting party member:', { party_id: data.id, user_id: user.id });
        await supabase
            .from('party_members')
            .insert([{ party_id: data.id, user_id: user.id }]);

        console.log('Party creation successful');
        setSuccess('Party created successfully! Redirecting home...');
        setError('');
        setPartyName('');
        setTripDate('');
        setTripDuration('');
        setDescription('');
    };

    return (
        <PageContainer>
            <CreatePartyContainer>
                <h2 style={{ color: '#fff', fontSize: '1.5rem', marginBottom: '1rem' }}>
                    Create Party{selectedMarker ? ` at ${selectedMarker.name}` : ''}
                </h2>
                {error && <ErrorMessage isFading={isErrorFading}>{error}</ErrorMessage>}
                {success && <SuccessMessage isFading={isSuccessFading}>{success}</SuccessMessage>}
                <Form onSubmit={handleSubmit}>
                    <Label>Party Name</Label>
                    <Input
                        type="text"
                        placeholder="Enter party name"
                        value={partyName}
                        onChange={(e) => setPartyName(e.target.value)}
                    />
                    <Label>Trip Date</Label>
                    <Input
                        type="date"
                        value={tripDate}
                        onChange={(e) => setTripDate(e.target.value)}
                    />
                    <Label>Trip Duration (days)</Label>
                    <Input
                        type="number"
                        placeholder="Enter duration in days"
                        value={tripDuration}
                        onChange={(e) => setTripDuration(e.target.value)}
                        min="1"
                    />
                    <Label>Description</Label>
                    <Textarea
                        placeholder="Enter party description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                    <Button type="submit" primary="true" dark="true">
                        Create Party
                    </Button>
                    <ButtonR to="/" primary="true" dark="true">
                        Back to Home
                    </ButtonR>
                </Form>
            </CreatePartyContainer>
        </PageContainer>
    );
};

export default CreateParty;
