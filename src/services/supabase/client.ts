import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder-postgis.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface PostGISParcel {
  id: string;
  ulpin: string | null; // NULL if unavailable from official source
  survey_number: string | null;
  parcel_id: string;
  pid: string | null;
  area_sqm: number;
  land_use: string;
  district: string;
  taluk: string;
  village: string;
  geojson: any;
  source_type: 'official_government' | 'open_data' | 'derived' | 'user_imported' | 'unverified';
  source_record_id: string;
  confidence_score: number;
  verification_status: 'verified_official' | 'derived' | 'unverified' | 'imported';
}

export interface PostGISBuilding {
  id: string;
  parcel_id: string | null;
  building_name: string | null;
  building_type: string;
  height_m: number;
  floors_count: number;
  built_up_area_sqm: number;
  geojson: any;
  source_type: 'official_government' | 'open_data' | 'derived' | 'user_imported' | 'unverified';
  source_record_id: string;
  confidence_score: number;
  verification_status: 'verified_official' | 'derived' | 'unverified' | 'imported';
}

export async function fetchPostGISParcels(south: number, west: number, north: number, east: number) {
  try {
    const { data, error } = await supabase.rpc('get_parcels_in_bbox', {
      min_lat: south,
      min_lon: west,
      max_lat: north,
      max_lon: east,
    });
    if (error) throw error;
    return (data || []) as PostGISParcel[];
  } catch {
    return [];
  }
}

export async function fetchPostGISBuildings(south: number, west: number, north: number, east: number) {
  try {
    const { data, error } = await supabase.rpc('get_buildings_in_bbox', {
      min_lat: south,
      min_lon: west,
      max_lat: north,
      max_lon: east,
    });
    if (error) throw error;
    return (data || []) as PostGISBuilding[];
  } catch {
    return [];
  }
}
