import React, { useState, useEffect, useCallback, useMemo } from 'react';
import styled from 'styled-components';
import { useNavigate, useParams } from 'react-router-dom';
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
    background: ${({ primary, danger }) => (danger ? '#ff4444' : primary ? '#01BF71' : '#010606')};
    white-space: nowrap;
    padding: ${({ big }) => (big ? '14px 48px' : '12px 30px')};
    color: ${({ dark }) => (dark ? '#010606' : '#fff')};
    font-size: ${({ fontBig }) => (fontBig ? '20px' : '16px')};
    outline: none;
    border: none;
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
    transition: all 0.2s ease-in-out;
    margin: 0 auto;
    width: fit-content;
    margin-bottom: 10px;

    &:hover {
        transition: all 0.2s ease-in-out;
        background: ${({ primary, danger }) => (danger ? '#cc0000' : primary ? '#fff' : '#01BF71')};
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

const LoadingMessage = styled.p`
    color: #aaa;
    font-size: 0.9rem;
    text-align: center;
    margin-bottom: 1rem;
`;

const MembersSection = styled.div`
    width: 100%;
    margin-bottom: 2rem;
`;

const MemberList = styled.ul`
    background: #333;
    padding: 1rem;
    border-radius: 5px;
    list-style: none;
`;

const MemberItem = styled.li`
    color: #01bf71;
    font-size: 1rem;
    margin-bottom: 0.5rem;

    &:last-child {
        margin-bottom: 0;
    }
`;

const MessageSection = styled.div`
    width: 100%;
    margin-top: 2rem;
`;

const MessageForm = styled.form`
    display: flex;
    flex-direction: column;
    gap: 1rem;
    width: 100%;
    margin-bottom: 2rem;
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

const MessageThread = styled.div`
    width: 100%;
    margin-top: 10px;
`;

const Message = styled.div`
    background: #333;
    padding: 1rem;
    border-radius: 5px;
    margin-bottom: 1rem;
`;

const MessageHeader = styled.div`
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.5rem;
`;

const Author = styled.span`
    color: #01bf71;
    font-weight: bold;
    font-size: 0.9rem;
`;

const Timestamp = styled.span`
    color: #aaa;
    font-size: 0.9rem;
`;

const MessageContent = styled.p`
    color: #fff;
    font-size: 1rem;
`;

const Modal = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
`;

const ModalContent = styled.div`
    background: #333;
    padding: 1.5rem;
    border-radius: 10px;
    max-width: 400px;
    width: 100%;
    text-align: center;
`;

const ModalHeader = styled.h3`
    color: #fff;
    font-size: 1.2rem;
    margin-bottom: 1rem;
`;

const ModalBody = styled.p`
    color: #fff;
    font-size: 1rem;
    margin-bottom: 1.5rem;
`;

const ModalFooter = styled.div`
    display: flex;
    justify-content: center;
    gap: 1rem;
`;

const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const day = date.getDate();
    const month = date.toLocaleString('default', { month: 'long' });
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${day}, ${month}, ${year}, ${hours}:${minutes}`;
};

const PartyDetails = () => {
    console.log('PartyDetails.jsx: Component rendered');
    const { id } = useParams();
    const navigate = useNavigate();
    const [party, setParty] = useState(null);
    const [members, setMembers] = useState([]);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [user, setUser] = useState(null);
    const [isMember, setIsMember] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isErrorFading, setIsErrorFading] = useState(false);
    const [isSuccessFading, setIsSuccessFading] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isLoadingMembers, setIsLoadingMembers] = useState(true);
    const [isLoadingMessages, setIsLoadingMessages] = useState(true);
    const [isAuthChecked, setIsAuthChecked] = useState(false);

    const profileCache = useMemo(() => {
        const cache = new Map();
        return {
            get: async (userId) => {
                if (cache.has(userId)) return cache.get(userId);
                const { data, error } = await supabase
                    .from('profiles')
                    .select('id, first_name, last_name')
                    .eq('id', userId)
                    .single();
                if (error) {
                    console.error('PartyDetails.jsx: Fetch profile error:', error);
                    return 'Unknown User';
                }
                const name = `${data.first_name || ''} ${data.last_name || ''}`.trim() || 'Unknown User';
                cache.set(userId, name);
                return name;
            }
        };
    }, []);

    const fetchMessages = useCallback(async () => {
        setIsLoadingMessages(true);
        console.log('PartyDetails.jsx: Fetching messages for party:', id);
        const { data, error } = await supabase
            .from('messages')
            .select(`
                id,
                party_id,
                user_id,
                content,
                created_at
            `)
            .eq('party_id', id)
            .order('created_at', { ascending: true });

        if (error) {
            console.error('PartyDetails.jsx: Fetch messages error:', error);
            setError(`Failed to fetch messages: ${error.message}`);
            setMessages([]);
            setIsLoadingMessages(false);
            return;
        }

        const messagesWithAuthors = await Promise.all(data.map(async (msg) => ({
            ...msg,
            author_name: await profileCache.get(msg.user_id)
        })));

        setMessages(messagesWithAuthors);
        console.log('PartyDetails.jsx: Messages fetched:', data);
        setIsLoadingMessages(false);
    }, [id, profileCache]);

    const fetchMembers = useCallback(async () => {
        setIsLoadingMembers(true);
        console.log('PartyDetails.jsx: Fetching members for party:', id);
        const { data, error } = await supabase
            .from('party_members')
            .select('user_id, created_at')
            .eq('party_id', id)
            .order('created_at', { ascending: true });

        if (error) {
            console.error('PartyDetails.jsx: Fetch members error:', error);
            setError(`Failed to fetch members: ${error.message}`);
            setMembers([]);
            setIsLoadingMembers(false);
            return;
        }

        const membersWithNames = await Promise.all(data.map(async ({ user_id }) => ({
            user_id,
            name: await profileCache.get(user_id)
        })));

        setMembers(membersWithNames);
        console.log('PartyDetails.jsx: Members fetched:', data);
        setIsLoadingMembers(false);
    }, [id, profileCache]);

    const fetchUser = useCallback(async () => {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) {
            console.log('PartyDetails.jsx: No user session, proceeding as unauthenticated');
            setIsAuthChecked(true);
            return null;
        }
        console.log('PartyDetails.jsx: User fetched:', user ? user.id : 'No user');
        setIsAuthChecked(true);
        return user;
    }, []);

    const fetchParty = useCallback(async () => {
        console.log('PartyDetails.jsx: Fetching party with id:', id);
        const { data, error } = await supabase
            .from('parties')
            .select(`
                id,
                name,
                leader_id,
                location_id,
                trip_date,
                trip_duration,
                description
            `)
            .eq('id', id);

        if (error) {
            console.error('PartyDetails.jsx: Fetch party error:', error);
            setError(`Failed to fetch party: ${error.message}`);
            return null;
        }

        if (!data || data.length === 0) {
            console.error('PartyDetails.jsx: No party found for id:', id);
            setError('Party not found');
            return null;
        }

        const partyData = data[0];
        const leaderName = await profileCache.get(partyData.leader_id);
        console.log('PartyDetails.jsx: Party fetched:', partyData);
        return {
            ...partyData,
            leader_name: leaderName
        };
    }, [id, profileCache]);

    const checkMembership = useCallback(async (user) => {
        if (!user) {
            setIsMember(false);
            return;
        }
        console.log('PartyDetails.jsx: Checking membership for user:', user.id, 'party:', id);
        const { data, error } = await supabase
            .from('party_members')
            .select('user_id')
            .eq('party_id', id)
            .eq('user_id', user.id)
            .single();

        if (error && error.code !== 'PGRST116') {
            console.error('PartyDetails.jsx: Check membership error:', error);
            setError(`Failed to check membership: ${error.message}`);
            return;
        }

        setIsMember(!!data);
        console.log('PartyDetails.jsx: Membership status:', !!data);
    }, [id]);

    useEffect(() => {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(id)) {
            setError('Invalid party ID');
            navigate('/');
            return;
        }

        const fetchData = async () => {
            if (isDeleting) {
                console.log('PartyDetails.jsx: Skipping fetchData due to deletion in progress');
                return;
            }

            try {
                const [userData, partyData] = await Promise.all([fetchUser(), fetchParty()]);

                if (!partyData) {
                    navigate('/');
                    return;
                }

                setParty(partyData);
                setUser(userData);
                await Promise.all([fetchMembers(), fetchMessages()]);
                if (userData) await checkMembership(userData);
            } catch (err) {
                console.error('PartyDetails.jsx: Unexpected error in fetchData:', err);
                setError('An unexpected error occurred. Please try again.');
            }
        };

        fetchData();
    }, [id, fetchUser, fetchParty, fetchMembers, fetchMessages, checkMembership, navigate, isDeleting]);

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
        console.log('PartyDetails.jsx: Success message set:', success);
        const timer = setTimeout(() => {
            console.log('PartyDetails.jsx: Starting success message fade');
            setIsSuccessFading(true);
            setTimeout(() => {
                console.log('PartyDetails.jsx: Clearing success message and redirecting');
                setSuccess('');
                navigate('/');
            }, 1000);
        }, 3000);
        return () => clearTimeout(timer);
    }, [success, navigate]);

    const handleDeleteParty = async () => {
        if (!user) {
            setError('You must be signed in to delete a party');
            navigate('/signin');
            return;
        }

        try {
            console.log('PartyDetails.jsx: Deleting party with id:', id);
            setIsDeleting(true);
            const { data: { user: currentUser }, error: authError } = await supabase.auth.getUser();
            if (authError || !currentUser) {
                console.log('PartyDetails.jsx: Validation failed: Not authenticated', authError);
                setError('You must be signed in to delete a party');
                navigate('/signin');
                setIsDeleting(false);
                setShowDeleteModal(false);
                return;
            }

            if (party && party.leader_id !== currentUser.id) {
                console.log('PartyDetails.jsx: Validation failed: Not party leader');
                setError('Only the party leader can delete this party');
                setIsDeleting(false);
                setShowDeleteModal(false);
                return;
            }

            const { error: deleteError } = await supabase
                .from('parties')
                .delete()
                .eq('id', id);

            if (deleteError) {
                console.error('PartyDetails.jsx: Delete party error:', deleteError);
                setError(`Failed to delete party: ${deleteError.message}`);
                setIsDeleting(false);
                setShowDeleteModal(false);
                return;
            }

            console.log('PartyDetails.jsx: Party deleted successfully');
            setSuccess('Party deleted successfully!');
            setError('');
            setShowDeleteModal(false);
        } catch (err) {
            console.error('PartyDetails.jsx: Unexpected error in handleDeleteParty:', err);
            setError('An unexpected error occurred. Please try again.');
            setIsDeleting(false);
            setShowDeleteModal(false);
        }
    };

    const handlePostMessage = async (e) => {
        e.preventDefault();
        if (!user) {
            setError('You must be signed in to post a message');
            navigate('/signin');
            return;
        }

        if (!newMessage.trim()) {
            setError('Message cannot be empty');
            return;
        }

        try {
            console.log('PartyDetails.jsx: Posting message for party:', id);
            const { data: { user: currentUser }, error: authError } = await supabase.auth.getUser();
            if (authError || !currentUser) {
                console.log('PartyDetails.jsx: Validation failed: Not authenticated', authError);
                setError('You must be signed in to post a message');
                navigate('/signin');
                return;
            }

            const { error: insertError } = await supabase
                .from('messages')
                .insert([{ party_id: id, user_id: currentUser.id, content: newMessage }]);

            if (insertError) {
                console.error('PartyDetails.jsx: Insert message error:', insertError);
                setError(`Failed to post message: ${insertError.message}`);
                return;
            }

            setNewMessage('');
            console.log('PartyDetails.jsx: Message posted successfully');
            await fetchMessages();
        } catch (err) {
            console.error('PartyDetails.jsx: Unexpected error in handlePostMessage:', err);
            setError('An unexpected error occurred. Please try again.');
        }
    };

    const handleJoinParty = async () => {
        if (!user) {
            setError('You must be signed in to join a party');
            navigate('/signin');
            return;
        }

        try {
            console.log('PartyDetails.jsx: Joining party with id:', id);
            const { data: { user: currentUser }, error: authError } = await supabase.auth.getUser();
            if (authError || !currentUser) {
                console.log('PartyDetails.jsx: Validation failed: Not authenticated', authError);
                setError('You must be signed in to join a party');
                navigate('/signin');
                return;
            }

            const { error: insertError } = await supabase
                .from('party_members')
                .insert([{ party_id: id, user_id: currentUser.id }]);

            if (insertError) {
                console.error('PartyDetails.jsx: Join party error:', insertError);
                setError(`Failed to join party: ${insertError.message}`);
                return;
            }

            setIsMember(true);
            await fetchMembers();
            console.log('PartyDetails.jsx: Joined party successfully');
        } catch (err) {
            console.error('PartyDetails.jsx: Unexpected error in handleJoinParty:', err);
            setError('An unexpected error occurred. Please try again.');
        }
    };

    const handleShowDeleteModal = () => {
        if (!user) {
            setError('You must be signed in to delete a party');
            navigate('/signin');
            return;
        }
        setShowDeleteModal(true);
    };

    const handleCloseDeleteModal = () => {
        setShowDeleteModal(false);
    };

    if (!isAuthChecked) {
        return (
            <PageContainer>
                <PartyDetailsContainer>
                    <Title>Loading...</Title>
                </PartyDetailsContainer>
            </PageContainer>
        );
    }

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
                {user && party.leader_id === user.id && (
                    <Button type="button" danger="true" dark="true" onClick={handleShowDeleteModal}>
                        Delete Party
                    </Button>
                )}
                <ButtonR to="/" primary="true" dark="true">
                    Back to Home
                </ButtonR>
                <MembersSection>
                    <h3 style={{ color: '#fff', fontSize: '1.2rem', marginBottom: '1rem' }}>Members</h3>
                    {isLoadingMembers ? (
                        <LoadingMessage>Loading members...</LoadingMessage>
                    ) : (
                        <MemberList>
                            {members.length === 0 ? (
                                <p style={{ color: '#aaa', textAlign: 'center' }}>No members yet.</p>
                            ) : (
                                members.map((member) => (
                                    <MemberItem key={member.user_id}>{member.name}</MemberItem>
                                ))
                            )}
                        </MemberList>
                    )}
                </MembersSection>
                <MessageSection>
                    <h3 style={{ color: '#fff', fontSize: '1.2rem', marginBottom: '1rem' }}>Messages</h3>
                    {user ? (
                        isMember ? (
                            <MessageForm onSubmit={handlePostMessage}>
                                <Label>Post a Message</Label>
                                <Textarea
                                    placeholder="Write your message..."
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                />
                                <Button type="submit" primary="true" dark="true">
                                    Post Message
                                </Button>
                            </MessageForm>
                        ) : (
                            <Button type="button" primary="true" dark="true" onClick={handleJoinParty}>
                                Join the party to post
                            </Button>
                        )
                    ) : (
                        <ButtonR to="/signin" primary="true" dark="true">
                            Sign in to join or post
                        </ButtonR>
                    )}
                    <MessageThread>
                        {isLoadingMessages ? (
                            <LoadingMessage>Loading messages...</LoadingMessage>
                        ) : messages.length === 0 ? (
                            <p style={{ color: '#aaa', textAlign: 'center' }}>No messages yet.</p>
                        ) : (
                            messages.map((msg) => (
                                <Message key={msg.id}>
                                    <MessageHeader>
                                        <Author>{msg.author_name}</Author>
                                        <Timestamp>{formatTimestamp(msg.created_at)}</Timestamp>
                                    </MessageHeader>
                                    <MessageContent>{msg.content}</MessageContent>
                                </Message>
                            ))
                        )}
                    </MessageThread>
                </MessageSection>
                {showDeleteModal && (
                    <Modal>
                        <ModalContent>
                            <ModalHeader>Confirm Deletion</ModalHeader>
                            <ModalBody>Are you sure you want to delete this party?</ModalBody>
                            <ModalFooter>
                                <Button type="button" primary="true" dark="true" onClick={handleCloseDeleteModal}>
                                    Back
                                </Button>
                                <Button type="button" danger="true" dark="true" onClick={handleDeleteParty}>
                                    Delete
                                </Button>
                            </ModalFooter>
                        </ModalContent>
                    </Modal>
                )}
            </PartyDetailsContainer>
        </PageContainer>
    );
};

export default React.memo(PartyDetails);