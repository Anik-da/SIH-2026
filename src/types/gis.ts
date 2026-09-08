export type LayerId =
  | 'terrain'
  | 'imagery'
  | 'parcels'
  | 'buildings'
  | 'survey'
  | 'underground'
  | 'conflicts';

export interface LayerConfig {
  id: LayerId;
  label: string;
  description: string;
  visible: boolean;
  color: string;
}

export type SelectionKind =
  | 'parcel'
  | 'building'
  | 'floor'
  | 'verticalProperty'
  | 'conflict';

export interface SelectionInfo {
  kind: SelectionKind;
  id: string;
  label: string;
  data?: Record<string, unknown>;
}

export interface Coordinates {
  latitude: number;
  longitude: number;
  elevation: number;
}

export const DEMO_AREA = {
  name: 'Sapthagiri NPS University (3D Neoclassical Palace)',
  longitude: 77.50426,
  latitude: 13.06746,
  height: 260,
};



export const DEMO_LOCATIONS = [
  {
    id: 'live_gps',
    name: '📍 My Current Live GPS Location',
    longitude: 77.5946,
    latitude: 12.9716,
    height: 600,
  },
  {
    id: 'bengaluru',
    name: '🇮🇳 Bengaluru Central (M.G. Road & Ward 110)',
    longitude: 77.5946,
    latitude: 12.9716,
    height: 950,
  },
  {
    id: 'delhi',
    name: '🇮🇳 New Delhi (Connaught Place & Barakhamba)',
    longitude: 77.2167,
    latitude: 28.6304,
    height: 950,
  },
  {
    id: 'mumbai',
    name: '🇮🇳 Mumbai (Bandra-Kurla Complex Financial Hub)',
    longitude: 72.8679,
    latitude: 19.0657,
    height: 950,
  },
  {
    id: 'hyderabad',
    name: '🇮🇳 Hyderabad (HITEC City Cyber Towers)',
    longitude: 78.3772,
    latitude: 17.4504,
    height: 950,
  },
  {
    id: 'nyc',
    name: '🗽 New York City (Photorealistic 3D Mesh)',
    longitude: -74.0060,
    latitude: 40.7128,
    height: 1000,
  },
];

export const DEFAULT_LAYERS: LayerConfig[] = [
  { id: 'terrain', label: 'Terrain', description: '3D terrain elevation', visible: true, color: '#8b7355' },
  { id: 'imagery', label: 'Imagery', description: 'Satellite imagery layer', visible: true, color: '#2a7fff' },
  { id: 'parcels', label: 'Parcels', description: 'Cadastral parcel polygons', visible: true, color: '#22d3ee' },
  { id: 'buildings', label: 'Buildings', description: '3D building models', visible: true, color: '#f59e0b' },
  { id: 'survey', label: 'Survey Data', description: 'Survey control points', visible: false, color: '#34d399' },
  { id: 'underground', label: 'Underground', description: 'Subsurface utility assets', visible: false, color: '#a78bfa' },
  { id: 'conflicts', label: 'Validation Conflicts', description: 'Detected spatial conflicts', visible: false, color: '#ef4444' },
];
