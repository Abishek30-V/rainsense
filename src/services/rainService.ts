export interface RealRainCell {
  latitude: number;
  longitude: number;
  intensity: 'light' | 'moderate' | 'heavy';
  precipitation: number;
  source: string;
}

export interface SpatialRainData {
  timestamp: string;
  cells: RealRainCell[];
}

const DEGREE_OFFSET = 0.045; // Approx 5km
const GRID_HALF_SIZE = 4; // 9x9 grid

export async function fetchSpatialRainData(userLat: number, userLon: number): Promise<SpatialRainData> {
  const lats: number[] = [];
  const lons: number[] = [];

  // Generate a 9x9 geographic grid centered on the user
  for (let i = -GRID_HALF_SIZE; i <= GRID_HALF_SIZE; i++) {
    for (let j = -GRID_HALF_SIZE; j <= GRID_HALF_SIZE; j++) {
      lats.push(userLat + i * DEGREE_OFFSET);
      lons.push(userLon + j * DEGREE_OFFSET);
    }
  }

  const latString = lats.map(l => l.toFixed(4)).join(',');
  const lonString = lons.map(l => l.toFixed(4)).join(',');

  const url = `https://api.open-meteo.com/v1/forecast?latitude=${latString}&longitude=${lonString}&current=precipitation`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    
    const data = await res.json();
    
    // Open-Meteo returns an array of responses when querying multiple coordinates
    const responses = Array.isArray(data) ? data : [data];
    const cells: RealRainCell[] = [];

    responses.forEach((loc) => {
      if (loc && loc.current && loc.current.precipitation > 0) {
        const precip = loc.current.precipitation;
        let intensity: 'light' | 'moderate' | 'heavy' = 'light';
        
        if (precip >= 7.5) {
          intensity = 'heavy';
        } else if (precip >= 2.5) {
          intensity = 'moderate';
        }

        cells.push({
          latitude: loc.latitude,
          longitude: loc.longitude,
          intensity,
          precipitation: precip,
          source: 'Open-Meteo',
        });
      }
    });

    return {
      timestamp: new Date().toISOString(),
      cells,
    };
  } catch (error) {
    console.error('Failed to fetch spatial rain data:', error);
    throw error;
  }
}
