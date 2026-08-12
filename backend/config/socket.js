const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

let io = null;

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: '*', // Allow all origins in development
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      credentials: true
    },
    pingTimeout: 30000,
    pingInterval: 10000
  });

  // Optional socket JWT Authentication Middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'safesphere_super_secret_jwt_key_2026_dev_major_project');
        socket.userId = decoded.id;
        socket.userRole = decoded.role || 'user';
      } catch (err) {
        console.warn('[Socket.IO Auth Warning] Invalid token provided:', err.message);
      }
    }
    next();
  });

  io.on('connection', (socket) => {
    console.log(`[Socket.IO] Client connected: ${socket.id} (User: ${socket.userId || 'Anonymous'})`);

    // Auto-join authenticated user room
    if (socket.userId) {
      socket.join(`user_${socket.userId}`);
    }

    if (socket.userRole === 'admin') {
      socket.join('admin_room');
    }

    // Explicit room joins
    socket.on('join_user_room', (userId) => {
      if (userId) socket.join(`user_${userId}`);
    });

    socket.on('join_sos_room', (sosId) => {
      if (sosId) socket.join(`sos_${sosId}`);
    });

    socket.on('join_admin_room', () => {
      socket.join('admin_room');
    });

    socket.on('disconnect', (reason) => {
      console.log(`[Socket.IO] Client disconnected: ${socket.id} (${reason})`);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.IO is not initialized!');
  }
  return io;
};

// Helper helper to emit dual events (hyphenated and underscored) safely without leaking sensitive private data
const emitGlobalEvent = (eventName, payload) => {
  if (!io) return;
  const hyphenated = eventName.replace(/_/g, '-');
  const underscored = eventName.replace(/-/g, '_');

  // Sanitize payload to strip sensitive fields before broadcasting
  const sanitized = { ...payload };
  if (sanitized.passwordHash) delete sanitized.passwordHash;
  if (sanitized.user?.passwordHash) delete sanitized.user.passwordHash;

  io.emit(hyphenated, sanitized);
  io.emit(underscored, sanitized);
};

module.exports = { initSocket, getIO, emitGlobalEvent };
