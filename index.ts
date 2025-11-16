const { BattleStream, Teams, Dex } = require('pokemon-showdown');

async function runBattle() {
  console.log("Iniciando a batalha...");

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

  console.log("Times definidos. Iniciando loop da batalha.");

  let chunk = await stream.read();
  while (chunk) {
    console.log(chunk);

    if (chunk.includes('|win|')) {
      console.log("A batalha terminou.");
      break;
    }

    if (chunk.includes('|turn|')) {
      stream.write(`>p1 move 1`);
      stream.write(`>p2 move 1`);
    }

    chunk = await stream.read();
  }

  stream.destroy();
}

runBattle().catch(err => {
  console.error("Ocorreu um erro na batalha:", err);
});