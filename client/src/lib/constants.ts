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
    item: 'Light Ball',
    ability: 'Lightning Rod',
    moves: ['Thunderbolt', 'Volt Tackle', 'Surf', 'Quick Attack'],
    nature: 'Hasty',
    gender: 'M',
    evs: { atk: 200, def: 104, spa: 136, spd: 136, spe: 380 },
    ivs: { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 },
    level: 100,
  },
  {
    name: 'Bulbasaur',
    species: 'Bulbasaur',
    item: 'Eviolite',
    ability: 'Overgrow',
    moves: ['Sludge Bomb', 'Giga Drain', 'Leech Seed', 'Sleep Powder'],
    nature: 'Bold',
    gender: 'M',
    evs: { hp: 252, def: 252, spd: 4 },
    ivs: { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 },
    level: 100,
  },
  {
    name: 'Charizard',
    species: 'Charizard',
    item: 'Charizardite X',
    ability: 'Blaze',
    moves: ['Flare Blitz', 'Dragon Claw', 'Roost', 'Swords Dance'],
    nature: 'Jolly',
    gender: 'M',
    evs: { atk: 267, def: 192, spa: 220, spd: 209, spe: 328 },
    ivs: { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 },
    level: 100,
  },
  {
    name: 'Squirtle',
    species: 'Squirtle',
    item: 'Eviolite',
    ability: 'Torrent',
    moves: ['Surf', 'Ice Beam', 'Rapid Spin', 'Hydro Pump'],
    nature: 'Modest',
    gender: 'M',
    evs: { hp: 252, spa: 252, def: 4 },
    ivs: { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 },
    level: 100,
  },
  {
    name: 'Snorlax',
    species: 'Snorlax',
    item: 'Leftovers',
    ability: 'Thick Fat',
    moves: ['Body Slam', 'Heavy Slam', 'Curse', 'Rest'],
    nature: 'Brave',
    gender: 'M',
    evs: { hp: 252, atk: 252, def: 4 },
    ivs: { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 },
    level: 100,
  },
  {
    name: 'Gengar',
    species: 'Gengar',
    item: 'Life Orb',
    ability: 'Cursed Body',
    moves: ['Shadow Ball', 'Sludge Bomb', 'Focus Blast', 'Protect'],
    nature: 'Timid',
    gender: 'M',
    evs: { spa: 252, spe: 252, hp: 4 },
    ivs: { hp: 31, atk: 0, def: 31, spa: 31, spd: 31, spe: 31 },
    level: 100,
  },
  {
    name: 'Eevee',
    species: 'Eevee',
    item: 'Life Orb',
    ability: 'Adaptability',
    moves: ['Quick Attack', 'Takedown', 'Bite', 'Return'],
    nature: 'Jolly',
    gender: 'M',
    evs: { atk: 252, spe: 252, hp: 4 },
    ivs: { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 },
    level: 100,
  },
  {
    name: 'Lucario',
    species: 'Lucario',
    item: 'Focus Sash',
    ability: 'Justified',
    moves: ['Close Combat', 'Meteor Mash', 'Extreme Speed', 'Swords Dance'],
    nature: 'Jolly',
    gender: 'M',
    evs: { atk: 252, spe: 252, hp: 4 },
    ivs: { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 },
    level: 100,
  },
];