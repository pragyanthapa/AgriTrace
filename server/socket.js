import { Server } from 'socket.io';

export function setupSocket(server) {
  const io = new Server(server, { cors: { origin: '*'} });
  io.on('connection', () => {});
  return io;
}


