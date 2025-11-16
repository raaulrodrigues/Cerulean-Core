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
let waitingPlayer: Socket | null = null;

async function runStreamReadLoop(p1: Socket, p2: Socket, stream: BattleStream) {
  const p1_id = p1.id;
  const p2_id = p2.id;
  
  try {
    let chunk = await stream.read();
    while (chunk) {
      if (activeStreams.has(p1_id) && activeStreams.has(p2_id)) {
        p1.emit('battle-log', chunk);
        p2.emit('battle-log', chunk);
      } else {
        console.log("Um jogador desconectou, encerrando loop.");
        if (!stream.battle?.ended) {
          stream.write(`>forfeit ${activeStreams.has(p1_id) ? 'p2' : 'p1'}`);
        }
        break;
      }

      if (chunk.includes('|win|')) {
        console.log(`Batalha terminada (win) para ${p1_id} vs ${p2_id}`);
      }

      chunk = await stream.read();
    }
  } catch (e) {
    console.error(`Erro no stream read loop:`, e);
  } finally {
    console.log(`Loop de leitura encerrado. Limpando referências...`);
    activeStreams.delete(p1_id);
    activeStreams.delete(p2_id);
  }
}

io.on('connection', (socket) => {
  console.log('Um cliente se conectou:', socket.id);

  socket.on('procurarBatalha', () => {
    console.log(`Cliente ${socket.id} está procurando uma batalha.`);
    
    if (waitingPlayer && waitingPlayer.id !== socket.id) {
      console.log(`Match encontrado! ${waitingPlayer.id} vs ${socket.id}`);
      const p1 = waitingPlayer;
      const p2 = socket;
      waitingPlayer = null;

      const stream = new BattleStream();
      activeStreams.set(p1.id, stream);
      activeStreams.set(p2.id, stream);

      const p1Team = Teams.pack([
        { name: 'Pikachu', species: 'Pikachu', item: 'lightball', ability: 'lightningrod', moves: ['thunderbolt', 'volttackle', 'surf', 'quickattack'], nature: 'Hasty', gender: 'M', evs: { hp: 4, atk: 252, spe: 252 }, ivs: { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 }, level: 100 },
      ]);
      const p2Team = Teams.pack([
        { name: 'Charizard', species: 'Charizard', item: 'charizarditex', ability: 'blaze', moves: ['flareblitz', 'dragonclaw', 'roost', 'swordsdance'], nature: 'Jolly', gender: 'M', evs: { atk: 252, spd: 4, spe: 252 }, ivs: { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 }, level: 100 },
      ]);

      stream.write(`>start {"formatid":"gen9anythinggoes"}`);
      stream.write(`>player p1 {"name":"Treinador 1","team":"${p1Team}"}`);
      stream.write(`>player p2 {"name":"Treinador 2","team":"${p2Team}"}`);

      p1.emit('battle-start', 'p1');
      p2.emit('battle-start', 'p2');
      
      runStreamReadLoop(p1, p2, stream);

    } else if (!waitingPlayer) {
      waitingPlayer = socket;
      socket.emit('status', 'Aguardando oponente...');
    }
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
    if (stream && !stream.battle?.ended) {
      stream.destroy();
    }
    activeStreams.delete(socket.id);
    
    if (waitingPlayer && waitingPlayer.id === socket.id) {
      waitingPlayer = null;
    }
  });
});

const PORT = 3001;
httpServer.listen(PORT, () => {
  console.log(`Servidor "Cerulean Core" rodando na porta ${PORT}`);
});