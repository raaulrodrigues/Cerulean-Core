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

io.on('connection', (socket) => {
  console.log('Um cliente se conectou:', socket.id);

  socket.on('procurarBatalha', () => {
    console.log(`Cliente ${socket.id} está procurando uma batalha.`);
    runBattle(socket);
  });

  socket.on('disconnect', () => {
    console.log('Cliente desconectado:', socket.id);
  });
});

async function runBattle(socket: Socket) {
  console.log("Iniciando a batalha para", socket.id);

  const dex = Dex.includeData();
  const stream = new BattleStream();

  const p1Team = Teams.pack([
    {
      name: 'Pikachu',
      species: 'Pikachu',
      item: 'lightball',
      ability: 'lightningrod',
      moves: ['thunderbolt', 'volttackle', 'surf', 'quickattack'],
      nature: 'Hasty',
      gender: 'M',
      evs: { hp: 4, atk: 252, spe: 252 },
      ivs: { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 },
      level: 100,
    },
  ]);

  const p2Team = Teams.pack([
    {
      name: 'Charizard',
      species: 'Charizard',
      item: 'charizarditex',
      ability: 'blaze',
      moves: ['flareblitz', 'dragonclaw', 'roost', 'swordsdance'],
      nature: 'Jolly',
      gender: 'M',
      evs: { atk: 252, spd: 4, spe: 252 },
      ivs: { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 },
      level: 100,
    },
  ]);

  stream.write(`>start {"formatid":"gen9anythinggoes"}`);
  stream.write(`>player p1 {"name":"Treinador 1","team":"${p1Team}"}`);
  stream.write(`>player p2 {"name":"Treinador 2","team":"${p2Team}"}`);

  let chunk = await stream.read();
  while (chunk) {
    socket.emit('battle-log', chunk);

    if (chunk.includes('|win|')) {
      console.log("A batalha terminou para", socket.id);
      break;
    }

    if (chunk.includes('|teampreview|')) {
      stream.write(`>p1 team 1`);
      stream.write(`>p2 team 1`);
    }

    if (chunk.includes('|turn|')) {
      stream.write(`>p1 move 1`);
      stream.write(`>p2 move 1`);
    }

    chunk = await stream.read();
  }

  stream.destroy();
}

const PORT = 3001;
httpServer.listen(PORT, () => {
  console.log(`Servidor "Cerulean Core" rodando na porta ${PORT}`);
});