import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

io.on('connection', (socket) => {
  console.log('Um cliente se conectou:', socket.id);

  socket.on('ping', () => {
    console.log('Recebido PING do cliente. Enviando PONG...');
    socket.emit('pong');
  });

  socket.on('disconnect', () => {
    console.log('Cliente desconectado:', socket.id);
  });
});

const PORT = 3001;
httpServer.listen(PORT, () => {
  console.log(`Servidor "Cerulean Core" rodando na porta ${PORT}`);
});