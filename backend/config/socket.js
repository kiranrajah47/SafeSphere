const { Server } = require('socket.io');

let io = null;

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: '*', // Allow all origins for dev/testing
      methods: ['GET', 'POST', 'PUT', 'DELETE']
    }
  });

  io.on('connection', (socket) => {
    console.log(`[Socket.IO] Client connected: ${socket.id}`);

    // Join room based on user ID or SOS ID
    socket.on('join_user_room', (userId) => {
      if (userId) {
        socket.join(`user_${userId}`);
        console.log(`[Socket.IO] Socket ${socket.id} joined user_${userId}`);
      }
    });

    socket.on('join_sos_room', (sosId) => {
      if (sosId) {
        socket.join(`sos_${sosId}`);
        console.log(`[Socket.IO] Socket ${socket.id} joined sos_${sosId}`);
      }
    });

    socket.on('join_admin_room', () => {
      socket.join('admin_room');
      console.log(`[Socket.IO] Socket ${socket.id} joined admin_room`);
    });

    socket.on('disconnect', () => {
      console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.io is not initialized!');
  }
  return io;
};

module.exports = { initSocket, getIO };
