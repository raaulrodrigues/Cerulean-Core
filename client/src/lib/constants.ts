export interface PokemonSet {
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

export const POKEMON_POOL: PokemonSet[] = [
  {
    name: 'Pikachu',
    species: 'Pikachu',
    item: 'lightball',
    ability: 'static',
    moves: ['thunderbolt', 'quickattack', 'irontail', 'volttackle'],
    nature: 'Hasty',
    gender: 'M',
    evs: { atk: 252, spa: 4, spe: 252 },
    ivs: { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 },
    level: 100,
  },
  {
    name: 'Eevee',
    species: 'Eevee',
    item: 'lifeorb',
    ability: 'adaptability',
    moves: ['quickattack', 'takedown', 'bite', 'return'],
    nature: 'Adamant',
    gender: 'M',
    evs: { hp: 252, atk: 252, spe: 4 },
    ivs: { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 },
    level: 100,
  },
  {
    name: 'Bulbasaur',
    species: 'Bulbasaur',
    item: 'eviolite',
    ability: 'chlorophyll',
    moves: ['sludgebomb', 'gigadrain', 'sleeppowder', 'growth'],
    nature: 'Modest',
    gender: 'M',
    evs: { spa: 252, spd: 4, spe: 252 },
    ivs: { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 },
    level: 100,
  },
  {
    name: 'Charmander',
    species: 'Charmander',
    item: 'eviolite',
    ability: 'solarpower',
    moves: ['flamethrower', 'dragonpulse', 'solarbeam', 'sunnyday'],
    nature: 'Timid',
    gender: 'M',
    evs: { spa: 252, spd: 4, spe: 252 },
    ivs: { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 },
    level: 100,
  },
  {
    name: 'Squirtle',
    species: 'Squirtle',
    item: 'eviolite',
    ability: 'torrent',
    moves: ['surf', 'icebeam', 'rapidspin', 'hydropump'],
    nature: 'Modest',
    gender: 'M',
    evs: { hp: 252, spa: 252, spd: 4 },
    ivs: { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 },
    level: 100,
  },
];