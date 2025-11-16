export interface ActivePokemon {
  species: string;
  condition: string;
  hpPercent: number;
  status: string | null;
  name: string;
  details: string;
  slot: 'p1a' | 'p2a';
}

export interface PlayerBattleState {
  active: ActivePokemon | null;
  teamSize: number;
}

export interface BattleState {
  p1: PlayerBattleState;
  p2: PlayerBattleState;
  logs: string[];
  turn: number;
  isActive: boolean;
}

export const initialBattleState: BattleState = {
  p1: { active: null, teamSize: 0 },
  p2: { active: null, teamSize: 0 },
  logs: [],
  turn: 0,
  isActive: false,
};

export const parseBattleLog = (currentState: BattleState, chunk: string): BattleState => {
  let newState = { ...currentState };
  
  const lines = chunk.split('\n');

  lines.forEach((line) => {
    newState.logs.push(line);

    if (line.startsWith('|player|')) {
      const parts = line.split('|');
      const playerSlot = parts[2] as 'p1' | 'p2';
      const teamSizePart = lines.find(l => l.startsWith(`|teamsize|${playerSlot}|`));
      if (teamSizePart) {
        const size = parseInt(teamSizePart.split('|')[3]);
        if (playerSlot === 'p1') {
          newState.p1.teamSize = size;
        } else {
          newState.p2.teamSize = size;
        }
      }
      newState.isActive = true;
    }

    if (line.startsWith('|turn|')) {
      newState.turn = parseInt(line.split('|')[2]);
    }

    if (line.startsWith('|switch|') || line.startsWith('|drag|') || line.startsWith('|faint|')) {
      const parts = line.split('|');
      const slot = parts[2] as 'p1a' | 'p2a';
      const playerSlot = slot.slice(0, 2) as 'p1' | 'p2';

      if (line.startsWith('|faint|')) {
        if (playerSlot === 'p1') newState.p1.active = null;
        if (playerSlot === 'p2') newState.p2.active = null;
        return;
      }
      
      const details = parts[3].split(', ');
      const species = details[0];
      const condition = parts[4] || '100/100';
      const [currentHpStr, maxHpStr] = condition.split(' ')[0].split('/');
      const currentHp = parseInt(currentHpStr);
      const maxHp = parseInt(maxHpStr);
      const hpPercent = maxHp > 0 ? Math.round((currentHp / maxHp) * 100) : 100;
      const status = condition.includes(' ') ? condition.split(' ')[1] : null;

      const active: ActivePokemon = {
        species: species,
        condition: condition,
        hpPercent: hpPercent,
        status: status,
        name: species,
        details: parts[3],
        slot: slot,
      };

      if (playerSlot === 'p1') newState.p1.active = active;
      if (playerSlot === 'p2') newState.p2.active = active;
    }

    if (line.startsWith('|-damage|')) {
      const parts = line.split('|');
      const targetSlot = parts[2].slice(0, 3) as 'p1a' | 'p2a';
      const playerSlot = targetSlot.slice(0, 2) as 'p1' | 'p2';
      
      const condition = parts[3].split(' ')[0] || '0/100';
      const [currentHpStr, maxHpStr] = condition.split('/');
      const currentHp = parseInt(currentHpStr);
      const maxHp = parseInt(maxHpStr);
      const hpPercent = maxHp > 0 ? Math.round((currentHp / maxHp) * 100) : 0;
      const status = parts[3].includes(' ') ? parts[3].split(' ')[1] : null;
      
      const targetState = playerSlot === 'p1' ? newState.p1 : newState.p2;

      if (targetState.active) {
        targetState.active.condition = condition;
        targetState.active.hpPercent = hpPercent;
        targetState.active.status = status;
      }
    }
  });

  return newState;
};