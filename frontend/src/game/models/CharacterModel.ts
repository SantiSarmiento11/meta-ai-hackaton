import char0Avatar from '../../assets/characters/char_0_avatar.png';
import char1Avatar from '../../assets/characters/char_1_avatar.png';
import char2Avatar from '../../assets/characters/char_2_avatar.png';
import char3Avatar from '../../assets/characters/char_3_avatar.png';
import char0Full from '../../assets/characters/char_0_full.png';
import char1Full from '../../assets/characters/char_1_full.png';
import char2Full from '../../assets/characters/char_2_full.png';
import char3Full from '../../assets/characters/char_3_full.png';

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
    role: 'Tech Lead & Architect',
    department: 'Engineering',
    description: 'Arquitecto de sistemas con traje ejecutivo moderno. Enfocado en estabilidad, velocidad y escalabilidad de la infraestructura.',
    themeColor: '#38bdf8',
    avatarUrl: char0Avatar,
    fullUrl: char0Full,
    speed: 210,
    traits: ['Estrategia', 'Sistemas', 'Rendimiento'],
  },
  {
    id: 'char_1',
    name: 'Sam Rivera',
    role: 'Product Manager',
    department: 'Producto',
    description: 'Líder de producto dinámica con estilo corporativo casual. Conecta visión de usuario y entregas de alto impacto.',
    themeColor: '#fb923c',
    avatarUrl: char1Avatar,
    fullUrl: char1Full,
    speed: 200,
    traits: ['Roadmaps', 'Priorización', 'Agilidad'],
  },
  {
    id: 'char_2',
    name: 'Taylor Chen',
    role: 'Creative Developer',
    department: 'Experiencia & Frontend',
    description: 'Desarrollador creativo con chaqueta roja distintiva. Especialista en micro-interacciones, animaciones y game feel.',
    themeColor: '#f87171',
    avatarUrl: char2Avatar,
    fullUrl: char2Full,
    speed: 220,
    traits: ['Animación', 'Shader FX', 'Creatividad'],
  },
  {
    id: 'char_3',
    name: 'Jordan Díaz',
    role: 'Lead UI/UX Designer',
    department: 'Diseño',
    description: 'Diseñador visual con atuendo beige minimalista. Perfecciona cada detalle visual, contraste y ergonomía espacial.',
    themeColor: '#a78bfa',
    avatarUrl: char3Avatar,
    fullUrl: char3Full,
    speed: 200,
    traits: ['Sistemas de Diseño', 'Accesibilidad', 'Pixel Art'],
  },
];

