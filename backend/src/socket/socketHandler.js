const socketHandler = (io) => {
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Join a conversation
    socket.on('join_conversation', (conversationId) => {
      socket.join(conversationId);
      console.log(`User ${socket.id} joined conversation ${conversationId}`);
    });

    // Leave a conversation
    socket.on('leave_conversation', (conversationId) => {
      socket.leave(conversationId);
      console.log(`User ${socket.id} left conversation ${conversationId}`);
    });

    // Send a message
    socket.on('send_message', (data) => {
      socket.to(data.conversationId).emit('new_message', data);
    });

    // Typing indicator
    socket.on('typing', (data) => {
      socket.to(data.conversationId).emit('user_typing', {
        userId: socket.id,
        userName: data.userName,
        isTyping: data.isTyping
      });
    });

    // Mark message as read
    socket.on('mark_read', (messageId) => {
      socket.broadcast.emit('message_read', { messageId });
    });

    // User online/offline
    socket.on('user_online', (userId) => {
      socket.broadcast.emit('user_online', userId);
    });

    socket.on('user_offline', (userId) => {
      socket.broadcast.emit('user_offline', userId);
    });

    // New listing notification
    socket.on('new_listing', (listing) => {
      socket.broadcast.emit('new_listing', listing);
    });

    // New comment notification
    socket.on('new_comment', (comment) => {
      socket.broadcast.emit('new_comment', comment);
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });
};

module.exports = socketHandler; 