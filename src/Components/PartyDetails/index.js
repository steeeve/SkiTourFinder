import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate, useParams } from 'react-router-dom';
import supabase from '../../utils/supabaseClient';
import { ButtonR } from '../ButtonRElement';

const PageContainer = styled.div`
    min-height: 100vh;
    background:rgba(26, 26, 26, 0.78);
    display: flex;
    justify-content: center;
    align-items: flex-start;
    padding: 2rem;
`;

const PartyDetailsContainer = styled.div`
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

const Title = styled.h2`
    color: #fff;
    font-size: 1.5rem;
    margin-bottom: 1rem;
    text-align: center;
`;

const DetailItem = styled.div`
    width: 100%;
    margin-bottom: 1rem;
`;

const Label = styled.label`
    color: #fff;
    font-size: 1rem;
    font-weight: bold;
    margin-bottom: 0.25rem;
    display: block;
`;

const Value = styled.p`
    color: #fff;
    font-size: 1rem;
    background: #333;
    padding: 0.75rem;
    border-radius: 5px;
`;

const Button = styled.button`
    border-radius: 50px;
    background: ${({ primary, danger }) => (danger ? '#ff4444' : primary ? '#01bf71' : '#010606')};
    padding: 0.75rem;
    color: ${({ dark }) => (dark ? '#010606' : '#fff')};
    font-size: 1rem;
    font-weight: bold;
    border: none;
    cursor: pointer;
    transition: all 0.2s ease-in-out;
    margin-top: 0.5rem;

    &:hover {
        background: ${({ primary, danger }) => (danger ? '#cc0000' : primary ? '#fff' : '#01bf71')};
        color: #010606;
    }
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

const PartyDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [party, setParty] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isErrorFading, setIsErrorFading] = useState(false);
    const [isSuccessFading, setIsSuccessFading] = useState(false);

    useEffect(() => {
        const fetchParty = async () => {
            console.log('Fetching party with id:', id);
            const { data, error } = await supabase
                .from('parties')
                .select(`
                    id,
                    name,
                    leader_id,
                    location_id,
                    trip_date,
                    trip_duration,
                    description,
                    profiles!parties_leader_id_fkey (
                        first_name,
                        last_name
                    )
                `)
                .eq('id', id)
                .single();

            if (error) {
                console.error('Fetch party error:', error);
                setError(`Failed to fetch party: ${error.message}`);
                return;
            }

            console.log('Party fetched:', data);
            setParty({
                ...data,
                leader_name: data.profiles
                    ? `${data.profiles.first_name || ''} ${data.profiles.last_name || ''}`.trim() || 'Unknown Leader'
                    : 'Unknown Leader'
            });
        };

        fetchParty();
    }, [id]);

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
        console.log('Success message set:', success);
        const timer = setTimeout(() => {
            console.log('Starting success message fade');
            setIsSuccessFading(true);
            setTimeout(() => {
                console.log('Clearing success message and redirecting');
                setSuccess('');
                navigate('/');
            }, 1000);
        }, 3000);
        return () => clearTimeout(timer);
    }, [success, navigate]);

    const handleDeleteParty = async () => {
        try {
            console.log('Deleting party with id:', id);
            const { data: { user }, error: authError } = await supabase.auth.getUser();
            if (authError || !user) {
                console.log('Validation failed: Not authenticated', authError);
                setError('You must be logged in to delete a party');
                navigate('/signin');
                return;
            }

            if (party.leader_id !== user.id) {
                console.log('Validation failed: Not party leader');
                setError('Only the party leader can delete this party');
                return;
            }

            const { error: deleteError } = await supabase
                .from('parties')
                .delete()
                .eq('id', id);

            if (deleteError) {
                console.error('Delete party error:', deleteError);
                setError(`Failed to delete party: ${deleteError.message}`);
                return;
            }

            console.log('Party deleted successfully');
            setSuccess('Party deleted successfully!');
            setError('');
        } catch (err) {
            console.error('Unexpected error in handleDeleteParty:', err);
            setError('An unexpected error occurred. Please try again.');
        }
    };

    if (!party) {
        return (
            <PageContainer>
                <PartyDetailsContainer>
                    <Title>Loading...</Title>
                    {error && <ErrorMessage isFading={isErrorFading}>{error}</ErrorMessage>}
                </PartyDetailsContainer>
            </PageContainer>
        );
    }

    return (
        <PageContainer>
            <PartyDetailsContainer>
                <Title>{party.name}</Title>
                {error && <ErrorMessage isFading={isErrorFading}>{error}</ErrorMessage>}
                {success && <SuccessMessage isFading={isSuccessFading}>{success}</SuccessMessage>}
                <DetailItem>
                    <Label>Location ID</Label>
                    <Value>{party.location_id}</Value>
                </DetailItem>
                <DetailItem>
                    <Label>Leader Name</Label>
                    <Value>{party.leader_name}</Value>
                </DetailItem>
                <DetailItem>
                    <Label>Trip Date</Label>
                    <Value>{party.trip_date ? new Date(party.trip_date).toLocaleDateString() : 'N/A'}</Value>
                </DetailItem>
                <DetailItem>
                    <Label>Trip Duration (Days)</Label>
                    <Value>{party.trip_duration || 'N/A'}</Value>
                </DetailItem>
                <DetailItem>
                    <Label>Description</Label>
                    <Value>{party.description || 'No description provided'}</Value>
                </DetailItem>
                <ButtonR to="/" primary="true" dark="true">
                    Back to Home
                </ButtonR>
                <Button type="button" danger="true" dark="true" onClick={handleDeleteParty}>
                    Delete Party
                </Button>
            </PartyDetailsContainer>
        </PageContainer>
    );
};

export default PartyDetails;