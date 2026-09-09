export const BASE_ULPIN = '12A34B56C78D90';

export const FLOOR_HEIGHT = 3.2;

export const BUILDING_ID = 'BLD001';

export const FLOOR_IDS = ['B01', 'G', 'F01', 'F02', 'F03', 'F04', 'F05', 'F06', 'T'] as const;

export const FLOOR_NAMES: Record<string, string> = {
  B01: 'Basement B01',
  G: 'Ground Floor',
  F01: 'Floor 01',
  F02: 'Floor 02',
  F03: 'Floor 03',
  F04: 'Floor 04',
  F05: 'Floor 05',
  F06: 'Floor 06',
  T: 'Terrace',
};

export const FLOOR_SHORT_NAMES: Record<string, string> = {
  B01: 'B01',
  G: 'G',
  F01: 'F01',
  F02: 'F02',
  F03: 'F03',
  F04: 'F04',
  F05: 'F05',
  F06: 'F06',
  T: 'TERRACE',
};

export const VERTICAL_EXTENSIONS: Record<string, string> = {
  B01: 'B001',
  G: 'G000',
  F01: 'A001',
  F02: 'A002',
  F03: 'A003',
  F04: 'A004',
  F05: 'A005',
  F06: 'A006',
  T: 'T000',
};

export const FLOOR_ORDER_INDEX: Record<string, number> = {
  B01: 0,
  G: 1,
  F01: 2,
  F02: 3,
  F03: 4,
  F04: 5,
  F05: 6,
  F06: 7,
  T: 8,
};

export const FLOOR_NUMBER_MAP: Record<string, number> = {
  B01: -1,
  G: 0,
  F01: 1,
  F02: 2,
  F03: 3,
  F04: 4,
  F05: 5,
  F06: 6,
  T: 7,
};

export const BUILDING_DIMENSIONS = {
  width: 16,
  depth: 12,
  wallThickness: 0.2,
};

export const PLAYER_HEIGHT = 1.7;
export const PLAYER_RADIUS = 0.35;
export const WALK_SPEED = 4;
export const RUN_SPEED = 8;
export const JUMP_VELOCITY = 6;
export const GRAVITY = 20;
