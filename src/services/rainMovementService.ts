import type { RealRainCell } from './rainService';

export interface MacroCell {
  id: string;
  latitude: number;
  longitude: number;
  maxPrecipitation: number;
  avgPrecipitation: number;
  intensity: 'light' | 'moderate' | 'heavy';
  pointCount: number;
  areaKm2: number;
}

export type MovementClassification = 'APPROACHING' | 'AWAY' | 'CROSSING' | 'STATIONARY' | 'UNCERTAIN';
export type ConfidenceLevel = 'HIGH' | 'MODERATE' | 'LOW' | 'UNCERTAIN';

export interface ProjectedPath {
  intersectsUserArea: boolean;
  minArrivalMinutes?: number;
  maxArrivalMinutes?: number;
  estimatedPossibility: number;
  futurePositions: {
    minutes: number;
    latitude: number;
    longitude: number;
  }[];
}

export interface TrackedCell {
  current: MacroCell;
  previous?: MacroCell;
  speedKmh?: number;
  bearing?: number;
  direction?: string;
  classification: MovementClassification;
  confidence: ConfidenceLevel;
  distanceToUserKm: number;
  projection?: ProjectedPath;
}

// ─── Geo Math ─────────────────────────────────────────────────────────────────

const EARTH_RADIUS_KM = 6371;

function toRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

function toDeg(radians: number): number {
  return (radians * 180) / Math.PI;
}

export function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_KM * c;
}

export function getBearing(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const dLon = toRad(lon2 - lon1);
  const y = Math.sin(dLon) * Math.cos(toRad(lat2));
  const x =
    Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) -
    Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(dLon);
  let brng = toDeg(Math.atan2(y, x));
  return (brng + 360) % 360;
}

export function bearingToCompass(bearing: number): string {
  const val = Math.floor(bearing / 22.5 + 0.5);
  const arr = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  return arr[val % 16];
}

export function getDestinationPoint(lat: number, lon: number, bearing: number, distanceKm: number): [number, number] {
  const angularDistance = distanceKm / EARTH_RADIUS_KM;
  const lat1 = toRad(lat);
  const lon1 = toRad(lon);
  const brng = toRad(bearing);

  const lat2 = Math.asin(
    Math.sin(lat1) * Math.cos(angularDistance) +
    Math.cos(lat1) * Math.sin(angularDistance) * Math.cos(brng)
  );

  const lon2 = lon1 + Math.atan2(
    Math.sin(brng) * Math.sin(angularDistance) * Math.cos(lat1),
    Math.cos(angularDistance) - Math.sin(lat1) * Math.sin(lat2)
  );

  return [toDeg(lat2), toDeg(lon2)];
}

// ─── Clustering ───────────────────────────────────────────────────────────────

export function clusterCells(rawCells: RealRainCell[], thresholdKm = 7.5): MacroCell[] {
  if (rawCells.length === 0) return [];
  
  const visited = new Set<number>();
  const clusters: RealRainCell[][] = [];

  for (let i = 0; i < rawCells.length; i++) {
    if (visited.has(i)) continue;

    const cluster: RealRainCell[] = [];
    const queue = [i];
    visited.add(i);

    while (queue.length > 0) {
      const currentIdx = queue.shift()!;
      const currentCell = rawCells[currentIdx];
      cluster.push(currentCell);

      for (let j = 0; j < rawCells.length; j++) {
        if (visited.has(j)) continue;
        const neighbor = rawCells[j];
        const dist = getDistanceKm(currentCell.latitude, currentCell.longitude, neighbor.latitude, neighbor.longitude);
        if (dist <= thresholdKm) {
          visited.add(j);
          queue.push(j);
        }
      }
    }
    clusters.push(cluster);
  }

  // Convert clusters to MacroCells
  return clusters.map((cluster, idx) => {
    let sumLat = 0, sumLon = 0, sumPrecip = 0;
    let maxPrecip = 0;

    cluster.forEach(cell => {
      // Weighted center of mass based on precipitation intensity
      const weight = cell.precipitation;
      sumLat += cell.latitude * weight;
      sumLon += cell.longitude * weight;
      sumPrecip += weight;
      if (cell.precipitation > maxPrecip) maxPrecip = cell.precipitation;
    });

    const avgPrecip = sumPrecip / cluster.length;
    let intensity: 'light' | 'moderate' | 'heavy' = 'light';
    if (maxPrecip >= 7.5) intensity = 'heavy';
    else if (maxPrecip >= 2.5) intensity = 'moderate';

    return {
      id: `macro-${Date.now()}-${idx}`,
      latitude: sumLat / sumPrecip,
      longitude: sumLon / sumPrecip,
      maxPrecipitation: maxPrecip,
      avgPrecipitation: avgPrecip,
      intensity,
      pointCount: cluster.length,
      areaKm2: cluster.length * 25, // Each 5km grid point approx covers 25km^2
    };
  });
}

// ─── Movement Tracking ────────────────────────────────────────────────────────

