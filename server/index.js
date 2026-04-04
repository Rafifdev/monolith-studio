import { WebcastPushConnection } from 'tiktok-live-connector';
import { Server } from 'socket.io';
import express from 'express';
import http from 'http';
import cors from 'cors';

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
  },
});

let tiktokConnection = null;

io.on('connection', (socket) => {
  console.log('Frontend connected to Socket.IO');

  socket.on('connect_tiktok', (username) => {
    console.log(`Connecting to TikTok user: ${username}`);
    
    // Disconnect existing if any
    if (tiktokConnection) {
      tiktokConnection.disconnect();
    }

    tiktokConnection = new WebcastPushConnection(username);

    tiktokConnection.connect().then(state => {
      console.log(`Connected to TikTok Live: ${state.roomId}`);
      io.emit('tiktok_connected', { roomId: state.roomId });
    }).catch(err => {
      console.error('Failed to connect', err);
      io.emit('tiktok_error', { message: 'Failed to connect' });
    });

    tiktokConnection.on('chat', data => {
      io.emit('chat', {
        username: data.uniqueId,
        message: data.comment,
      });
    });

    tiktokConnection.on('gift', data => {
      io.emit('gift', {
        username: data.uniqueId,
        giftName: data.giftName,
        giftCount: data.repeatCount,
        coins: data.diamondCount * data.repeatCount
      });
    });

    tiktokConnection.on('member', data => {
      io.emit('join', {
        username: data.uniqueId
      });
    });

    tiktokConnection.on('like', data => {
      io.emit('like', {
        count: data.likeCount
      });
    });

    tiktokConnection.on('roomUser', data => {
      io.emit('viewerCount', {
        viewers: data.viewerCount
      });
    });

    tiktokConnection.on('streamEnd', (actionId) => {
      console.log('Stream ended');
      io.emit('tiktok_disconnected', { message: 'Stream ended' });
    });
  });

  socket.on('disconnect_tiktok', () => {
    if (tiktokConnection) {
      tiktokConnection.disconnect();
      tiktokConnection = null;
      io.emit('tiktok_disconnected', { message: 'Disconnected manually' });
      console.log('Disconnected manually');
    }
  });

  socket.on('disconnect', () => {
    console.log('Frontend disconnected');
    // We could disconnect tiktok connection here, but maybe we want to keep it running for overlays
  });
});

const PORT = 3001;
server.listen(PORT, () => {
  console.log(`Socket.IO backend running on port ${PORT}`);
});
