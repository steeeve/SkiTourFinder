import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import supabase from '../../utils/supabaseClient';
import { ButtonR } from '../ButtonRElement';
import {Link as LinkR} from 'react-router-dom';

const PartyListContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    background: #1a1a1a;
    padding: 2rem;
    margin: 1rem auto;
    max-width: 1100px;
    width: 100%;
    border-radius: 10px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
`;

const PartyTitle = styled.h2`
    color: #fff;
    font-size: 1.5rem;
    font-weight: bold;
    margin-bottom: 1rem;
`;

const PartyListWrapper = styled.ul`
    list-style: none;
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 1rem;
`;

const PartyItem = styled.li`
    background: #333;
    padding: 1rem;
    border-radius: 5px;
    color: #fff;
    display: flex;
    justify-content: space-between;
    align-items: center;

    @media screen and (max-width: 768px) {
        flex-direction: column;
        gap: 0.5rem;
    }
`;

const PartyInfo = styled.div`
    font-size: 1rem;
`;

const ButtonContainer = styled.div`
    display: flex;
    gap: 0.5rem;
    align-items: center;

    @media screen and (max-width: 768px) {
        flex-direction: column;
        gap: 0.5rem;
    }
`;

const Button = styled.button`
    border-radius: 50px;
    background: #01bf71;
    padding: 0.5rem 1rem;
    color: #010606;
    font-size: 0.9rem;
    font-weight: bold;
    border: none;
    cursor: pointer;
    transition: all 0.2s ease-in-out;

    &:hover {
        background: #fff;
        color: #010606;
    }

    &:disabled {
        background: #555;
        cursor: not-allowed;
    }
`;

const DetailsButton = styled(LinkR)`
    border-radius: 50px;
    background: #555;
    padding: 0.5rem 1rem;
    color: #fff;
    font-size: 0.9rem;
    font-weight: bold;
    text-decoration: none;
    cursor: pointer;
    transition: all 0.2s ease-in-out;

    &:hover {
        background: #fff;
        color: #010606;
    }
`;

/*
const Form = styled.form`
    display: flex;
    gap: 1rem;
    margin-top: 1rem;
    width: 100%;
    max-width: 400px;

    @media screen and (max-width: 768px) {
        flex-direction: column;
    }
`;

const Input = styled.input`
    padding: 0.75rem;
    border: none;
    border-radius: 5px;
    background: #333;
    color: #fff;
    font-size: 1rem;
    outline: none;
    flex: 1;

    &::placeholder {
        color: #aaa;
    }
`;
*/

const Message = styled.p`
    color: #ffffff;
    font-size: 0.9rem;
    text-align: center;
    margin-top: 0.5rem;
    opacity: ${props => (props.isFading ? 0 : 1)};
    transition: opacity 1s ease-out;
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
`;

const ButtonR2 = styled(ButtonR)`
    margin-top: 10px;
