import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user) {
      // Initialize socket connection
      const newSocket = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000', {
        auth: {
          token: localStorage.getItem('token')
        }
      });

      setSocket(newSocket);

      // Socket event listeners
      newSocket.on('connect', () => {
        console.log('✅ Socket connected');
        setIsConnected(true);
      });

      newSocket.on('disconnect', () => {
        console.log('❌ Socket disconnected');
        setIsConnected(false);
      });

      newSocket.on('new_message', (message) => {
        setMessages(prev => [...prev, message]);
        // Add notification
        setNotifications(prev => [...prev, {
          id: Date.now(),
          type: 'message',
          title: 'New Message',
          message: `You have a new message from ${message.sender.name}`,
          timestamp: new Date()
        }]);
      });

      newSocket.on('message_read', (data) => {
        setMessages(prev => 
          prev.map(msg => 
            msg._id === data.messageId 
              ? { ...msg, read: true }
              : msg
          )
        );
      });

      newSocket.on('user_typing', (data) => {
        // Handle typing indicators
        console.log(`${data.userName} is typing...`);
      });

      newSocket.on('user_online', (userId) => {
        setConversations(prev => 
          prev.map(conv => 
            conv.participants.some(p => p._id === userId)
              ? { ...conv, onlineUsers: [...(conv.onlineUsers || []), userId] }
              : conv
          )
        );
      });

      newSocket.on('user_offline', (userId) => {
        setConversations(prev => 
          prev.map(conv => 
            conv.participants.some(p => p._id === userId)
              ? { 
                  ...conv, 
                  onlineUsers: (conv.onlineUsers || []).filter(id => id !== userId)
                }
              : conv
          )
        );
      });

      newSocket.on('new_listing', (listing) => {
        setNotifications(prev => [...prev, {
          id: Date.now(),
          type: 'listing',
          title: 'New Listing',
          message: `A new ${listing.type.name} listing has been added nearby`,
          timestamp: new Date()
        }]);
      });

      newSocket.on('new_comment', (comment) => {
        setNotifications(prev => [...prev, {
          id: Date.now(),
          type: 'comment',
          title: 'New Comment',
          message: `Someone commented on your listing`,
          timestamp: new Date()
        }]);
      });

      return () => {
        newSocket.close();
      };
    }
  }, [isAuthenticated, user]);

  const sendMessage = (conversationId, message) => {
    if (socket && isConnected) {
      socket.emit('send_message', {
        conversationId,
        message,
        timestamp: new Date()
      });
    }
  };

  const joinConversation = (conversationId) => {
    if (socket && isConnected) {
      socket.emit('join_conversation', conversationId);
    }
  };

  const leaveConversation = (conversationId) => {
    if (socket && isConnected) {
      socket.emit('leave_conversation', conversationId);
    }
  };

  const sendTypingIndicator = (conversationId, isTyping) => {
    if (socket && isConnected) {
      socket.emit('typing', {
        conversationId,
        isTyping
      });
    }
  };

  const markMessageAsRead = (messageId) => {
    if (socket && isConnected) {
      socket.emit('mark_read', messageId);
    }
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const removeNotification = (notificationId) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  const value = {
    socket,
    isConnected,
    messages,
    conversations,
    notifications,
    sendMessage,
    joinConversation,
    leaveConversation,
    sendTypingIndicator,
    markMessageAsRead,
    clearNotifications,
    removeNotification
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
}; 