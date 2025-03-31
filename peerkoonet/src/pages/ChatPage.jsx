import React, { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";

// Mock Data
const MOCK_CURRENT_USER = {
  _id: "user123",
  name: "Alex Johnson",
  avatar: null,
  isOnline: true,
};

const MOCK_CONVERSATIONS = [
  {
    _id: "conv1",
    participants: [
      { _id: "user123", name: "Alex Johnson" },
      { _id: "user456", name: "Anchal Jain" },
    ],
    lastMessage: "Are you joining the study group tonight?",
    updatedAt: "2025-03-30T15:30:00.000Z",
    unreadCount: 0,
  },
  {
    _id: "conv2",
    participants: [
      { _id: "user123", name: "Alex Johnson" },
      { _id: "user789", name: "Michael Brown" },
    ],
    lastMessage: "Thanks for sharing those notes!",
    updatedAt: "2025-03-29T12:15:00.000Z",
    unreadCount: 2,
  },
  {
    _id: "conv3",
    participants: [
      { _id: "user123", name: "Alex Johnson" },
      { _id: "user321", name: "Emily Davis" },
    ],
    lastMessage: "Did you submit the assignment?",
    updatedAt: "2025-03-28T18:45:00.000Z",
    unreadCount: 0,
  },
  {
    _id: "conv4",
    participants: [
      { _id: "user123", name: "Alex Johnson" },
      { _id: "user654", name: "David Wilson" },
    ],
    lastMessage: "Let's meet at the library tomorrow",
    updatedAt: "2025-03-28T10:20:00.000Z",
    unreadCount: 1,
  },
  {
    _id: "conv5",
    participants: [
      { _id: "user123", name: "Alex Johnson" },
      { _id: "user987", name: "Jessica Taylor" },
    ],
    lastMessage: "Check out this article I found",
    updatedAt: "2025-03-27T14:50:00.000Z",
    unreadCount: 0,
  },
];

const MOCK_USERS = {
  user456: {
    _id: "user456",
    name: "Anchal Jain",
    avatar: "https://i.pravatar.cc/150?img=1",
    college: "Stanford University",
    isOnline: true,
  },
  user789: {
    _id: "user789",
    name: "Akhil Garg",
    avatar: "https://i.pravatar.cc/150?img=2",
    college: "UC Berkeley",
    isOnline: false,
  },
  user321: {
    _id: "user321",
    name: "Bhuvesh Gupta",
    avatar: null,
    college: "Harvard University",
    isOnline: true,
  },
  user654: {
    _id: "user654",
    name: "Mayank Mehta",
    avatar: "https://i.pravatar.cc/150?img=4",
    college: "MIT",
    isOnline: false,
  },
  user987: {
    _id: "user987",
    name: "Raghav Gupta",
    avatar: "https://i.pravatar.cc/150?img=5",
    college: "Princeton University",
    isOnline: true,
  },
};

const MOCK_MESSAGES = {
  conv1: [
    {
      _id: "msg1",
      conversationId: "conv1",
      sender: "user456",
      content: "Hey Alex! How's your project coming along?",
      createdAt: "2025-03-30T14:30:00.000Z",
    },
    {
      _id: "msg2",
      conversationId: "conv1",
      sender: "user123",
      content:
        "Hi Sarah! It's going well. Just need to finish the presentation slides. How about yours?",
      createdAt: "2025-03-30T14:35:00.000Z",
    },
    {
      _id: "msg3",
      conversationId: "conv1",
      sender: "user456",
      content:
        "Almost done too! By the way, are you joining the study group tonight?",
      createdAt: "2025-03-30T15:30:00.000Z",
    },
  ],
  conv2: [
    {
      _id: "msg4",
      conversationId: "conv2",
      sender: "user123",
      content:
        "Hey Michael, I found these notes from last semester that might help with your research",
      createdAt: "2025-03-29T11:15:00.000Z",
    },
    {
      _id: "msg5",
      conversationId: "conv2",
      sender: "user789",
      content:
        "Wow, that's exactly what I needed! Thanks for sharing those notes!",
      createdAt: "2025-03-29T12:15:00.000Z",
    },
    {
      _id: "msg6",
      conversationId: "conv2",
      sender: "user789",
      content:
        "Do you have time to meet up this week to discuss the project further?",
      createdAt: "2025-03-29T12:18:00.000Z",
    },
  ],
  conv3: [
    {
      _id: "msg7",
      conversationId: "conv3",
      sender: "user321",
      content: "Hi Alex, just checking in about the group assignment",
      createdAt: "2025-03-28T18:30:00.000Z",
    },
    {
      _id: "msg8",
      conversationId: "conv3",
      sender: "user123",
      content:
        "Hey Emily! I'm working on my part now. Should be done by tonight",
      createdAt: "2025-03-28T18:40:00.000Z",
    },
    {
      _id: "msg9",
      conversationId: "conv3",
      sender: "user321",
      content: "Great! Did you submit the assignment?",
      createdAt: "2025-03-28T18:45:00.000Z",
    },
  ],
  conv4: [
    {
      _id: "msg10",
      conversationId: "conv4",
      sender: "user654",
      content: "Alex, are you free tomorrow for a study session?",
      createdAt: "2025-03-28T10:10:00.000Z",
    },
    {
      _id: "msg11",
      conversationId: "conv4",
      sender: "user123",
      content: "Sure, what time works for you?",
      createdAt: "2025-03-28T10:15:00.000Z",
    },
    {
      _id: "msg12",
      conversationId: "conv4",
      sender: "user654",
      content: "Let's meet at the library tomorrow at 2pm?",
      createdAt: "2025-03-28T10:20:00.000Z",
    },
  ],
  conv5: [
    {
      _id: "msg13",
      conversationId: "conv5",
      sender: "user987",
      content: "Hey Alex! How are your classes going this semester?",
      createdAt: "2025-03-27T14:30:00.000Z",
    },
    {
      _id: "msg14",
      conversationId: "conv5",
      sender: "user123",
      content:
        "Pretty good so far, though the workload is intense! How about you?",
      createdAt: "2025-03-27T14:40:00.000Z",
    },
    {
      _id: "msg15",
      conversationId: "conv5",
      sender: "user987",
      content:
        "Same here. Check out this article I found on efficient study techniques!",
      createdAt: "2025-03-27T14:50:00.000Z",
    },
  ],
};

// Online Indicator Component
const OnlineIndicator = ({ isOnline }) => (
  <div
    className={`absolute -right-1 -bottom-1 h-3 w-3 ${
      isOnline ? "bg-green-500" : "bg-gray-400"
    } rounded-full border-2 border-white`}
  />
);

// Chat Window Component
const ChatWindow = ({
  conversation,
  messages,
  onSendMessage,
  recipientUser,
}) => {
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (newMessage.trim() && onSendMessage) {
      onSendMessage(newMessage.trim());
      setNewMessage("");
    }
  };

  if (!conversation) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 p-6">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-blue-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
              />
            </svg>
          </div>
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            No conversation selected
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Choose a conversation from the list to start chatting
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Chat Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0 relative">
            {recipientUser?.avatar ? (
              <img
                className="h-10 w-10 rounded-full object-cover"
                src={recipientUser.avatar}
                alt={recipientUser.name}
              />
            ) : (
              <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium">
                {recipientUser?.name.charAt(0).toUpperCase()}
              </div>
            )}
            <OnlineIndicator isOnline={recipientUser?.isOnline} />
          </div>
          <div>
            <h2 className="text-base font-semibold text-gray-900">
              {recipientUser?.name}
            </h2>
            <p className="text-xs text-gray-500">{recipientUser?.college}</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <button
            className="inline-flex items-center p-2 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            aria-label="Video call"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
          </button>
          <button
            className="inline-flex items-center p-2 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            aria-label="Call"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
              />
            </svg>
          </button>
          <button
            className="inline-flex items-center p-2 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            aria-label="More options"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <p>No messages yet. Start the conversation!</p>
            </div>
          ) : (
            <>
              {messages.map((message, index) => {
                const isCurrentUser = message.sender === MOCK_CURRENT_USER._id;
                const showAvatar =
                  index === 0 || messages[index - 1].sender !== message.sender;
                const messageDate = new Date(message.createdAt);
                const formattedTime = messageDate.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                });

                return (
                  <div
                    key={message._id}
                    className={`flex ${
                      isCurrentUser ? "justify-end" : "justify-start"
                    }`}
                  >
                    {!isCurrentUser && showAvatar && (
                      <div className="flex-shrink-0 mr-2">
                        {MOCK_USERS[message.sender]?.avatar ? (
                          <img
                            className="h-8 w-8 rounded-full object-cover"
                            src={MOCK_USERS[message.sender].avatar}
                            alt={MOCK_USERS[message.sender].name}
                          />
                        ) : (
                          <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs">
                            {MOCK_USERS[message.sender]?.name
                              .charAt(0)
                              .toUpperCase()}
                          </div>
                        )}
                      </div>
                    )}
                    <div
                      className={`max-w-xs lg:max-w-md ${
                        !isCurrentUser && !showAvatar ? "ml-10" : ""
                      }`}
                    >
                      <div
                        className={`inline-block rounded-lg px-4 py-2 ${
                          isCurrentUser
                            ? "bg-blue-600 text-white"
                            : "bg-white text-gray-800 border border-gray-200"
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {formattedTime}
                      </p>
                    </div>
                    {isCurrentUser && showAvatar && (
                      <div className="flex-shrink-0 ml-2">
                        {MOCK_CURRENT_USER.avatar ? (
                          <img
                            className="h-8 w-8 rounded-full object-cover"
                            src={MOCK_CURRENT_USER.avatar}
                            alt={MOCK_CURRENT_USER.name}
                          />
                        ) : (
                          <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs">
                            {MOCK_CURRENT_USER.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>
      </div>

      {/* Message Input */}
      <div className="border-t border-gray-200 bg-white p-4">
        <form onSubmit={handleSend} className="flex space-x-2">
          <button
            type="button"
            className="inline-flex items-center p-2 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
              />
            </svg>
          </button>
          <div className="relative flex-grow">
            <input
              type="text"
              placeholder="Type a message..."
              className="w-full border border-gray-300 rounded-full py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
            />
            <button
              type="button"
              className="absolute right-3 top-2 text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </button>
          </div>
          <button
            type="submit"
            className="inline-flex items-center p-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            disabled={!newMessage.trim()}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
          </button>
        </form>
      </div>
    </>
  );
};

const ChatPage = () => {
  const { userId } = useParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);

  // Sort conversations by latest message
  const sortedConversations = [...MOCK_CONVERSATIONS].sort((a, b) => {
    return new Date(b.updatedAt) - new Date(a.updatedAt);
  });

  const getOtherParticipant = (conversation) => {
    if (!conversation || !conversation.participants) return null;

    const otherParticipant = conversation.participants.find(
      (p) => p._id !== MOCK_CURRENT_USER._id
    );

    if (!otherParticipant) return null;

    // Return the full user object if we have it, otherwise just the basic info
    return MOCK_USERS[otherParticipant._id] || otherParticipant;
  };
  // Filter conversations based on search term
  const filteredConversations = sortedConversations.filter((conversation) => {
    const otherParticipant = getOtherParticipant(conversation);
    return (
      otherParticipant &&
      otherParticipant.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  useEffect(() => {
    // If userId is provided in URL, find conversation with that user
    if (userId) {
      const conversation = MOCK_CONVERSATIONS.find((conv) =>
        conv.participants.some((p) => p._id === userId)
      );
      if (conversation) {
        handleSelectConversation(conversation);
      }
    } else if (MOCK_CONVERSATIONS.length > 0) {
      // Otherwise, select first conversation by default
      handleSelectConversation(MOCK_CONVERSATIONS[0]);
    }
  }, [userId]);

  // Helper function to get the other participant in a conversation

  const handleSelectConversation = (conversation) => {
    setActiveConversation(conversation);
    // Load messages for this conversation
    setMessages(MOCK_MESSAGES[conversation._id] || []);
  };

  const handleSendMessage = (content) => {
    if (!activeConversation || !content.trim()) return;

    // Create a new message object
    const newMessage = {
      _id: `msg${Date.now()}`,
      conversationId: activeConversation._id,
      sender: MOCK_CURRENT_USER._id,
      content: content,
      createdAt: new Date().toISOString(),
    };

    // Add message to the list
    setMessages([...messages, newMessage]);

    // Update last message in conversation
    const updatedConversation = {
      ...activeConversation,
      lastMessage: content,
      updatedAt: new Date().toISOString(),
    };
    setActiveConversation(updatedConversation);
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
          <p className="text-sm text-gray-500">
            Connect with your peers and collaborate on activities
          </p>
        </div>

        <div className="flex flex-col md:flex-row h-[calc(100vh-12rem)] bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Sidebar - Conversations List */}
          <div className="w-full md:w-80 bg-gray-50 border-r border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    className="h-5 w-5 text-gray-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search conversations..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {filteredConversations.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  <p>No conversations found.</p>
                </div>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {filteredConversations.map((conversation) => {
                    const otherUser = getOtherParticipant(conversation);
                    if (!otherUser) return null;

                    const isActive =
                      activeConversation &&
                      activeConversation._id === conversation._id;
                    const updatedDate = new Date(conversation.updatedAt);
                    const formattedDate = updatedDate.toLocaleDateString(
                      undefined,
                      {
                        month: "short",
                        day: "numeric",
                      }
                    );

                    return (
                      <li
                        key={conversation._id}
                        className={`
                          ${
                            isActive
                              ? "bg-blue-50 border-l-4 border-blue-600"
                              : "hover:bg-gray-100 border-l-4 border-transparent"
                          }
                          cursor-pointer transition-colors duration-150
                        `}
                        onClick={() => handleSelectConversation(conversation)}
                      >
                        <div className="px-4 py-3">
                          <div className="flex items-center space-x-3">
                            <div className="flex-shrink-0 relative">
                              {otherUser.avatar ? (
                                <img
                                  className="h-12 w-12 rounded-full object-cover"
                                  src={otherUser.avatar}
                                  alt={otherUser.name}
                                />
                              ) : (
                                <div className="h-12 w-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium">
                                  {otherUser.name.charAt(0).toUpperCase()}
                                </div>
                              )}
                              <OnlineIndicator isOnline={otherUser.isOnline} />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex justify-between">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {otherUser.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {formattedDate}
                                </p>
                              </div>
                              {conversation.lastMessage && (
                                <p className="text-sm text-gray-500 truncate">
                                  {conversation.lastMessage}
                                </p>
                              )}
                            </div>
                            {conversation.unreadCount > 0 && (
                              <div className="ml-2 bg-blue-600 text-white text-xs font-medium rounded-full h-5 w-5 flex items-center justify-center">
                                {conversation.unreadCount}
                              </div>
                            )}
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {/* Start New Chat Button */}
            <div className="p-4 border-t border-gray-200">
              <button className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                <svg
                  className="mr-2 h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                New Conversation
              </button>
            </div>
          </div>

          {/* Main Content - Chat */}
          <div className="flex-1 flex flex-col">
            <ChatWindow
              conversation={activeConversation}
              messages={messages}
              onSendMessage={handleSendMessage}
              recipientUser={
                activeConversation
                  ? getOtherParticipant(activeConversation)
                  : null
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
