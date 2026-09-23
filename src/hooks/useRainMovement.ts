import { useState, useEffect, useRef } from 'react';
import { fetchSpatialRainData } from '../services/rainService';
import { clusterCells, calculateMovement, type TrackedCell, type MacroCell } from '../services/rainMovementService';
import { useGeolocation } from './useGeolocation';

const MAX_HISTORY = 4;
const POLL_INTERVAL_MS = 15 * 60 * 1000; // 15 minutes

export function useRainMovement() {
  const geo = useGeolocation();
  
  const [history, setHistory] = useState<{ timestamp: number; cells: MacroCell[] }[]>([]);
  const [trackedCells, setTrackedCells] = useState<TrackedCell[]>([]);
  const [isCollecting, setIsCollecting] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    // We need a valid location to track rain
    if (geo.lat === null || geo.lon === null || geo.loading) return;

    const lat = geo.lat;
    const lon = geo.lon;

    const fetchAndProcess = async () => {
      try {
        const rawData = await fetchSpatialRainData(lat, lon);
        
        // Group raw points into cohesive storm cells
        const macroCells = clusterCells(rawData.cells, 7.5);
        const timestamp = new Date(rawData.timestamp).getTime();

        setHistory(prevHistory => {
          const newHistory = [...prevHistory, { timestamp, cells: macroCells }];
          if (newHistory.length > MAX_HISTORY) {
            newHistory.shift(); // Keep only the last N observations
          }
          return newHistory;
        });
        
        setError(null);
      } catch (err) {
        console.error('Error in useRainMovement:', err);
        setError('Failed to fetch spatial rain data');
      }
    };

    fetchRef.current = fetchAndProcess;
    
    // Initial fetch
    fetchAndProcess();

    // Setup polling
    const intervalId = setInterval(() => {
      if (fetchRef.current) fetchRef.current();
    }, POLL_INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, [geo.lat, geo.lon, geo.loading]);

  useEffect(() => {
    if (history.length < 2) {
      setIsCollecting(true);
      setTrackedCells([]);
      // If we only have 1 observation, we can at least show the current static cells
      if (history.length === 1 && geo.lat !== null && geo.lon !== null) {
        const currentCells = history[0].cells.map(c => ({
          current: c,
          classification: 'UNCERTAIN' as const,
          confidence: 'LOW' as const,
          distanceToUserKm: 0 // Simplification for static view
        }));
        setTrackedCells(currentCells);
      }
      return;
    }

    setIsCollecting(false);

    if (geo.lat === null || geo.lon === null) return;

    const t0 = history[history.length - 2];
    const t1 = history[history.length - 1];

    const timeDiffHours = (t1.timestamp - t0.timestamp) / (1000 * 60 * 60);
    
    // Avoid division by zero if timestamps are identical
    if (timeDiffHours <= 0) return;

    const tracked = calculateMovement(t0.cells, t1.cells, timeDiffHours, geo.lat, geo.lon);
    setTrackedCells(tracked);

  }, [history, geo.lat, geo.lon]);

  return {
    trackedCells,
    isCollecting,
    error,
    historyCount: history.length,
  };
}