`;

const PartyList = ({ selectedMarker }) => {
    const [parties, setParties] = useState([]);
    //const [newPartyName, setNewPartyName] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userId, setUserId] = useState(null);
    const [isErrorFading, setIsErrorFading] = useState(false);

    const fetchParties = useCallback(async (locationId) => {
        console.log('Fetching parties for location_id:', locationId);
        const { data: partiesData, error: partiesError } = await supabase
            .from('parties')
            .select('id, name, leader_id')
            .eq('location_id', locationId);

        if (partiesError) {
            console.error('Fetch parties error:', partiesError);
            setError(`Failed to load parties: ${partiesError.message}`);
            return;
        }

        const leaderIds = [...new Set(partiesData.map(party => party.leader_id))];
        const { data: profilesData, error: profilesError } = await supabase
            .from('profiles')
            .select('id, first_name, last_name')
            .in('id', leaderIds);

        if (profilesError) {
            console.error('Fetch profiles error:', profilesError);
            setError(`Failed to load profiles: ${profilesError.message}`);
            return;
        }

        const { data: membersData, error: membersError } = await supabase
            .from('party_members')
            .select('party_id, user_id')
            .in('party_id', partiesData.map(party => party.id));

        if (membersError) {
            console.error('Fetch party members error:', membersError);
            setError(`Failed to load party members: ${membersError.message}`);
            return;
        }

        const partiesWithMemberCount = partiesData.map(party => {
            const profile = profilesData.find(p => p.id === party.leader_id) || {
                first_name: 'Unknown',
                last_name: 'User',
                email: '',
            };
            const members = membersData.filter(m => m.party_id === party.id);
            return {
                ...party,
                profiles: profile,
                party_members: members,
                memberCount: members.length,
                isMember: userId ? members.some(member => member.user_id === userId) : false,
            };
        });

        setParties(partiesWithMemberCount);
    }, [userId]);

    useEffect(() => {
        const checkUser = async () => {
            const { data: { user }, error } = await supabase.auth.getUser();
            if (error || !user) {
                setIsAuthenticated(false);
                setUserId(null);
                if (selectedMarker?.location_id) {
                    fetchParties(selectedMarker.location_id);
                }
                return;
            }
            setIsAuthenticated(true);
            setUserId(user.id);
        };
        checkUser();

        // Subscribe to auth state changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_OUT') {
                setIsAuthenticated(false);
                setUserId(null);
                setError('');
                setSuccess('');
                if (selectedMarker?.location_id) {
                    fetchParties(selectedMarker.location_id);
                }
            } else if (event === 'SIGNED_IN' && session?.user) {
                setIsAuthenticated(true);
                setUserId(session.user.id);
                if (selectedMarker?.location_id) {
                    fetchParties(selectedMarker.location_id);
                }
            }
        });

        return () => {
            subscription?.unsubscribe();
        };
    }, [selectedMarker, fetchParties]);

    useEffect(() => {
        // fade the error message out after it appears
        if (!error) {
            setIsErrorFading(false);
            return;
        }

        const timer = setTimeout(() => {
            setIsErrorFading(true);
            setTimeout(() => setError(''), 1000); // Clear error after fade-out (1s)
        }, 5000); // Show error for 5s

        return () => {
            clearTimeout(timer);
        };
    }, [error]);

    useEffect(() => {
        // get the parties for this selected location
        if (selectedMarker?.location_id) {
            fetchParties(selectedMarker.location_id);
        }
    }, [selectedMarker, isAuthenticated, fetchParties]);

    /*
    const handleCreateParty = async (e) => {
        e.preventDefault();
        if (!newPartyName) {
            setError('Party name is required');
            return;
        }

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            setError('You must be logged in to create a party');
            return;
        }

        const { data, error } = await supabase
            .from('parties')
            .insert([
                {
                    location_id: selectedMarker.location_id,
                    name: newPartyName,
                    leader_id: user.id,
                },
            ])
            .select()
            .single();

        if (error) {
            console.error('Create party error:', error);
            setError('Failed to create party');
            return;
        }

        await supabase
            .from('party_members')
            .insert([{ party_id: data.id, user_id: user.id }]);

        setSuccess('Party created successfully!');
        setError('');
        setNewPartyName('');
        fetchParties(selectedMarker.location_id); 
    };
    */

    const handleJoinParty = async (partyId, leaderEmail) => {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            setError('You must be logged in to join a party');
            return;
        }

        const { data: partyData, error: partyError } = await supabase
            .from('party_members')
            .select('id')
            .eq('party_id', partyId);

        if (partyError) {
            console.error('Check party members error:', partyError);
            setError('Failed to join party');
            return;
        }

        if (partyData.length >= 10) {
            setError('Party is full (max 10 members)');
            return;
        }

        const { error: joinError } = await supabase
            .from('party_members')
            .insert([{ party_id: partyId, user_id: user.id }]);

        if (joinError) {
            console.error('Join party error:', joinError);
            setError('Failed to join party');
            return;
        }

        // Trigger email notification (requires server-side function)
        try {
            const { data: userProfile, error: profileError } = await supabase
                .from('profiles')
                .select('first_name, last_name')
                .eq('id', user.id)
                .single();

            if (profileError) {
                console.error('Profile fetch error:', profileError);
            }

            const response = await fetch('/api/send-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    to: leaderEmail,
                    subject: 'New Party Member',
                    text: `Hello, ${userProfile?.first_name || 'User'} ${userProfile?.last_name || ''} has joined your party!`,
                }),
            });

            if (!response.ok) {
                console.error('Email send error:', await response.text());
            }
        } catch (err) {
            console.error('Email trigger error:', err);
        }

        setSuccess('Joined party successfully!');
        setError('');
        fetchParties(selectedMarker.location_id);
    };

    if (!selectedMarker) {
        return <PartyListContainer>
                    <Message>
                        Select a location to view parties
                    </Message>
                </PartyListContainer>;
    }

    return (
        <PartyListContainer>
            <PartyTitle>Parties for {selectedMarker.name}</PartyTitle>
            {error && <ErrorMessage isFading={isErrorFading}>{error}</ErrorMessage>}
            {success && <SuccessMessage>{success}</SuccessMessage>}
            {parties.length === 0 ? (
                <p style={{ color: '#fff' }}>No parties yet{isAuthenticated ? '. Create one below!' : ''}</p>
            ) : (
                <PartyListWrapper>
                    {parties.map(party => (
                        <PartyItem key={party.id}>
                            <PartyInfo>
                                {party.name} (Leader: {party.profiles.first_name} {party.profiles.last_name}, Members: {party.memberCount}/10)
                            </PartyInfo>
                            <ButtonContainer>
                                {isAuthenticated && !party.isMember && party.memberCount < 10 && (
                                    <Button onClick={() => handleJoinParty(party.id)}>
                                        Join Party
                                    </Button>
                                )}
                                {party.isMember && <span style={{ color: '#01bf71' }}>Joined</span>}
                                <DetailsButton to={`/party/${party.id}`}>
                                    Details
                                </DetailsButton>
                            </ButtonContainer>
                        </PartyItem>
                    ))}
                </PartyListWrapper>
            )}
            {isAuthenticated && (
                <ButtonR
                    to="/createparty"
                    primary="true"
                    dark="true"
                    state={{ selectedMarker }}
                >
                    Create Party
                </ButtonR>
            )}
            {!isAuthenticated && (
                <ButtonR2 to="/signin" primary="true" dark="true">
                    Sign In to Create/Join Parties
                </ButtonR2>
            )}
        </PartyListContainer>
    );
};

export default PartyList;