import express from 'express';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import { BattleStream, Teams } from 'pokemon-showdown';

interface PokemonSet {
  name: string;
  species: string;
  item: string;
  ability: string;
  moves: string[];
  nature: string;
  gender: 'M' | 'F' | '';
  evs: { hp?: number; atk?: number; def?: number; spa?: number; spd?: number; spe?: number };
  ivs: { hp?: number; atk?: number; def?: number; spa?: number; spd?: number; spe?: number };
  level: number;
}

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const activeStreams = new Map<string, BattleStream>();
const waitingPlayers = new Map<string, { socket: Socket, team: PokemonSet[] }>();

async function runStreamReadLoop(p1: Socket, p2: Socket, stream: BattleStream) {
  const p1_id = p1.id;
  const p2_id = p2.id;
  
  try {
    let chunk = await stream.read();
    while (chunk) {
      const p1Connected = activeStreams.has(p1_id);
      const p2Connected = activeStreams.has(p2_id);

      if (p1Connected && p2Connected) {
        p1.emit('battle-log', chunk);
        p2.emit('battle-log', chunk);
      } else {
        console.log(`Um jogador desconectou. Forçando forfeit.`);
        if (!stream.battle?.ended) {
          const winner = p1Connected ? 'p2' : 'p1';
          stream.write(`>forfeit ${winner}`);
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

  socket.on('procurarBatalha', (team: PokemonSet[]) => {
    console.log(`Cliente ${socket.id} está procurando uma batalha com ${team.length} Pokémon.`);
    
    for (const [opponentId, data] of waitingPlayers) {
      if (opponentId !== socket.id) {
        console.log(`Match encontrado! ${opponentId} vs ${socket.id}`);
        
        const p1 = data.socket;
        const p2 = socket;
        
        waitingPlayers.delete(p1.id);

        const stream = new BattleStream();
        activeStreams.set(p1.id, stream);
        activeStreams.set(p2.id, stream);

        const p1Team = Teams.pack(data.team);
        const p2Team = Teams.pack(team);

        stream.write(`>start {"formatid":"gen9anythinggoes"}`);
        stream.write(`>player p1 {"name":"Treinador 1","team":"${p1Team}"}`);
        stream.write(`>player p2 {"name":"Treinador 2","team":"${p2Team}"}`);

        p1.emit('battle-start', 'p1');
        p2.emit('battle-start', 'p2');
        
        runStreamReadLoop(p1, p2, stream);
        return;
      }
    }

    waitingPlayers.set(socket.id, { socket, team });
    socket.emit('status', 'Aguardando oponente...');
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
    waitingPlayers.delete(socket.id);
  });
});

const PORT = 3001;
httpServer.listen(PORT, () => {
  console.log(`Servidor "Cerulean Core" rodando na porta ${PORT}`);
});