export function calculateMovement(
  prevCells: MacroCell[],
  currCells: MacroCell[],
  timeDiffHours: number,
  userLat: number,
  userLon: number
): TrackedCell[] {
  const tracked: TrackedCell[] = [];

  // Greedy proximity matching
  const usedPrev = new Set<string>();

  currCells.forEach(curr => {
    let bestPrev: MacroCell | null = null;
    let minDistance = Infinity;

    for (const prev of prevCells) {
      if (usedPrev.has(prev.id)) continue;
      const dist = getDistanceKm(curr.latitude, curr.longitude, prev.latitude, prev.longitude);
      
      // Heuristic: Rain cells shouldn't move more than 100km/h
      const maxPossibleDist = 100 * timeDiffHours;
      
      if (dist < minDistance && dist <= maxPossibleDist) {
        minDistance = dist;
        bestPrev = prev;
      }
    }

    const distToUser = getDistanceKm(userLat, userLon, curr.latitude, curr.longitude);
    let classification: MovementClassification = 'UNCERTAIN';
    let confidence: ConfidenceLevel = 'LOW';
    let speedKmh: number | undefined;
    let bearing: number | undefined;
    let direction: string | undefined;
    let projection: ProjectedPath | undefined;

    if (bestPrev) {
      usedPrev.add(bestPrev.id);
      
      if (minDistance < 1) {
        // Less than 1km movement is stationary
        classification = 'STATIONARY';
        confidence = 'HIGH';
        speedKmh = 0;
      } else {
        speedKmh = minDistance / timeDiffHours;
        bearing = getBearing(bestPrev.latitude, bestPrev.longitude, curr.latitude, curr.longitude);
        direction = bearingToCompass(bearing);

        // Movement Classification based on vectors
        const prevDistToUser = getDistanceKm(userLat, userLon, bestPrev.latitude, bestPrev.longitude);
        
        // Simple classification: if distance is decreasing significantly, APPROACHING
        if (prevDistToUser - distToUser > 1) {
          classification = 'APPROACHING';
        } else if (distToUser - prevDistToUser > 1) {
          classification = 'AWAY';
        } else {
          classification = 'CROSSING';
        }

        confidence = 'MODERATE'; // With more history it could be HIGH

        // ─── Step 3C: Projection & ETA ───
        if (speedKmh > 0) {
          const futurePositions: ProjectedPath['futurePositions'] = [];
          const intervals = [15, 30, 45, 60];
          
          let intersectsUserArea = false;
          let minArrival: number | undefined;

          // Check if distance to user is already < 1km
          if (distToUser <= 1) {
            intersectsUserArea = true;
            minArrival = 0;
          }

          for (const mins of intervals) {
            const distMoved = speedKmh * (mins / 60);
            const [pLat, pLon] = getDestinationPoint(curr.latitude, curr.longitude, bearing, distMoved);
            futurePositions.push({ minutes: mins, latitude: pLat, longitude: pLon });

            const distToUserAtProj = getDistanceKm(userLat, userLon, pLat, pLon);
            // 1km radius intersection
            if (distToUserAtProj <= 1 && !intersectsUserArea) {
              intersectsUserArea = true;
            }
          }

          // More granular ETA logic using exact distance to edge
          if (classification === 'APPROACHING') {
            const distanceToEdge = Math.max(0, distToUser - 1);
            if (distanceToEdge > 0) {
              const exactHours = distanceToEdge / speedKmh;
              const exactMins = exactHours * 60;
              if (exactMins <= 90) { // Only reliable up to 1.5 hours
                intersectsUserArea = true;
                // Generate a window (e.g. 20-30 min) to reflect uncertainty
                minArrival = Math.max(0, Math.floor(exactMins / 10) * 10);
              }
            }
          }

          // Calculate Possibility Score
          let possibility = 0;
          if (intersectsUserArea) {
            possibility = 70; // Base score for intersecting
            if (curr.intensity === 'heavy') possibility += 20;
            else if (curr.intensity === 'moderate') possibility += 10;
            
            if (distToUser < 10) possibility += 10;
            if (confidence === ('HIGH' as ConfidenceLevel)) possibility += 5;
          } else {
            possibility = classification === 'CROSSING' ? 30 : 5;
            if (distToUser < 5) possibility += 20;
          }

          projection = {
            intersectsUserArea,
            minArrivalMinutes: minArrival,
            maxArrivalMinutes: minArrival !== undefined ? minArrival + 10 : undefined, // 10 min window
            estimatedPossibility: Math.min(100, Math.max(0, Math.round(possibility))),
            futurePositions
          };
          
          if (intersectsUserArea && classification === 'APPROACHING') {
            confidence = 'HIGH'; // Elevate confidence if it's a solid hit
          }
        }
      }
    } else {
      // New cell appeared
      classification = 'UNCERTAIN';
      confidence = 'UNCERTAIN';
    }

    tracked.push({
      current: curr,
      previous: bestPrev || undefined,
      speedKmh: speedKmh ? Math.round(speedKmh) : undefined,
      bearing: bearing ? Math.round(bearing) : undefined,
      direction,
      classification,
      confidence,
      distanceToUserKm: parseFloat(distToUser.toFixed(1)),
      projection,
    });
  });

  return tracked;
}