export const CHARACTERS_ATLAS_DATA = {
  "frames": {
    "char_0_frame_0": {
      "frame": {
        "x": 95,
        "y": 14,
        "w": 91,
        "h": 214
      },
      "rotated": false,
      "trimmed": true,
      "spriteSourceSize": {
        "x": 37,
        "y": 8,
        "w": 91,
        "h": 214
      },
      "sourceSize": {
        "w": 160,
        "h": 230
      },
      "pivot": {
        "x": 0.5,
        "y": 1.0
      }
    },
    "char_0_frame_1": {
      "frame": {
        "x": 244,
        "y": 14,
        "w": 91,
        "h": 212
      },
      "rotated": false,
      "trimmed": true,
      "spriteSourceSize": {
        "x": 29,
        "y": 10,
        "w": 91,
        "h": 212
      },
      "sourceSize": {
        "w": 160,
        "h": 230
      },
      "pivot": {
        "x": 0.5,
        "y": 1.0
      }
    },
    "char_0_frame_2": {
      "frame": {
        "x": 399,
        "y": 14,
        "w": 88,
        "h": 214
      },
      "rotated": false,
      "trimmed": true,
      "spriteSourceSize": {
        "x": 30,
        "y": 8,
        "w": 88,
        "h": 214
      },
      "sourceSize": {
        "w": 160,
        "h": 230
      },
      "pivot": {
        "x": 0.5,
        "y": 1.0
      }
    },
    "char_0_frame_3": {
      "frame": {
        "x": 555,
        "y": 15,
        "w": 91,
        "h": 213
      },
      "rotated": false,
      "trimmed": true,
      "spriteSourceSize": {
        "x": 39,
        "y": 9,
        "w": 91,
        "h": 213
      },
      "sourceSize": {
        "w": 160,
        "h": 230
      },
      "pivot": {
        "x": 0.5,
        "y": 1.0
      }
    },
    "char_0_frame_4": {
      "frame": {
        "x": 696,
        "y": 14,
        "w": 101,
        "h": 214
      },
      "rotated": false,
      "trimmed": true,
      "spriteSourceSize": {
        "x": 23,
        "y": 8,
        "w": 101,
        "h": 214
      },
      "sourceSize": {
        "w": 160,
        "h": 230
      },
      "pivot": {
        "x": 0.5,
        "y": 1.0
      }
    },
    "char_0_frame_5": {
      "frame": {
        "x": 844,
        "y": 16,
        "w": 95,
        "h": 206
      },
      "rotated": false,
      "trimmed": true,
      "spriteSourceSize": {
        "x": 30,
        "y": 16,
        "w": 95,
        "h": 206
      },
      "sourceSize": {
        "w": 160,
        "h": 230
      },
      "pivot": {
        "x": 0.5,
        "y": 1.0
      }
    },
    "char_0_frame_6": {
      "frame": {
        "x": 988,
        "y": 17,
        "w": 88,
        "h": 211
      },
      "rotated": false,
      "trimmed": true,
      "spriteSourceSize": {
        "x": 25,
        "y": 11,
        "w": 88,
        "h": 211
      },
      "sourceSize": {
        "w": 160,
        "h": 230
      },
      "pivot": {
        "x": 0.5,
        "y": 1.0
      }
    },
    "char_0_frame_7": {
      "frame": {
        "x": 1149,
        "y": 22,
        "w": 104,
        "h": 206
      },
      "rotated": false,
      "trimmed": true,
      "spriteSourceSize": {
        "x": 13,
        "y": 16,
        "w": 104,
        "h": 206
      },
      "sourceSize": {
        "w": 160,
        "h": 230
      },
      "pivot": {
        "x": 0.5,
        "y": 1.0
      }
    },
    "char_0_frame_8": {
      "frame": {
        "x": 1321,
        "y": 20,
        "w": 100,
        "h": 208
      },
      "rotated": false,
      "trimmed": true,
      "spriteSourceSize": {
        "x": 15,
        "y": 14,
        "w": 100,
        "h": 208
      },
      "sourceSize": {
        "w": 160,
        "h": 230
      },
      "pivot": {
        "x": 0.5,
        "y": 1.0
      }
    },
    "char_0_frame_9": {
      "frame": {
        "x": 1499,
        "y": 19,
        "w": 117,
        "h": 209
      },
      "rotated": false,
      "trimmed": true,
      "spriteSourceSize": {
        "x": 14,
        "y": 13,
        "w": 117,
        "h": 209
      },
      "sourceSize": {
        "w": 160,
        "h": 230
      },
      "pivot": {
        "x": 0.5,
        "y": 1.0
      }
    },
    "char_1_frame_0": {
      "frame": {
        "x": 92,
        "y": 249,
        "w": 93,
        "h": 200
      },
      "rotated": false,
      "trimmed": true,
      "spriteSourceSize": {
        "x": 35,
        "y": 22,
        "w": 93,
        "h": 200
      },
      "sourceSize": {
        "w": 160,
        "h": 230
      },
      "pivot": {
        "x": 0.5,
        "y": 1.0
      }
    },
    "char_1_frame_1": {
      "frame": {
        "x": 249,
        "y": 254,
        "w": 86,
        "h": 193
      },
      "rotated": false,
      "trimmed": true,
      "spriteSourceSize": {
        "x": 43,
        "y": 29,
        "w": 86,
        "h": 193
      },
      "sourceSize": {
        "w": 160,
        "h": 230
      },
      "pivot": {
        "x": 0.5,
        "y": 1.0
      }
    },
    "char_1_frame_2": {
      "frame": {
        "x": 400,
        "y": 249,
        "w": 91,
        "h": 200
      },
      "rotated": false,
      "trimmed": true,
      "spriteSourceSize": {
        "x": 27,
        "y": 22,
        "w": 91,
        "h": 200
      },
      "sourceSize": {
        "w": 160,
        "h": 230
      },
      "pivot": {
        "x": 0.5,
        "y": 1.0
      }
    },
    "char_1_frame_3": {
      "frame": {
        "x": 557,
        "y": 249,
        "w": 94,
        "h": 201
      },
      "rotated": false,
      "trimmed": true,
      "spriteSourceSize": {
        "x": 30,
        "y": 21,
        "w": 94,
        "h": 201
      },
      "sourceSize": {
        "w": 160,
        "h": 230
      },
      "pivot": {
        "x": 0.5,
        "y": 1.0
      }
    },
    "char_1_frame_4": {
      "frame": {
        "x": 702,
        "y": 249,
        "w": 93,
        "h": 202
      },
      "rotated": false,
      "trimmed": true,
      "spriteSourceSize": {
        "x": 20,
        "y": 20,
        "w": 93,
        "h": 202
      },
      "sourceSize": {
        "w": 160,
        "h": 230
      },
      "pivot": {
        "x": 0.5,
        "y": 1.0
      }
    },
    "char_1_frame_5": {
      "frame": {
        "x": 845,
        "y": 249,
        "w": 93,
        "h": 202
      },
      "rotated": false,
      "trimmed": true,
      "spriteSourceSize": {
        "x": 21,
        "y": 20,
        "w": 93,
        "h": 202
      },
      "sourceSize": {
        "w": 160,
        "h": 230
      },
      "pivot": {
        "x": 0.5,
        "y": 1.0
      }
    },
    "char_1_frame_6": {
      "frame": {
        "x": 983,
        "y": 251,
        "w": 93,
        "h": 201
      },
      "rotated": false,
      "trimmed": true,
      "spriteSourceSize": {
        "x": 19,
        "y": 21,
        "w": 93,
        "h": 201
      },
      "sourceSize": {
        "w": 160,
        "h": 230
      },
      "pivot": {
        "x": 0.5,
        "y": 1.0
      }
    },
    "char_1_frame_7": {
      "frame": {
        "x": 1146,
        "y": 251,
        "w": 110,
        "h": 194
      },
      "rotated": false,
      "trimmed": true,
      "spriteSourceSize": {
        "x": 2,
        "y": 28,
        "w": 110,
        "h": 194
      },
      "sourceSize": {
        "w": 160,
        "h": 230
      },
      "pivot": {
        "x": 0.5,
        "y": 1.0
      }
    },
    "char_1_frame_8": {
      "frame": {
        "x": 1315,
        "y": 250,
        "w": 109,
        "h": 195
      },
      "rotated": false,
      "trimmed": true,
      "spriteSourceSize": {
        "x": 1,
        "y": 27,
        "w": 109,
        "h": 195
      },
      "sourceSize": {
        "w": 160,
        "h": 230
      },
      "pivot": {
        "x": 0.5,
        "y": 1.0
      }
    },
    "char_1_frame_9": {
      "frame": {
        "x": 1477,
        "y": 250,
        "w": 146,
        "h": 200
      },
      "rotated": false,
      "trimmed": true,
      "spriteSourceSize": {
        "x": 11,
        "y": 22,
        "w": 146,
        "h": 200
      },
      "sourceSize": {
        "w": 160,
        "h": 230
      },
      "pivot": {
        "x": 0.5,
        "y": 1.0
      }
    },
    "char_2_frame_0": {
      "frame": {
        "x": 92,
        "y": 465,
        "w": 92,
        "h": 211
      },
      "rotated": false,
      "trimmed": true,
      "spriteSourceSize": {
        "x": 37,
        "y": 11,
        "w": 92,
        "h": 211
      },
      "sourceSize": {
        "w": 160,
        "h": 230
      },
      "pivot": {
        "x": 0.5,
        "y": 1.0
      }
    },
    "char_2_frame_1": {
      "frame": {
        "x": 245,
        "y": 467,
        "w": 91,
        "h": 209
      },
      "rotated": false,
      "trimmed": true,
      "spriteSourceSize": {
        "x": 37,
        "y": 13,
        "w": 91,
        "h": 209
      },
      "sourceSize": {
        "w": 160,
        "h": 230
      },
      "pivot": {
        "x": 0.5,
        "y": 1.0
      }
    },
    "char_2_frame_2": {
      "frame": {
        "x": 402,
        "y": 467,
        "w": 95,
        "h": 209
      },
      "rotated": false,
      "trimmed": true,
      "spriteSourceSize": {
        "x": 39,
        "y": 13,
        "w": 95,
        "h": 209
      },
      "sourceSize": {
        "w": 160,
        "h": 230
      },
      "pivot": {
        "x": 0.5,
        "y": 1.0
      }
    },
    "char_2_frame_3": {
      "frame": {
        "x": 557,
        "y": 466,
        "w": 92,
        "h": 210
      },
      "rotated": false,
      "trimmed": true,
      "spriteSourceSize": {
        "x": 26,
        "y": 12,
        "w": 92,
        "h": 210
      },
      "sourceSize": {
        "w": 160,
        "h": 230
      },
      "pivot": {
        "x": 0.5,
        "y": 1.0
      }
    },
    "char_2_frame_4": {
      "frame": {
        "x": 699,
        "y": 466,
        "w": 99,
        "h": 210
      },
      "rotated": false,
      "trimmed": true,
      "spriteSourceSize": {
        "x": 19,
        "y": 12,
        "w": 99,
        "h": 210
      },
      "sourceSize": {
        "w": 160,
        "h": 230
      },
      "pivot": {
        "x": 0.5,
        "y": 1.0
      }
    },
    "char_2_frame_5": {
      "frame": {
        "x": 849,
        "y": 467,
        "w": 90,
        "h": 207
      },
      "rotated": false,
      "trimmed": true,
      "spriteSourceSize": {
        "x": 32,
        "y": 15,
        "w": 90,
        "h": 207
      },
      "sourceSize": {
        "w": 160,
        "h": 230
      },
      "pivot": {
        "x": 0.5,
        "y": 1.0
      }
    },
    "char_2_frame_6": {
      "frame": {
        "x": 1150,
        "y": 467,
        "w": 107,
        "h": 207
      },
      "rotated": false,
      "trimmed": true,
      "spriteSourceSize": {
        "x": 10,
        "y": 15,
        "w": 107,
        "h": 207
      },
      "sourceSize": {
        "w": 160,
        "h": 230
      },
      "pivot": {
        "x": 0.5,
        "y": 1.0
      }
    },
    "char_2_frame_7": {
      "frame": {
        "x": 1322,
        "y": 467,
        "w": 113,
        "h": 209
      },
      "rotated": false,
      "trimmed": true,
      "spriteSourceSize": {
        "x": 6,
        "y": 13,
        "w": 113,
        "h": 209
      },
      "sourceSize": {
        "w": 160,
        "h": 230
      },
      "pivot": {
        "x": 0.5,
        "y": 1.0
      }
    },
    "char_2_frame_8": {
      "frame": {
        "x": 1503,
        "y": 467,
        "w": 108,
        "h": 209
      },
      "rotated": false,
      "trimmed": true,
      "spriteSourceSize": {
        "x": 11,
        "y": 13,
        "w": 108,
        "h": 209
      },
      "sourceSize": {
        "w": 160,
        "h": 230
      },
      "pivot": {
        "x": 0.5,
        "y": 1.0
      }
    },
    "char_3_frame_0": {
      "frame": {
        "x": 94,
        "y": 698,
        "w": 90,
        "h": 211
      },
      "rotated": false,
      "trimmed": true,
      "spriteSourceSize": {
        "x": 38,
        "y": 11,
        "w": 90,
        "h": 211
      },
      "sourceSize": {
        "w": 160,
        "h": 230
      },
      "pivot": {
        "x": 0.5,
        "y": 1.0
      }
    },
    "char_3_frame_1": {
      "frame": {
        "x": 249,
        "y": 699,
        "w": 89,
        "h": 207
      },
      "rotated": false,
      "trimmed": true,
      "spriteSourceSize": {
        "x": 42,
        "y": 15,
        "w": 89,
        "h": 207
      },
      "sourceSize": {
        "w": 160,
        "h": 230
      },
      "pivot": {
        "x": 0.5,
        "y": 1.0
      }
    },
    "char_3_frame_2": {
      "frame": {
        "x": 409,
        "y": 699,
        "w": 90,
        "h": 210
      },
      "rotated": false,
      "trimmed": true,
      "spriteSourceSize": {
        "x": 35,
        "y": 12,
        "w": 90,
        "h": 210
      },
      "sourceSize": {
        "w": 160,
        "h": 230
      },
      "pivot": {
        "x": 0.5,
        "y": 1.0
      }
    },
    "char_3_frame_3": {
      "frame": {
        "x": 560,
        "y": 699,
        "w": 97,
        "h": 210
      },
      "rotated": false,
      "trimmed": true,
      "spriteSourceSize": {
        "x": 25,
        "y": 12,
        "w": 97,
        "h": 210
      },
      "sourceSize": {
        "w": 160,
        "h": 230
      },
      "pivot": {
        "x": 0.5,
        "y": 1.0
      }
    },
    "char_3_frame_4": {
      "frame": {
        "x": 697,
        "y": 698,
        "w": 103,
        "h": 207
      },
      "rotated": false,
      "trimmed": true,
      "spriteSourceSize": {
        "x": 13,
        "y": 15,
        "w": 103,
        "h": 207
      },
      "sourceSize": {
        "w": 160,
        "h": 230
      },
      "pivot": {
        "x": 0.5,
        "y": 1.0
      }
    },
    "char_3_frame_5": {
      "frame": {
        "x": 852,
        "y": 698,
        "w": 103,
        "h": 202
      },
      "rotated": false,
      "trimmed": true,
      "spriteSourceSize": {
        "x": 24,
        "y": 20,
        "w": 103,
        "h": 202
      },
      "sourceSize": {
        "w": 160,
        "h": 230
      },
      "pivot": {
        "x": 0.5,
        "y": 1.0
      }
    },
    "char_3_frame_6": {
      "frame": {
        "x": 1129,
        "y": 704,
        "w": 110,
        "h": 207
      },
      "rotated": false,
      "trimmed": true,
      "spriteSourceSize": {
        "x": 9,
        "y": 15,
        "w": 110,
        "h": 207
      },
      "sourceSize": {
        "w": 160,
        "h": 230
      },
      "pivot": {
        "x": 0.5,
        "y": 1.0
      }
    },
    "char_3_frame_7": {
      "frame": {
        "x": 1317,
        "y": 701,
        "w": 110,
        "h": 210
      },
      "rotated": false,
      "trimmed": true,
      "spriteSourceSize": {
        "x": 9,
        "y": 12,
        "w": 110,
        "h": 210
      },
      "sourceSize": {
        "w": 160,
        "h": 230
      },
      "pivot": {
        "x": 0.5,
        "y": 1.0
      }
    },
    "char_3_frame_8": {
      "frame": {
        "x": 1503,
        "y": 702,
        "w": 110,
        "h": 209
      },
      "rotated": false,
      "trimmed": true,
      "spriteSourceSize": {
        "x": 9,
        "y": 13,
        "w": 110,
        "h": 209
      },
      "sourceSize": {
        "w": 160,
        "h": 230
      },
      "pivot": {
        "x": 0.5,
        "y": 1.0
      }
    }
  },
  "meta": {
    "app": "Sleeply Character Atlas Generator",
    "version": "1.0",
    "image": "Hoja de sprites pixel art transparente.png",
    "format": "RGBA8888",
    "size": {
      "w": 1679,
      "h": 937
    },
    "scale": "1"
  }
};

