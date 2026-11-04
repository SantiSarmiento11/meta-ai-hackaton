import char0Avatar from '../../assets/characters/char_0_avatar.png';
import char1Avatar from '../../assets/characters/char_1_avatar.png';
import char2Avatar from '../../assets/characters/char_2_avatar.png';
import char3Avatar from '../../assets/characters/char_3_avatar.png';
import char0Full from '../../assets/characters/char_0_full.png';
import char1Full from '../../assets/characters/char_1_full.png';
import char2Full from '../../assets/characters/char_2_full.png';
import char3Full from '../../assets/characters/char_3_full.png';
import charactersAtlasData from '../../assets/Spritesheets/characters_atlas.json';

export type CharacterId = 'char_0' | 'char_1' | 'char_2' | 'char_3';

export interface CharacterProfile {
  id: CharacterId;
  name: string;
  role: string;
  department: string;
  description: string;
  themeColor: string;
  avatarUrl: string;
  fullUrl: string;
  speed: number;
  traits: string[];
}

export const CHARACTERS_CATALOG: CharacterProfile[] = [
  {
    id: 'char_0',
    name: 'Alex Vance',
    role: 'CEO & Tech Lead',
    department: 'Executive Leadership & Architecture',
    description: 'Chief Executive Officer and principal architect in a sharp dark business suit. Leads strategic vision, platform architecture, and smart office operations.',
    themeColor: '#38bdf8',
    avatarUrl: char0Avatar,
    fullUrl: char0Full,
    speed: 215,
    traits: ['Leadership', 'Strategy', 'Scalability'],
  },
  {
    id: 'char_1',
    name: 'Sam Rivera',
    role: 'Co-Worker Developer',
    department: 'Engineering & Automation',
    description: 'Software developer and collaborative teammate in smart-casual attire. Coordinates code repositories, pull requests, automated workflows, and technical tasks.',
    themeColor: '#fb923c',
    avatarUrl: char1Avatar,
    fullUrl: char1Full,
    speed: 200,
    traits: ['Automation', 'Collaboration', 'Agility'],
  },
  {
    id: 'char_2',
    name: 'Taylor Chen',
    role: 'Executive Secretary & Assistant',
    department: 'Operations & Coordination',
    description: 'Executive assistant and office coordinator with distinguished professional demeanor. Manages Gmail communication, meeting agendas, and Google Drive assets.',
    themeColor: '#ec4899',
    avatarUrl: char2Avatar,
    fullUrl: char2Full,
    speed: 210,
    traits: ['Coordination', 'Communication', 'Organization'],
  },
  {
    id: 'char_3',
    name: 'Jordan Díaz',
    role: 'Operations Manager & Auditor',
    department: 'Operations & Quality Assurance',
    description: 'Operations manager and system supervisor. Oversees multi-agent health, PostgreSQL stability, and error triage during autonomous night runs.',
    themeColor: '#a855f7',
    avatarUrl: char3Avatar,
    fullUrl: char3Full,
    speed: 205,
    traits: ['Supervision', 'Reliability', 'Auditing'],
  },
];

export const CHARACTERS_ATLAS_DATA = charactersAtlasData;

export const getCharacterById = (id: string): CharacterProfile | undefined => {
  return CHARACTERS_CATALOG.find(c => c.id === id);
};

export interface AnimationDefinition {
  key: string;
  frames: string[];
  frameRate: number;
  repeat: number;
}

const DIRECTIONS_LIST = [
  'north',
  'northeast',
  'east',
  'southeast',
  'south',
  'southwest',
  'west',
  'northwest',
] as const;

const DIRECTION_CARDINAL_MAP: Record<string, string> = {
  down: 'south',
  up: 'north',
  side: 'east',
  right: 'east',
  left: 'west',
  down_right: 'southeast',
  down_left: 'southwest',
  up_right: 'northeast',
  up_left: 'northwest',
};

