import express from 'express';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import { BattleStream, Teams, Dex } from 'pokemon-showdown';

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const activeStreams = new Map<string, BattleStream>();

// --- A FUNÇÃO DE LOOP ---
async function runStreamReadLoop(socket: Socket, stream: BattleStream, socketId: string) {
  try {
    let chunk = await stream.read();
    while (chunk) {
      if (activeStreams.has(socketId)) {
        socket.emit('battle-log', chunk);

        if (chunk.includes('|win|')) {
          console.log(`Batalha terminada (win) para ${socketId}, encerrando loop.`);
          stream.destroy();
          activeStreams.delete(socketId);
          break;
        }
      } else {
        console.log(`Socket ${socketId} desconectado, encerrando loop.`);
        stream.destroy();
        break;
      }
      chunk = await stream.read();
    }
  } catch (e) {
    console.error(`Erro no stream read loop para ${socketId}:`, e);
    stream.destroy();
    activeStreams.delete(socketId);
  }
  console.log(`Loop de leitura encerrado para ${socketId}`);
}


// --- CONFIGURAÇÃO DO SERVIDOR SOCKET ---
io.on('connection', (socket) => {
  console.log('Um cliente se conectou:', socket.id);

  socket.on('procurarBatalha', () => {
    console.log(`Cliente ${socket.id} está procurando uma batalha.`);
    
    const stream = new BattleStream();
    activeStreams.set(socket.id, stream);

    // ... (Definição dos times p1Team e p2Team) ...
    const p1Team = Teams.pack([
      { name: 'Pikachu', species: 'Pikachu', item: 'lightball', ability: 'lightningrod', moves: ['thunderbolt', 'volttackle', 'surf', 'quickattack'], nature: 'Hasty', gender: 'M', evs: { hp: 4, atk: 252, spe: 252 }, ivs: { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 }, level: 100 },
    ]);
    const p2Team = Teams.pack([
      { name: 'Charizard', species: 'Charizard', item: 'charizarditex', ability: 'blaze', moves: ['flareblitz', 'dragonclaw', 'roost', 'swordsdance'], nature: 'Jolly', gender: 'M', evs: { atk: 252, spd: 4, spe: 252 }, ivs: { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 }, level: 100 },
    ]);

    stream.write(`>start {"formatid":"gen9anythinggoes"}`);
    stream.write(`>player p1 {"name":"Treinador 1","team":"${p1Team}"}`);
    stream.write(`>player p2 {"name":"Treinador 2","team":"${p2Team}"}`);

    // Inicia o loop de leitura (sem 'await')
    runStreamReadLoop(socket, stream, socket.id);
  });

  socket.on('player-choice', (choice: string) => {
    console.log(`Cliente ${socket.id} enviou comando: ${choice}`);
    const stream = activeStreams.get(socket.id);
    if (stream) {
      stream.write(choice);
    }
  });

  socket.on('disconnect', () => {
    console.log('Cliente desconectado:', socket.id);
    const stream = activeStreams.get(socket.id);
    if (stream) {
      stream.destroy();
      activeStreams.delete(socket.id);
    }
  });
});

const PORT = 3001;
httpServer.listen(PORT, () => {
  console.log(`Servidor "Cerulean Core" rodando na porta ${PORT}`);
});