export const getCharacterById = (id: string): CharacterProfile | undefined => {
  return CHARACTERS_CATALOG.find(c => c.id === id);
};


export interface AnimationDefinition {
  key: string;
  frames: string[];
  frameRate: number;
  repeat: number;
}

export const CHARACTER_ANIMATIONS: Record<CharacterId, AnimationDefinition[]> = {
  char_0: [
    { key: 'char_0_idle_down', frames: ['char_0_frame_0'], frameRate: 1, repeat: 0 },
    { key: 'char_0_walk_down', frames: ['char_0_frame_3', 'char_0_frame_0', 'char_0_frame_4', 'char_0_frame_6'], frameRate: 6, repeat: -1 },
    { key: 'char_0_idle_up', frames: ['char_0_frame_1'], frameRate: 1, repeat: 0 },
    { key: 'char_0_walk_up', frames: ['char_0_frame_1', 'char_0_frame_2'], frameRate: 6, repeat: -1 },
    { key: 'char_0_idle_side', frames: ['char_0_frame_7'], frameRate: 1, repeat: 0 },
    { key: 'char_0_walk_side', frames: ['char_0_frame_7', 'char_0_frame_8'], frameRate: 6, repeat: -1 },
  ],
  char_1: [
    { key: 'char_1_idle_down', frames: ['char_1_frame_0'], frameRate: 1, repeat: 0 },
    { key: 'char_1_walk_down', frames: ['char_1_frame_3', 'char_1_frame_0', 'char_1_frame_4', 'char_1_frame_6'], frameRate: 6, repeat: -1 },
    { key: 'char_1_idle_up', frames: ['char_1_frame_1'], frameRate: 1, repeat: 0 },
    { key: 'char_1_walk_up', frames: ['char_1_frame_1', 'char_1_frame_2'], frameRate: 6, repeat: -1 },
    { key: 'char_1_idle_side', frames: ['char_1_frame_7'], frameRate: 1, repeat: 0 },
    { key: 'char_1_walk_side', frames: ['char_1_frame_7', 'char_1_frame_8'], frameRate: 6, repeat: -1 },
  ],
  char_2: [
    { key: 'char_2_idle_down', frames: ['char_2_frame_0'], frameRate: 1, repeat: 0 },
    { key: 'char_2_walk_down', frames: ['char_2_frame_2', 'char_2_frame_0', 'char_2_frame_3', 'char_2_frame_4'], frameRate: 6, repeat: -1 },
    { key: 'char_2_idle_up', frames: ['char_2_frame_1'], frameRate: 1, repeat: 0 },
    { key: 'char_2_walk_up', frames: ['char_2_frame_1'], frameRate: 4, repeat: -1 },
    { key: 'char_2_idle_side', frames: ['char_2_frame_6'], frameRate: 1, repeat: 0 },
    { key: 'char_2_walk_side', frames: ['char_2_frame_6', 'char_2_frame_7', 'char_2_frame_8'], frameRate: 6, repeat: -1 },
  ],
  char_3: [
    { key: 'char_3_idle_down', frames: ['char_3_frame_0'], frameRate: 1, repeat: 0 },
    { key: 'char_3_walk_down', frames: ['char_3_frame_2', 'char_3_frame_0', 'char_3_frame_3', 'char_3_frame_4'], frameRate: 6, repeat: -1 },
    { key: 'char_3_idle_up', frames: ['char_3_frame_1'], frameRate: 1, repeat: 0 },
    { key: 'char_3_walk_up', frames: ['char_3_frame_1'], frameRate: 4, repeat: -1 },
    { key: 'char_3_idle_side', frames: ['char_3_frame_6'], frameRate: 1, repeat: 0 },
    { key: 'char_3_walk_side', frames: ['char_3_frame_6', 'char_3_frame_7', 'char_3_frame_8'], frameRate: 6, repeat: -1 },
  ],
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