function buildCharacterAnimations(charId: CharacterId): AnimationDefinition[] {
  const anims: AnimationDefinition[] = [];

  // 1. Build animations for all 8 standard directions
  for (const dir of DIRECTIONS_LIST) {
    // Idle (1 frame)
    anims.push({
      key: `${charId}_idle_${dir}`,
      frames: [`${charId}_idle_${dir}`],
      frameRate: 1,
      repeat: 0,
    });

    // Walk (alternates idle and walk poses for natural walking cycle)
    anims.push({
      key: `${charId}_walk_${dir}`,
      frames: [`${charId}_idle_${dir}`, `${charId}_walk_${dir}`],
      frameRate: 6,
      repeat: -1,
    });

    // Talking (alternates idle and speaking gesture)
    anims.push({
      key: `${charId}_talking_${dir}`,
      frames: [`${charId}_idle_${dir}`, `${charId}_talking_${dir}`],
      frameRate: 4,
      repeat: -1,
    });

    // Seated (static or low rate)
    anims.push({
      key: `${charId}_seated_${dir}`,
      frames: [`${charId}_seated_${dir}`],
      frameRate: 1,
      repeat: 0,
    });

    // Agitated (alert/frantic pulse)
    anims.push({
      key: `${charId}_agitated_${dir}`,
      frames: [`${charId}_idle_${dir}`, `${charId}_agitated_${dir}`],
      frameRate: 6,
      repeat: -1,
    });

    // Collapsed / Sleeping / Exhausted
    anims.push({
      key: `${charId}_collapsed_${dir}`,
      frames: [`${charId}_collapsed_${dir}`],
      frameRate: 1,
      repeat: 0,
    });
  }

  // 2. Add cardinal and isometric shorthand aliases (down, up, side, left, right, etc.)
  for (const [alias, targetDir] of Object.entries(DIRECTION_CARDINAL_MAP)) {
    anims.push({
      key: `${charId}_idle_${alias}`,
      frames: [`${charId}_idle_${targetDir}`],
      frameRate: 1,
      repeat: 0,
    });

    anims.push({
      key: `${charId}_walk_${alias}`,
      frames: [`${charId}_idle_${targetDir}`, `${charId}_walk_${targetDir}`],
      frameRate: 6,
      repeat: -1,
    });

    anims.push({
      key: `${charId}_talking_${alias}`,
      frames: [`${charId}_idle_${targetDir}`, `${charId}_talking_${targetDir}`],
      frameRate: 4,
      repeat: -1,
    });

    anims.push({
      key: `${charId}_seated_${alias}`,
      frames: [`${charId}_seated_${targetDir}`],
      frameRate: 1,
      repeat: 0,
    });

    anims.push({
      key: `${charId}_agitated_${alias}`,
      frames: [`${charId}_idle_${targetDir}`, `${charId}_agitated_${targetDir}`],
      frameRate: 6,
      repeat: -1,
    });

    anims.push({
      key: `${charId}_collapsed_${alias}`,
      frames: [`${charId}_collapsed_${targetDir}`],
      frameRate: 1,
      repeat: 0,
    });
  }

  return anims;
}

export const CHARACTER_ANIMATIONS: Record<CharacterId, AnimationDefinition[]> = {
  char_0: buildCharacterAnimations('char_0'),
  char_1: buildCharacterAnimations('char_1'),
  char_2: buildCharacterAnimations('char_2'),
  char_3: buildCharacterAnimations('char_3'),
};

export const registerCharacterAnimations = (scene: Phaser.Scene): void => {
  for (const charId of Object.keys(CHARACTER_ANIMATIONS) as CharacterId[]) {
    const animsList = CHARACTER_ANIMATIONS[charId];
    for (const anim of animsList) {
      if (!scene.anims.exists(anim.key)) {
        scene.anims.create({
          key: anim.key,
          frames: anim.frames.map(frame => ({
            key: 'characters_atlas',
            frame,
          })),
          frameRate: anim.frameRate,
          repeat: anim.repeat,
        });
      }
    }
  }
};
