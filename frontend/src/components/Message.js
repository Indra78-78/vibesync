/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../css/message.css';
import Search from './Search';
import { io } from 'socket.io-client';
// const ENDPOINT = process.env.REACT_APP_ENDPOINT || `http://localhost:3000`;

let socket;

const Message = () => {
    const { conversationId } = useParams();
    const navigate = useNavigate();
    const [messages, setMessages] = useState([]);
    const [currentMessage, setCurrentMessage] = useState("");
    const [currentConversationId, setCurrentConversationId] = useState(conversationId || null);
    const [user, setUser] = useState(null);
    const [conversations, setConversations] = useState([]);
    const [receiver, setReceiver] = useState(null);
    const [statusMessage, setStatusMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [typingUser, setTypingUser] = useState('');
    const [onlineUsers, setOnlineUsers] = useState({});
    const [isLayer2Visible, setIsLayer2Visible] = useState(false);

    const piclink = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQhcdVEzoVWLyCqD6wPIyxnxW3L2lYNzsmrGHK-A-tGxA&s';

    // Get JWT token from localStorage
    const getToken = () => localStorage.getItem("jwt");

    // Request permission for notifications
    const requestNotificationPermission = () => {
        if (Notification.permission === 'default') {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    console.log('Notification permission granted.');
                } else {
                    console.log('Notification permission denied.');
                }
            });
        } else if (Notification.permission === 'granted') {
            console.log('Notification permission already granted.');
        } else {
            console.log('Notification permission already denied.');
        }
    };

    // Show notification
    const showNotification = (message) => {
        if (Notification.permission === 'granted') {
            const notification = new Notification('New Message', {
                body: message.message,
                icon: receiver?.Photo || piclink,
            });

            notification.onclick = () => {
                navigate(`/Message/${conversationId}`);
                window.focus();
            };
            console.log("Notification sent");
        } else {
            console.log('Notification permission not granted.');
        }
    };

    // Initialize socket connection and setup listeners
    useEffect(() => {
        socket = io();

        socket.on('receive_message', (newMessage) => {
            setMessages((prevMessages) => [...prevMessages, newMessage]);
            showNotification(newMessage);
        });

        socket.on('typing', (data) => {
            setTypingUser(data.userName);
            setIsTyping(true);
            setTimeout(() => setIsTyping(false), 3000); // Reset after 3 seconds of no typing
        });

        socket.on('update_user_status', ({ userId, status }) => {
            setOnlineUsers((prevUsers) => ({
                ...prevUsers,
                [userId]: status
            }));
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    // Fetch conversations for the logged-in user
    useEffect(() => {
        const fetchConversations = async () => {
            const token = getToken();
            if (!token) {
                console.error('No token found');
                return;
            }

            try {
                const user = JSON.parse(localStorage.getItem("user"));
                if (!user) {
                    console.error('No user found in localStorage');
                    return;
                }

                const res = await fetch(`/conversation/${user._id}`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                });

                if (!res.ok) {
                    throw new Error('Error fetching conversations');
                }

                const resData = await res.json();
                setConversations(Array.isArray(resData) ? resData : []);
            } catch (error) {
                console.error('Error fetching conversations:', error);
            }
        };

        fetchConversations();
    }, []);

    // Fetch messages for the current conversation
    useEffect(() => {
        if (currentConversationId) {
            fetchMessages(currentConversationId);
            socket.emit('join_conversation', currentConversationId);
        }
    }, [currentConversationId]);

    const fetchMessages = async (conversationId) => {
        const token = getToken();
        if (!token) {
            console.error('No token found');
            return;
        }

        try {
            const res = await fetch(`/message/${conversationId}`, {
                method: "GET",
                headers: {
                    'Content-type': "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!res.ok) {
                throw new Error('Error fetching messages');
            }

            const resData = await res.json();
            setMessages(resData);
            const conversation = conversations.find(conv => conv.conversationId === conversationId);
            setReceiver(conversation?.user || null);
            setCurrentConversationId(conversationId);
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    };

    // Fetch user data from the server
    const fetchUserData = () => {
        const token = getToken();
        if (!token) {
            console.error('No token found');
            return;
        }

        fetch(`/user/${JSON.parse(localStorage.getItem("user"))._id}`, {
            headers: {
                'Content-type': "application/json",
                Authorization: `Bearer ${token}`,
            },
        })
            .then((res) => res.json())
            .then((result) => {
                setUser(result.user);
                socket.emit('user_connected', result.user._id);
            })
            .catch((error) => {
                console.error('Error fetching user data:', error);
            });
    };

    useEffect(() => {
        fetchUserData();
        requestNotificationPermission();
    }, []);

    // Send message to the server
    const sendMessage = async () => {
        const senderId = JSON.parse(localStorage.getItem("user"))?._id;
        const token = getToken();
        if (!currentMessage || !currentConversationId || !senderId) {
            console.error('All fields are required');
            return;
        }

        if (!token) {
            console.error('No token found');
            return;
        }

        const payload = {
            conversationId: currentConversationId,
            senderId: senderId,
            message: currentMessage,
        };

        console.log("Sending message with payload:", payload);

        try {
            const res = await fetch(`/message`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                const errorText = await res.text();
                console.error('Error sending message:', errorText);
                setStatusMessage('Failed to send message');
                return;
            }

            const resData = await res.json();
            console.log("Message sent successfully:", resData.newMessage);

            socket.emit('send_message', resData.newMessage);

            setCurrentMessage("");
            setStatusMessage('');
        } catch (error) {
            console.error('Error sending message:', error);
            setStatusMessage('Failed to send message');
        }
    };

    // Handle conversation click to load messages
    const handleConversationClick = (conversationId, user) => {
        setReceiver(user);
        setCurrentConversationId(conversationId);
        setIsLayer2Visible(true);
        navigate(`/Message/${conversationId}`);
    };

    // Handle typing event
    const handleTyping = (e) => {
        setCurrentMessage(e.target.value);
        socket.emit('typing', { conversationId: currentConversationId, userName: user?.userName });
    };

    // Handle back button click to hide layer 2
    const handleBackClick = () => {
        setIsLayer2Visible(false);
        navigate(`/Message/`);
    };

    if (!user) return <div>Loading...</div>;

    return (
        <div className='outer-range'>
            <div className={`layer1 ${isLayer2Visible ? 'hidden' : ''}`}>
                <div className='user-profile'>
                    <div className='profile-pic'>
                        <img src={user.Photo ? user.Photo : piclink} alt="" />
                    </div>
                    <h3 className="name">{user.name}</h3>
                    <p className="my-account">{user.userName}</p>
                </div>
                <hr />
                <div>
                    <div className="search"><Search /></div>
                    <div className="messages-title">MESSAGES</div>
                    <div className='conversations'>
                        {conversations.map(({ conversationId, user }, index) => (
                            <div key={index} className='conversation' onClick={() => handleConversationClick(conversationId, user)}>
                                <div className='profile-pic' style={{ margin:"0 5%" }}>
                                    <img src={user ? user.Photo : piclink} alt="profile" />
                                </div>
                                <h3 className="name">{user ? user.name : "Unknown"}</h3>
                                {isTyping && <div>{typingUser} is typing...</div>}
                                <p className="my-account">{onlineUsers[user?._id] === 'online' && <span className="online-status">Online</span>}</p>
                                <hr></hr>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <div className={`layer2 ${isLayer2Visible ? '' : 'hidden'}`}>
                {receiver?.name && (
                    <div className="user-message">
                        <button className="back-button" onClick={handleBackClick}><span className="material-symbols-outlined">arrow_back</span></button>
                        <div className='profile-pic'><img src={receiver?.Photo || piclink} alt="receiver" /></div>
                        <h3 className="name" style={{ color: "red" }}>{receiver?.name}</h3>
                        {/* {isTyping && <div>{typingUser} is typing...</div>} */}
                        <p className="account-status">{onlineUsers[receiver?._id] === 'online' ? 'ACTIVE' : 'OFFLINE'}</p>
                        <div className="symbols">
                            <span className="material-symbols-outlined" style={{ fontSize: "145%", fontWeight: "900" }}>call</span>
                            <span className="material-symbols-outlined" style={{ fontSize: "145%", fontWeight: "900" }}>videocam</span>
                            <span className="material-symbols-outlined" style={{ fontSize: "145%", fontWeight: "900" }}>more_vert</span>
                        </div>
                    </div>
                )}
                <div className='msgbox'>
                    <div className='insidemsgbox'>
                        {messages.length > 0 ? (
                            messages.map(({ message, senderId }, index) => (
                                <div key={index} className={`${senderId === user._id ? 'outmsg' : 'inmsg'}`}>
                                    {message}
                                </div>
                            ))
                        ) : (
                            <div>No messages found</div>
                        )}
                    </div>
                </div>
                <div className='message-container'>
                    <textarea
                        rows="1"
                        cols="50"
                        placeholder='Type your message...'
                        value={currentMessage}
                        onChange={handleTyping}
                    />
                    <span className="material-symbols-outlined" onClick={sendMessage} style={{ fontSize: "205%" }}>send</span>
                </div>
                {statusMessage && <p>{statusMessage}</p>}
            </div>
        </div>
    );
};

export default Message;
